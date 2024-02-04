<template>
  <div class="hidden sm:inline-flex sm:w-52 md:w-80 flex flex-col flex-1 bg-gray-700">
    <RoomSideInfoHeader
      :title="`Participants (${ roomUsers?.length })`"
      :btn-action="setIsShowParticipants"
    />

    <section class="flex-1 border-2 border-blue-800 p-2">
      <div
        v-for="participant in roomUsers"
        :key="participant.connectionId"
        class="px-2 py-2 border-b border-white hover:bg-gray-600"
      >
        <p class="text-sm">
          {{ participant?.name }}
        </p>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import RoomSideInfoHeader from '@/components/Room/RoomSideInfoHeader.vue'
import type { IRoomUser } from '@/interfaces/room.interface'

defineProps<{
  roomUsers: IRoomUser[]
  setIsShowParticipants: () => void
}>()
</script>
