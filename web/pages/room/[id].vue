<template>
  <div class="h-screen flex flex-col bg-canvas">
    <RoomHeader
      :room-name="roomId"
      :participant-count="participantCount"
      :status="connectionStatus"
      @copy-link="copyInviteLink"
    />

    <div class="flex-1 overflow-hidden relative">
      <VideoGrid
        :local-stream="localStream"
        :remote-stream="remoteStream"
        :remote-name="remoteName"
      />

      <ReconnectOverlay
        :is-reconnecting="connectionState === 'reconnecting'"
        :attempt="reconnectAttempt"
        :max-attempts="3"
        @give-up="handleHangup"
      />

      <div v-if="error" class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-danger text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
        {{ error }}
      </div>
    </div>

    <RoomFooter
      :is-muted="isMuted"
      :is-video-off="isVideoOff"
      @toggle-mute="toggleMute"
      @toggle-video="toggleVideo"
      @hangup="handleHangup"
    >
      <template #right-controls>
        <button
          @click="toggleChat"
          :class="['w-10 h-10 rounded-full flex items-center justify-center transition-colors', isChatOpen ? 'bg-accent text-white' : 'bg-white/10 text-fg-primary hover:bg-white/20']"
          title="Chat"
        >
          <MessageSquare class="w-5 h-5" />
        </button>
      </template>
    </RoomFooter>

    <BaseToast :show="showToast" message="Link copied to clipboard!" />
    <ChatSidebar :send-signal="send" :room-id="roomId" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
import { useWebRTC } from '~/composables/useWebRTC'
import { useSignaling } from '~/composables/useSignaling'
import { useAuth } from '~/composables/useAuth'
import { useChat } from '~/composables/useChat'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id as string
const { user } = useAuth()

const {
  connectionState, localStream, remoteStream, error: webrtcError,
  getMedia, createOffer, handleAnswer, addIceCandidate, hangup,
  toggleMute, toggleVideo, isMuted, isVideoOff,
} = useWebRTC()

const {
  isConnected, error: signalingError, connect, send, disconnect,
} = useSignaling()

const { isOpen: isChatOpen, toggle: toggleChat } = useChat()

const participantCount = ref(1)
const remoteName = ref('Remote')
const reconnectAttempt = ref(0)
const showToast = ref(false)

watch(connectionState, (state) => {
  if (state === 'reconnecting') reconnectAttempt.value++
  else if (state === 'connected') reconnectAttempt.value = 0
})

const connectionStatus = computed(() => {
  if (webrtcError.value || signalingError.value) return 'error'
  if (connectionState.value === 'connected') return 'connected'
  if (connectionState.value === 'connecting' || connectionState.value === 'signaling') return 'connecting'
  if (connectionState.value === 'reconnecting') return 'reconnecting'
  return 'idle'
})

const error = computed(() => webrtcError.value || signalingError.value)

onMounted(async () => {
  await getMedia()
  const userId = user.value?.uid || 'anonymous'
  const userName = user.value?.displayName || 'User'
  connect(roomId, userId, userName)
  window.addEventListener('signaling-message', handleSignalingMessage)
})

onUnmounted(() => {
  window.removeEventListener('signaling-message', handleSignalingMessage)
  disconnect()
  hangup()
})

function handleSignalingMessage(event: Event) {
  const message = (event as CustomEvent).detail
  switch (message.type) {
    case 'room-joined':
      participantCount.value = message.participants.length
      if (message.participants.length > 1) {
        createOffer().then(offer => {
          send({ type: 'offer', roomId, from: user.value?.uid || 'anonymous', sdp: offer })
        })
      }
      break
    case 'participant-joined':
      participantCount.value++
      if (message.displayName) remoteName.value = message.displayName
      break
    case 'participant-left':
      participantCount.value--
      break
    case 'offer':
      handleAnswer(message.sdp).then(answer => {
        send({ type: 'answer', roomId, from: user.value?.uid || 'anonymous', sdp: answer })
      })
      break
    case 'answer':
      handleAnswer(message.sdp)
      break
    case 'ice-candidate':
      addIceCandidate(message.candidate)
      break
  }
}

function handleHangup() {
  send({ type: 'leave-room', roomId, from: user.value?.uid || 'anonymous' })
  hangup()
  disconnect()
  router.push('/')
}

function copyInviteLink() {
  const url = `${window.location.origin}/room/${roomId}`
  navigator.clipboard.writeText(url)
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}
</script>
