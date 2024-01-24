<template>
  <CommonLayout class="flex-col justify-center">
    <RoomContent />
    <RoomFooter />
  </CommonLayout>
</template>

<script lang="ts" setup>
import CommonLayout from '@/components/Layout/CommonLayout.vue'
import RoomContent from '@/components/Room/RoomContent.vue'
import RoomFooter from '@/components/Room/RoomFooter.vue'
import { getStreamPreview } from '@/utils/rtc.util'

useHead({
  titleTemplate: '%s | Room',
})

onMounted(() => {
  initiateRoom()
})

const initiateRoom = async () => {
  getStreamPreview()
}
</script>
