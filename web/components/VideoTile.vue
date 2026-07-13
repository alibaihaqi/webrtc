<template>
  <div class="relative bg-gray-900 rounded-lg overflow-hidden">
    <video
      ref="videoRef"
      autoplay
      :muted="muted"
      playsinline
      class="w-full h-full object-cover"
    />
    <div class="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
      {{ name }}
    </div>
    <div v-if="!stream" class="absolute inset-0 flex items-center justify-center">
      <div class="text-white text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>{{ placeholder }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  stream: MediaStream | null
  name: string
  muted?: boolean
  placeholder?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)

watch(() => props.stream, (stream) => {
  if (videoRef.value && stream) {
    videoRef.value.srcObject = stream
  }
}, { immediate: true })
</script>
