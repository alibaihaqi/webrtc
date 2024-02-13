<template>
  <section class="flex items-center gap-1 bg-gray-600 p-2 rounded">
    <input
      v-model="message"
      class="w-full px-2 py-1 border rounded-md text-gray-800 text-xs"
      placeholder="Type message here..."
      @keypress="onPressInputHandler"
    />

    <button
      class="p-2 hover:bg-gray-400 hover:cursor-pointer rounded-full"
      @click="onSendMessageHandler"
    >
      <nuxt-img
        alt="Send Message"
        class="w-4"
        src="/icons/send.svg"
      />
    </button>
  </section>
</template>

<script lang="ts" setup>
import { useChatMessage } from '@/composables/room.composable'
import type { IChatMessage } from '@/interfaces/room.interface'
import { sendMessageUsingDataChannel } from '@/utils/rtc.util'

const props = defineProps<{
  authorSocketId: string
}>()
const message = useChatMessage()

const onPressInputHandler = (event: KeyboardEvent) => {
  if (event.code !== 'Enter') return

  event.preventDefault()
  onSendMessageHandler()
}

const onSendMessageHandler = () => {
  if (message.value.length === 0) return

  const messageData: IChatMessage = {
    socketId: props.authorSocketId,
    name: '',
    content: message.value,
  }

  sendMessageUsingDataChannel(messageData)
  message.value = ''
}
</script>
