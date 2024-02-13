<script lang="ts" setup>
import Button from '@/components/Common/Button.vue'
import { useRoomStore } from '@/stores/room.store'
import { checkAvailabilityRoom } from '@/utils/rest.util'
import { disconnectWebSocket } from '@/utils/ws.util'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()

const roomId = ref('')

const isHostMeeting = computed(() => route.query?.host === 'true')

const generateTitle = computed(() => {
  return isHostMeeting.value ? 'Host' : 'Join'
})

const onCancelButtonHandler = async () => {
  disconnectWebSocket()
  router.back()
}

const onClickButtonHandler = async () => {
  try {
    if (!isHostMeeting.value) {
      const result: any = await checkAvailabilityRoom({
        isHostMeeting: isHostMeeting.value,
        roomId: roomId.value,
      })

      if (!result?.success) {
        alert('Room is not found')
        return
      }
    }

    await router.replace('/room')
  } catch (error) {
    console.log('router error:', error)
  }
}
</script>

<template>
  <section
    :class="`
      flex flex-col justify-between gap-8 w-[90%] max-w-md min-h-80
      p-8 border border-blue-500 rounded-lg shadow-md
    `"
  >
    <h1 class="font-bold text-3xl text-blue-500">
      {{ generateTitle }} Meeting
    </h1>

    <div
      v-if="!isHostMeeting"
      class="flex flex-col gap-4 w-full"
    >
      <div class="flex flex-col gap-2">
        <p class="text-sm text-gray-700">
          Room ID
        </p>

        <input
          v-model="roomId"
          class="border border-blue-500 px-4 py-2 text-sm rounded-md focus:ring-1 focus:ring-sky-500"
          placeholder="Enter room ID"
          type="text"
        />
      </div>
    </div>

    <div class="flex gap-4">
      <Button
        class="flex-1"
        title="Cancel"
        btn-type="secondary"
        @on-click="onCancelButtonHandler"
      />
      <Button
        class="flex-1"
        :title="generateTitle"
        :disabled="roomStore.isDisableToRoomButton"
        @on-click="onClickButtonHandler"
      />
    </div>
  </section>
</template>
