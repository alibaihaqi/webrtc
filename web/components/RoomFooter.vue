<template>
  <footer class="flex items-center justify-center gap-3 h-16 bg-canvas/80 backdrop-blur border-t border-white/10 px-4">
    <button
      @click="$emit('toggleMute')"
      :class="['w-10 h-10 rounded-full flex items-center justify-center transition-colors', isMuted ? 'bg-danger text-white' : 'bg-white/10 text-fg-primary hover:bg-white/20']"
      :title="isMuted ? 'Unmute' : 'Mute'"
    >
      <MicOff v-if="isMuted" class="w-5 h-5" />
      <Mic v-else class="w-5 h-5" />
    </button>

    <button
      @click="$emit('toggleVideo')"
      :class="['w-10 h-10 rounded-full flex items-center justify-center transition-colors', isVideoOff ? 'bg-danger text-white' : 'bg-white/10 text-fg-primary hover:bg-white/20']"
      :title="isVideoOff ? 'Turn on camera' : 'Turn off camera'"
    >
      <VideoOff v-if="isVideoOff" class="w-5 h-5" />
      <Video v-else class="w-5 h-5" />
    </button>

    <button
      class="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-fg-primary hover:bg-white/20 transition-colors opacity-50 cursor-not-allowed"
      title="Screen share (coming soon)"
      disabled
    >
      <Monitor class="w-5 h-5" />
    </button>

    <button
      @click="$emit('hangup')"
      class="w-12 h-12 rounded-full flex items-center justify-center bg-danger text-white hover:bg-danger/80 transition-colors ml-2"
      title="End call"
    >
      <PhoneOff class="w-5 h-5" />
    </button>

    <div class="w-px h-6 bg-white/10 mx-2"></div>

    <slot name="right-controls" />
  </footer>
</template>

<script setup lang="ts">
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from 'lucide-vue-next'

defineProps<{
  isMuted: boolean
  isVideoOff: boolean
}>()

defineEmits<{
  toggleMute: []
  toggleVideo: []
  hangup: []
}>()
</script>
