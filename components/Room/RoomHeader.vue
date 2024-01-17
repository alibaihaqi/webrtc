<template>
  <div class="self-center py-1 px-4 sm:px-8 mt-2 rounded-md">
    <p class="text-sm text-white">
      Room ID: <span class="hover:text-blue-400 hover:cursor-pointer">
        {{ roomStore.roomId }}
      </span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useRoomStore } from '@/stores/room.store'

const roomStore = useRoomStore()
</script>
