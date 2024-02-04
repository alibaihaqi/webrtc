<template>
  <div class="flex flex-1 bg-gray-800 text-white">
    <section class="flex flex-col flex-1">
      <RoomHeader />

      <section id="videos_container" />
    </section>

    <section class="flex flex-col">
      <RoomParticipants
        v-if="roomStore.isShowParticipants"
        :room-users="roomStore.roomUsers"
        :set-is-show-participants="roomStore.setIsShowParticipants"
      />
    </section>
  </div>
</template>

<script lang="ts" setup>
import RoomHeader from '@/components/Room/RoomHeader.vue'
import RoomParticipants from '@/components/Room/RoomParticipants.vue'
import { useRoomStore } from '@/stores/room.store'

const roomStore = useRoomStore()
</script>

<style>
.videos_container_styles {
  @apply flex flex-col sm:flex-row flex-wrap flex-1 w-[95%] mx-auto py-2 gap-2 justify-center;
}

.video_container_style {
  @apply flex flex-1 justify-center;
}
</style>