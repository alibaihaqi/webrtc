<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="isOpen"
      class="w-80 h-full bg-canvas/95 backdrop-blur border-l border-white/10 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 h-12 border-b border-white/10">
        <span class="text-sm font-medium text-fg-primary">Chat</span>
        <button @click="toggle" class="text-fg-secondary hover:text-fg-primary transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div v-if="messages.length === 0" class="text-center text-fg-secondary/50 text-sm py-8">
          No messages yet
        </div>
        <div v-for="msg in messages" :key="msg.id" class="flex flex-col">
          <div class="flex items-baseline gap-2">
            <span class="text-xs font-medium text-fg-secondary">{{ msg.senderName }}</span>
            <span class="text-xs text-fg-secondary/30">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <p class="text-sm text-fg-primary mt-0.5">{{ msg.text }}</p>
        </div>
      </div>

      <!-- Input -->
      <div class="px-3 pb-3">
        <div class="flex gap-2">
          <BaseInput
            v-model="newMessage"
            placeholder="Type a message..."
            @keyup.enter="handleSend"
          />
          <button
            @click="handleSend"
            :disabled="!newMessage.trim()"
            class="px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import { useChat } from '~/composables/useChat'
import { useAuth } from '~/composables/useAuth'
import type { SignalMessage } from '~/composables/useSignaling'

const props = defineProps<{
  sendSignal: (msg: Omit<SignalMessage, 'timestamp'>) => void
  roomId: string
}>()

const { messages, isOpen, toggle, sendMessage } = useChat()
const { user } = useAuth()

const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

function handleSend() {
  if (!newMessage.value.trim()) return
  sendMessage(
    newMessage.value,
    user.value?.uid || 'anonymous',
    user.value?.displayName || 'User',
    props.sendSignal,
    props.roomId,
  )
  newMessage.value = ''
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })
</script>
