<script lang="ts" setup>
import RoomButton from '@/components/Room/RoomButton.vue'
import {
  CHAT_ICON_SETS,
  MICROPHONE_ICON_SETS,
  PARTICIPANTS_ICON_SETS,
  VIDEO_ICON_SETS,
} from '@/constants/icon.constant'
import type { TActionButton } from '@/interfaces/room.interface'
import { useRoomStore } from '@/stores/room.store'

defineProps<{
  onLeaveMeetingRoom: any
}>()
const roomStore = useRoomStore()

const onButtonClickHandler = (action: TActionButton) => {
  roomStore[action]()
}
</script>

<template>
  <footer class="flex justify-around sm:justify-between items-center bg-gray-900 pt-1">
    <section class="flex gap-1 sm:gap-2">
      <RoomButton
        :isActive="roomStore.isMicrophoneActive"
        :sources="MICROPHONE_ICON_SETS"
        @onClick="onButtonClickHandler('setMicrophone')"
      />

      <RoomButton
        :isActive="roomStore.isVideoActive"
        :sources="VIDEO_ICON_SETS"
        @onClick="onButtonClickHandler('setVideo')"
      />
    </section>

    <section class="flex">
      <RoomButton
        class="hidden sm:inline-flex"
        :isActive="roomStore.isShowParticipants"
        :sources="PARTICIPANTS_ICON_SETS"
        @onClick="onButtonClickHandler('setIsShowParticipants')"
      />
      <RoomButton
        class="hidden sm:inline-flex"
        :isActive="roomStore.isShowRoomChats"
        :sources="CHAT_ICON_SETS"
        @onClick="onButtonClickHandler('setIsShowRoomChats')"
      />
    </section>

    <section class="px-2">
      <button
        class="bg-red-500 text-sm text-white px-4 py-1 rounded-md"
        @click="onLeaveMeetingRoom"
      >
        End
      </button>
    </section>
  </footer>
</template>

