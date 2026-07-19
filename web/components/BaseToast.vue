<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div v-if="show" class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-frost-blue text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
}>()
</script>
