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

<script lang="ts" setup>
import RoomButton from '@/components/Room/RoomButton.vue'
import {
  MICROPHONE_ICON_SETS,
  VIDEO_ICON_SETS,
} from '@/constants/icon.constant'
import type { TActionButton } from '@/interfaces/room.interface'
import { useRoomStore } from '@/stores/room.store'
import { disconnectWebSocket } from '@/utils/ws.util'

const router = useRouter()
const roomStore = useRoomStore()

const onButtonClickHandler = (action: TActionButton) => {
  roomStore[action]()
}

const onLeaveMeetingRoom = async () => {
  try {
    disconnectWebSocket()
    await router.replace('/')
  } catch (error) {
    console.log('Log Error:', error)
  }
}
</script>
