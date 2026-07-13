<template>
  <div class="grid grid-cols-2 gap-4 p-4 h-full">
    <div class="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref="localVideoRef"
        autoplay
        muted
        playsinline
        class="w-full h-full object-cover"
      />
      <div class="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        You
      </div>
    </div>
    <div class="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref="remoteVideoRef"
        autoplay
        playsinline
        class="w-full h-full object-cover"
      />
      <div class="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        Remote
      </div>
      <div v-if="!remoteStream" class="absolute inset-0 flex items-center justify-center">
        <div class="text-white text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Waiting for remote participant...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}>()

const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)

watch(() => props.localStream, (stream) => {
  if (localVideoRef.value && stream) {
    localVideoRef.value.srcObject = stream
  }
}, { immediate: true })

watch(() => props.remoteStream, (stream) => {
  if (remoteVideoRef.value && stream) {
    remoteVideoRef.value.srcObject = stream
  }
}, { immediate: true })
</script>
