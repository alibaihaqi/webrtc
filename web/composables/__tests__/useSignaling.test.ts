import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSignaling } from '../useSignaling'

class MockWebSocket {
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  readyState = 1

  constructor(public url: string) {
    MockWebSocket.instances.push(this)
  }

  send(_data: string) {}
  close() {
    this.readyState = 3
  }

  simulateOpen() {
    this.onopen?.()
  }

  simulateClose() {
    this.onclose?.()
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}

describe('useSignaling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { wsUrl: 'ws://localhost:3001' },
    }))
    vi.stubGlobal('window', {
      dispatchEvent: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('initializes with disconnected state', () => {
    const { isConnected, error } = useSignaling()
    expect(isConnected.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('provides connect function', () => {
    const { connect } = useSignaling()
    expect(typeof connect).toBe('function')
  })

  it('provides send function', () => {
    const { send } = useSignaling()
    expect(typeof send).toBe('function')
  })

  it('provides disconnect function', () => {
    const { disconnect } = useSignaling()
    expect(typeof disconnect).toBe('function')
  })

  it('exposes reconnectFailed ref', () => {
    const { reconnectFailed } = useSignaling()
    expect(reconnectFailed.value).toBe(false)
  })

  describe('reconnection', () => {
    it('should reconnect on disconnect with exponential backoff', async () => {
      const { connect, reconnecting, reconnectAttempts } = useSignaling()
      connect('room1', 'user1', 'Alice')

      const ws = MockWebSocket.instances[0]
      ws.simulateOpen()
      expect(reconnecting.value).toBe(false)

      ws.simulateClose()

      expect(reconnecting.value).toBe(true)
      expect(reconnectAttempts.value).toBe(0)

      await vi.advanceTimersByTimeAsync(1000)

      expect(MockWebSocket.instances.length).toBe(2)
      expect(reconnectAttempts.value).toBe(1)
    })

    it('should double delay on subsequent reconnect attempts', async () => {
      const { connect, reconnectAttempts } = useSignaling()
      connect('room1', 'user1', 'Alice')

      const ws1 = MockWebSocket.instances[0]
      ws1.simulateOpen()
      ws1.simulateClose()

      expect(reconnectAttempts.value).toBe(0)
      await vi.advanceTimersByTimeAsync(1000)
      expect(reconnectAttempts.value).toBe(1)

      const ws2 = MockWebSocket.instances[1]
      ws2.simulateClose()

      await vi.advanceTimersByTimeAsync(1999)
      expect(MockWebSocket.instances.length).toBe(2)

      await vi.advanceTimersByTimeAsync(1)
      expect(MockWebSocket.instances.length).toBe(3)
      expect(reconnectAttempts.value).toBe(2)
    })

    it('should cap delay at max (16000ms)', async () => {
      const { connect, reconnectAttempts } = useSignaling()
      connect('room1', 'user1', 'Alice')

      let ws = MockWebSocket.instances[0]
      ws.simulateOpen()

      for (let i = 0; i < 5; i++) {
        ws.simulateClose()
        await vi.advanceTimersByTimeAsync(16000)
        ws = MockWebSocket.instances[MockWebSocket.instances.length - 1]
      }

      expect(reconnectAttempts.value).toBe(5)
      expect(MockWebSocket.instances.length).toBe(6)
    })

    it('should set reconnectFailed after max attempts', async () => {
      const { connect, reconnectFailed, reconnectAttempts } = useSignaling()
      connect('room1', 'user1', 'Alice')

      let ws = MockWebSocket.instances[0]
      ws.simulateOpen()

      for (let i = 0; i < 5; i++) {
        ws.simulateClose()
        expect(reconnectAttempts.value).toBe(i)
        await vi.advanceTimersByTimeAsync(16000)
        ws = MockWebSocket.instances[MockWebSocket.instances.length - 1]
      }

      ws.simulateClose()
      await vi.advanceTimersByTimeAsync(16000)

      expect(reconnectFailed.value).toBe(true)
    })

    it('should not reconnect on user-initiated disconnect', async () => {
      const { connect, disconnect, reconnecting } = useSignaling()
      connect('room1', 'user1', 'Alice')

      const ws = MockWebSocket.instances[0]
      ws.simulateOpen()

      disconnect()

      expect(reconnecting.value).toBe(false)
      expect(MockWebSocket.instances.length).toBe(1)

      await vi.advanceTimersByTimeAsync(5000)
      expect(MockWebSocket.instances.length).toBe(1)
    })

    it('should reset reconnectFailed on successful connection', async () => {
      const { connect, reconnectFailed } = useSignaling()
      connect('room1', 'user1', 'Alice')

      let ws = MockWebSocket.instances[0]
      ws.simulateOpen()

      for (let i = 0; i < 5; i++) {
        ws.simulateClose()
        await vi.advanceTimersByTimeAsync(16000)
        ws = MockWebSocket.instances[MockWebSocket.instances.length - 1]
      }

      ws.simulateClose()
      await vi.advanceTimersByTimeAsync(16000)
      expect(reconnectFailed.value).toBe(true)

      const newWs = MockWebSocket.instances[MockWebSocket.instances.length - 1]
      newWs.simulateOpen()
      expect(reconnectFailed.value).toBe(false)
    })
  })
})
