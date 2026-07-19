import { ref, onMounted, onUnmounted } from 'vue'

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

  function sendMessage(text: string, senderId: string, senderName: string) {
    if (!text.trim()) return

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId,
      senderName,
      text: text.trim(),
      timestamp: Date.now(),
    }

    messages.value.push(msg)

    window.dispatchEvent(new CustomEvent('chat-send', { detail: msg }))
  }

  function handleMessage(event: Event) {
    const msg = (event as CustomEvent).detail as ChatMessage
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg)
    }
  }

  onMounted(() => {
    window.addEventListener('chat-message', handleMessage)
  })

  onUnmounted(() => {
    window.removeEventListener('chat-message', handleMessage)
  })

  return { messages, isOpen, toggle, sendMessage }
}
