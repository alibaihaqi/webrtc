<script lang="ts" setup>
import HomeContent from '@/components/Home/HomeContent.vue'
import CommonLayout from '@/components/Layout/CommonLayout.vue'

useHead({
  titleTemplate: '%s | Dashboard',
})
</script>

<template>
  <CommonLayout class="items-center justify-center">
    <HomeContent />
  </CommonLayout>
</template>
