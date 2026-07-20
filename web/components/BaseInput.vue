<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :placeholder="placeholder"
    class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-fg-primary placeholder-fg-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
