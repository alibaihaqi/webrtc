<template>
  <div :class="gridClasses">
    <VideoTile
      :stream="localStream"
      name="You"
      :muted="true"
      placeholder="Camera off"
    />
    <VideoTile
      v-if="remoteStream"
      :stream="remoteStream"
      :name="remoteName"
      placeholder="Waiting for remote participant..."
    />
    <div v-else class="relative bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-frost-teal mx-auto mb-4"></div>
        <p class="text-frost-teal text-sm">Waiting for remote participant...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  remoteName?: string
}>()

const gridClasses = computed(() => {
  if (!props.remoteStream) {
    return 'flex items-center justify-center h-full p-4'
  }
  return 'grid grid-cols-2 gap-4 p-4 h-full'
})
</script>
