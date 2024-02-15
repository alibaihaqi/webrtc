<template>
  <div class="flex flex-1 bg-gray-800 text-white">
    <section id="videos_container" />

    <section class="flex flex-col">
      <RoomParticipants
        v-if="roomStore.isShowParticipants"
        :class="isOpenContentChatParticipants ? 'max-h-[50%]': 'max-h-full'"
        :room-users="roomStore.roomUsers"
        :set-is-show-participants="roomStore.setIsShowParticipants"
      />
      <RoomChat
        v-if="roomStore.isShowRoomChats"
        :class="isOpenContentChatParticipants ? 'max-h-[50%]': 'max-h-full'"
        :author-socket-id="roomStore.socketId"
        :chat-messages="roomStore.messages"
        :set-show-room-chats="roomStore.setIsShowRoomChats"
      />
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import RoomChat from '@/components/Room/RoomChat.vue'
import RoomParticipants from '@/components/Room/RoomParticipants.vue'
import { useRoomStore } from '@/stores/room.store'

const roomStore = useRoomStore()

const isOpenContentChatParticipants = computed(() => {
  return roomStore.isShowParticipants && roomStore.isShowRoomChats
})
</script>

<style>
.videos_container_styles {
  @apply flex flex-1 flex-col sm:flex-row flex-wrap max-w-[98%] mx-auto gap-2 justify-center items-center
}

.video_container_style {
  @apply flex flex-col
}

.video_container_style:first-child:nth-last-child(1) {
  @apply w-[80%]
}

.video_container_style:first-child:nth-last-child(2),
.video_container_style:first-child:nth-last-child(2) ~ .video_container_style {
  @apply w-[48%] h-[48%]
}

.video_container_style:first-child:nth-last-child(3),
.video_container_style:first-child:nth-last-child(3) ~ .video_container_style {
  @apply w-[40%] h-[40%]
}

.video_container_style:first-child:nth-last-child(4),
.video_container_style:first-child:nth-last-child(4) ~ .video_container_style {
  @apply w-[48%] h-[48%]
}
</style>