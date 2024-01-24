<template>
  <CommonLayout class="items-center justify-center">
    <PrepareContent />
  </CommonLayout>
</template>

<script lang="ts" setup>
import CommonLayout from '@/components/Layout/CommonLayout.vue'
import PrepareContent from '@/components/Prepare/PrepareContent.vue'

useHead({
  titleTemplate: '%s | Prepare',
})
</script>

