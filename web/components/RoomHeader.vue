<template>
  <header class="flex items-center justify-between h-14 px-4 bg-slate-900/80 backdrop-blur border-b border-white/10">
    <div class="flex items-center gap-3">
      <h1 class="text-sm font-medium text-frost-white">{{ roomName }}</h1>
      <span class="text-xs text-frost-teal">{{ participantCount }} participants</span>
    </div>
    <div class="flex items-center gap-3">
      <div :class="['flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', statusClasses]">
        <div :class="['w-2 h-2 rounded-full', dotColor]"></div>
        {{ status }}
      </div>
      <BaseButton variant="ghost" size="sm" @click="$emit('copyLink')">
        <LinkIcon class="w-4 h-4 mr-1" />
        Copy Link
      </BaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Link as LinkIcon } from 'lucide-vue-next'

const props = defineProps<{
  roomName: string
  participantCount: number
  status: string
}>()

defineEmits<{
  copyLink: []
}>()

const statusClasses = computed(() => {
  switch (props.status) {
    case 'connected': return 'bg-frost-teal/20 text-frost-teal'
    case 'connecting': return 'bg-frost-blue/20 text-frost-blue'
    case 'reconnecting': return 'bg-frost-red/20 text-frost-red'
    default: return 'bg-white/10 text-frost-teal/50'
  }
})

const dotColor = computed(() => {
  switch (props.status) {
    case 'connected': return 'bg-frost-teal'
    case 'connecting': return 'bg-frost-blue'
    case 'reconnecting': return 'bg-frost-red'
    default: return 'bg-frost-teal/30'
  }
})
</script>
