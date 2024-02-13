<template>
  <section class="flex flex-col flex-1 px-2 pb-2 gap-2 overflow-hidden overflow-y-auto">
    <div
      v-for="(message, idx) in messages"
      :key="idx"
      class="flex flex-col gap-1"
      :class="isAuthorSocketId(message) ? 'items-end text-right' : 'items-start text-left'"
    >
      <p
        v-if="idx === 0 || idx > 0 && !(message.socketId === messages[idx - 1].socketId)"
        class="text-xs"
      >
        {{ getAuthorMessage(message) }}
      </p>
      <div
        class="p-2 rounded-md max-w-[60%]"
        :class="isAuthorSocketId(message) ? 'bg-blue-500' : 'bg-blue-400'"
      >
        <p class="text-sm text-gray-100 break-all">
          {{ message.content }}
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { IChatMessage } from '@/interfaces/room.interface';

const props = defineProps<{
  authorSocketId: string
  messages: IChatMessage[]
}>()

const isAuthorSocketId = (message: IChatMessage): boolean => {
  return message.socketId === props.authorSocketId
}

const getAuthorMessage = (message: IChatMessage) => {
  return isAuthorSocketId(message) ? 'You' : message.name
}
</script>
