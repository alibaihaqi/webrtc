<template>
  <BaseCard class="flex flex-col items-center text-center">
    <div class="w-12 h-12 rounded-full bg-frost-blue/20 flex items-center justify-center mb-4">
      <Video class="w-6 h-6 text-frost-blue" />
    </div>
    <h2 class="text-lg font-semibold text-frost-white mb-1">New Meeting</h2>
    <p class="text-sm text-frost-teal mb-4">Start an instant meeting room</p>
    <BaseButton @click="startMeeting">Start Meeting</BaseButton>
  </BaseCard>
</template>

<script setup lang="ts">
import { Video } from 'lucide-vue-next'

function startMeeting() {
  const id = crypto.randomUUID()
  navigateTo(`/room/${id}`)
}
</script>
