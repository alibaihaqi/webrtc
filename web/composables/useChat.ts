import { ref, onMounted, onUnmounted } from 'vue'
import type { SignalMessage } from './useSignaling'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: number
}

const messages = ref<ChatMessage[]>([])
const isOpen = ref(false)

export function useChat() {
  function toggle() {
    isOpen.value = !isOpen.value
  }

  function sendMessage(
    text: string,
    senderId: string,
    senderName: string,
    sendSignal: (msg: Omit<SignalMessage, 'timestamp'>) => void,
    roomId: string,
  ) {
    if (!text.trim()) return

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId,
      senderName,
      text: text.trim(),
      timestamp: Date.now(),
    }

    messages.value.push(msg)

    sendSignal({
      type: 'chat-message',
      roomId,
      from: senderId,
      senderName,
      text: msg.text,
      chatId: msg.id,
    })
  }

  function handleSignalingMessage(event: Event) {
    const message = (event as CustomEvent).detail as SignalMessage
    if (message.type !== 'chat-message') return

    const msg: ChatMessage = {
      id: message.chatId as string,
      senderId: message.from,
      senderName: (message.senderName as string) || 'Remote',
      text: message.text as string,
      timestamp: message.timestamp,
    }

    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg)
    }
  }

  onMounted(() => {
    window.addEventListener('signaling-message', handleSignalingMessage)
  })

  onUnmounted(() => {
    window.removeEventListener('signaling-message', handleSignalingMessage)
  })

  return { messages, isOpen, toggle, sendMessage }
}
