<template>
  <div class="relative inline-flex items-center justify-center rounded-full bg-frost-blue/20 text-frost-teal font-medium select-none" :class="sizeClasses">
    <span>{{ initials }}</span>
    <div v-if="online" class="absolute bottom-0 right-0 w-3 h-3 bg-frost-teal rounded-full border-2 border-slate-900"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
}>(), {
  size: 'md',
  online: false,
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-8 h-8 text-xs'
    case 'md': return 'w-10 h-10 text-sm'
    case 'lg': return 'w-12 h-12 text-base'
  }
})
</script>
