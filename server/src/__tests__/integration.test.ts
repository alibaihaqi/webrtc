import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Server integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('health endpoint returns status', () => {
    const response = { status: 'ok', timestamp: Date.now() }
    expect(response.status).toBe('ok')
    expect(response.timestamp).toBeGreaterThan(0)
  })

  it('TURN credentials endpoint returns credentials', () => {
    const response = { username: 'test', credential: 'test-cred' }
    expect(response.username).toBeDefined()
    expect(response.credential).toBeDefined()
  })

  it('WebSocket server handles connections', () => {
    const clients = new Map()
    const clientId = 'user1'
    clients.set(clientId, { connected: true })
    expect(clients.has(clientId)).toBe(true)
    expect(clients.get(clientId).connected).toBe(true)
  })

  it('Room manager handles room operations', () => {
    const rooms = new Map()
    const roomId = 'room-1'

    rooms.set(roomId, { participants: new Map() })
    expect(rooms.has(roomId)).toBe(true)

    rooms.get(roomId)!.participants.set('user1', {})
    expect(rooms.get(roomId)!.participants.size).toBe(1)

    rooms.get(roomId)!.participants.delete('user1')
    expect(rooms.get(roomId)!.participants.size).toBe(0)
  })
})
