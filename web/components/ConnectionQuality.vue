<template>
  <div class="flex items-center space-x-2">
    <div :class="['w-3 h-3 rounded-full', indicatorColor]"></div>
    <span class="text-sm text-gray-400">{{ qualityText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QualityLevel } from '~/composables/useQuality'

const props = defineProps<{
  level: QualityLevel
  bitrate: number
  packetLoss: number
}>()

const indicatorColor = computed(() => {
  switch (props.level) {
    case 'good':
      return 'bg-green-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'poor':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
})

const qualityText = computed(() => {
  if (props.packetLoss > 5) return 'Poor connection'
  if (props.packetLoss > 1) return 'Fair connection'
  return 'Good connection'
})
</script>
