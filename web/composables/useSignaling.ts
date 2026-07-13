import { ref, readonly, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import type { ConnectionState } from './useWebRTC'

export interface SignalMessage {
  type: string
  roomId: string
  from: string
  timestamp: number
  [key: string]: unknown
}

export function useSignaling(signalConnectionState?: Ref<ConnectionState>) {
  const isConnected = ref(false)
  const error: Ref<string | null> = ref(null)
  const lastMessage: Ref<SignalMessage | null> = ref(null)
  const reconnecting = ref(false)
  const reconnectAttempts = ref(0)
  const reconnectTimer: Ref<ReturnType<typeof setTimeout> | null> = ref(null)

  let ws: WebSocket | null = null
  let maxReconnectAttempts = 5
  let maxReconnectDelay = 30000
  let reconnectDelay = 1000

  function connect(roomId: string, userId: string, displayName: string) {
    const config = useRuntimeConfig()
    const wsUrl = config.public.wsUrl

    ws = new WebSocket(`${wsUrl}?roomId=${roomId}&userId=${userId}&displayName=${encodeURIComponent(displayName)}`)

    ws.onopen = () => {
      isConnected.value = true
      reconnecting.value = false
      reconnectAttempts.value = 0
      cleanupReconnectTimer()
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const message: SignalMessage = JSON.parse(event.data)
        lastMessage.value = message
        window.dispatchEvent(new CustomEvent('signaling-message', { detail: message }))
      } catch (e) {
        console.error('Failed to parse message:', e)
      }
    }

    ws.onclose = () => {
      isConnected.value = false
      console.log('WebSocket disconnected')

      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnecting.value = true
        const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts.value), maxReconnectDelay)
        reconnectTimer.value = setTimeout(() => {
          reconnectAttempts.value++
          connect(roomId, userId, displayName)
        }, delay)
      } else {
        reconnecting.value = false
      }
    }

    ws.onerror = (e) => {
      error.value = 'WebSocket error'
      console.error('WebSocket error:', e)
    }
  }

  function send(message: Omit<SignalMessage, 'timestamp'>) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ ...message, timestamp: Date.now() }))
    }
  }

  function cleanupReconnectTimer() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  function disconnect() {
    cleanupReconnectTimer()
    if (ws) {
      ws.close()
      ws = null
    }
    isConnected.value = false
    reconnecting.value = false
    reconnectAttempts.value = maxReconnectAttempts
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    error,
    lastMessage,
    reconnecting: readonly(reconnecting),
    reconnectAttempts: readonly(reconnectAttempts),
    connect,
    send,
    disconnect,
  }
}
