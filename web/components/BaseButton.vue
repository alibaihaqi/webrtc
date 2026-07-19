<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-frost-blue disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-sm rounded-md'
    case 'md': return 'px-4 py-2 text-sm rounded-lg'
    case 'lg': return 'px-6 py-3 text-base rounded-lg'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary': return 'bg-frost-blue text-white hover:bg-frost-blue/80 focus:ring-frost-blue'
    case 'danger': return 'bg-frost-red text-white hover:bg-frost-red/80 focus:ring-frost-red'
    case 'ghost': return 'bg-transparent text-frost-teal hover:bg-white/10 focus:ring-frost-teal'
  }
})
</script>
