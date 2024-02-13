<script lang="ts" setup>
import CommonLayout from '@/components/Layout/CommonLayout.vue'
import PrepareContent from '@/components/Prepare/PrepareContent.vue'
import { initiateSocket } from '@/utils/ws.util'

useHead({
  titleTemplate: '%s | Prepare',
})

onMounted(() => {
  initiateSocket()
})
</script>


<template>
  <CommonLayout class="items-center justify-center">
    <PrepareContent />
  </CommonLayout>
</template>
