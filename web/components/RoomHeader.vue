<template>
  <div class="flex items-center justify-between p-4 bg-gray-800 text-white">
    <div class="flex items-center space-x-4">
      <h1 class="text-lg font-semibold">{{ roomName }}</h1>
      <span class="text-gray-400">{{ participantCount }} participants</span>
    </div>
    <div class="flex items-center space-x-4">
      <div :class="['px-2 py-1 rounded text-sm', statusColor]">
        {{ status }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  roomName: string
  participantCount: number
  status: string
}>()

const statusColor = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-green-500'
    case 'connecting':
      return 'bg-yellow-500'
    case 'reconnecting':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
})
</script>
