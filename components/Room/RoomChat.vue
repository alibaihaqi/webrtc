<template>
  <div class="hidden sm:inline-flex sm:w-52 md:w-80 flex flex-col flex-1 bg-gray-700 border-t border-white">
    <RoomSideInfoHeader
      title="Chats"
      :btn-action="setShowRoomChats"
    />

    <RoomChatMessages
      :author-socket-id="authorSocketId"
      :messages="chatMessages"
    />

    <RoomChatNewMessage
      :author-socket-id="authorSocketId"
    />
  </div>
</template>

<script lang="ts" setup>
import RoomSideInfoHeader from '@/components/Room/RoomSideInfoHeader.vue'
import RoomChatMessages from '@/components/Room/RoomChatMessages.vue'
import RoomChatNewMessage from '@/components/Room/RoomChatNewMessage.vue'
import type { IChatMessage } from '@/interfaces/room.interface'

defineProps<{
  authorSocketId: string
  chatMessages: IChatMessage[]
  setShowRoomChats: () => void
}>()
</script>
