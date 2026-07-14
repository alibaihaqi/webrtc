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

const RECONNECT_MAX_ATTEMPTS = 5
const RECONNECT_BASE_DELAY = 1000
const RECONNECT_MAX_DELAY = 16000

export function useSignaling(signalConnectionState?: Ref<ConnectionState>) {
  const isConnected = ref(false)
  const error: Ref<string | null> = ref(null)
  const lastMessage: Ref<SignalMessage | null> = ref(null)
  const reconnecting = ref(false)
  const reconnectAttempts = ref(0)
  const reconnectFailed = ref(false)
  const reconnectTimer: Ref<ReturnType<typeof setTimeout> | null> = ref(null)

  let ws: WebSocket | null = null
  let userInitiatedClose = false

  function initWebSocket(roomId: string, userId: string, displayName: string) {
    const config = useRuntimeConfig()
    const wsUrl = config.public.wsUrl

    ws = new WebSocket(`${wsUrl}?roomId=${roomId}&userId=${userId}&displayName=${encodeURIComponent(displayName)}`)

    ws.onopen = () => {
      isConnected.value = true
      reconnecting.value = false
      reconnectAttempts.value = 0
      reconnectFailed.value = false
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

      if (reconnectAttempts.value < RECONNECT_MAX_ATTEMPTS && !userInitiatedClose) {
        reconnecting.value = true
        const delay = Math.min(
          RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts.value),
          RECONNECT_MAX_DELAY
        )
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value + 1}/${RECONNECT_MAX_ATTEMPTS})`)
        
        reconnectTimer.value = setTimeout(() => {
          reconnectAttempts.value++
          initWebSocket(roomId, userId, displayName)
        }, delay)
      } else {
        reconnecting.value = false
        if (reconnectAttempts.value >= RECONNECT_MAX_ATTEMPTS) {
          reconnectFailed.value = true
        }
      }
    }

    ws.onerror = (e) => {
      error.value = 'WebSocket error'
      console.error('WebSocket error:', e)
    }
  }

  function connect(roomId: string, userId: string, displayName: string) {
    userInitiatedClose = false
    reconnectAttempts.value = 0
    reconnectFailed.value = false
    cleanupReconnectTimer()
    initWebSocket(roomId, userId, displayName)
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
    userInitiatedClose = true
    cleanupReconnectTimer()
    if (ws) {
      ws.close()
      ws = null
    }
    isConnected.value = false
    reconnecting.value = false
    reconnectFailed.value = false
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
    reconnectFailed: readonly(reconnectFailed),
    connect,
    send,
    disconnect,
  }
}
