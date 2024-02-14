<template>
  <header class="flex justify-center items-center bg-gray-800">
    <div class="py-1 px-4 sm:px-8 mt-2 rounded-md">
      <p class="text-sm text-white">
        <span>Room ID: </span>
        <span class="hover:text-blue-400 hover:cursor-pointer">
          {{ roomId }}
        </span>
      </p>
    </div>
  </header>
</template>

<script lang="ts" setup>
defineProps<{
  roomId: string
}>()


</script>
