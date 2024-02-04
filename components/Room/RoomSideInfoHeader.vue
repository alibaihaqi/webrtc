<template>
  <section class="flex items-center py-2 px-4">
    <p class="flex-1 text-gray-100 text-sm text-center">
      {{ title }}
    </p>

    <button
      class="py-1 px-4 bg-red-600 text-xs rounded-md"
      @click="btnAction"
    >
      Close
    </button>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  btnAction: any
}>()
</script>