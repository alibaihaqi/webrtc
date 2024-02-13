<script lang="ts" setup>
import CommonLayout from '@/components/Layout/CommonLayout.vue'
import RoomContent from '@/components/Room/RoomContent.vue'
import RoomFooter from '@/components/Room/RoomFooter.vue'
import { getStreamPreview } from '@/utils/rtc.util'
import { disconnectWebSocket } from '@/utils/ws.util'

const router = useRouter()

useHead({
  titleTemplate: '%s | Room',
})

onMounted(() => {
  initiateRoom()
})

const initiateRoom = async () => {
  getStreamPreview()
}

const onLeaveMeetingRoom = async () => {
  try {
    disconnectWebSocket()
    await router.replace('/')
  } catch (error) {
    console.log('route Error:', error)
  }
}

onUnmounted(() => {
  onLeaveMeetingRoom()
})
</script>

<template>
  <CommonLayout class="flex-col justify-center">
    <RoomContent />
    <RoomFooter :on-leave-meeting-room="onLeaveMeetingRoom" />
  </CommonLayout>
</template>
