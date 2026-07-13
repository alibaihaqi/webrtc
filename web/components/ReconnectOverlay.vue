<template>
  <div v-if="isReconnecting" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold text-white mb-2">Reconnecting...</h2>
      <p class="text-gray-400">Attempt {{ attempt }} of {{ maxAttempts }}</p>
      <button
        v-if="attempt >= maxAttempts"
        @click="$emit('giveUp')"
        class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        End Call
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isReconnecting: boolean
  attempt: number
  maxAttempts: number
}>()

defineEmits<{
  giveUp: []
}>()
</script>
