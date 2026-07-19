<template>
  <BaseCard class="flex flex-col items-center text-center">
    <div class="w-12 h-12 rounded-full bg-frost-teal/20 flex items-center justify-center mb-4">
      <LogIn class="w-6 h-6 text-frost-teal" />
    </div>
    <h2 class="text-lg font-semibold text-frost-white mb-1">Join Meeting</h2>
    <p class="text-sm text-frost-teal mb-4">Enter room code or link</p>
    <div class="flex w-full gap-2">
      <BaseInput
        v-model="roomInput"
        placeholder="Paste room code or link"
        @keyup.enter="joinMeeting"
      />
      <BaseButton @click="joinMeeting">Join</BaseButton>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LogIn } from 'lucide-vue-next'

const roomInput = ref('')

function joinMeeting() {
  const input = roomInput.value.trim()
  if (!input) return

  const match = input.match(/\/room\/([a-zA-Z0-9-]+)/)
  const roomId = match ? match[1] : input

  if (roomId) {
    navigateTo(`/room/${roomId}`)
  }
}
</script>
