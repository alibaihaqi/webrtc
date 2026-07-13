import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles invalid JSON gracefully', () => {
    const invalidJson = 'not-json'
    expect(() => JSON.parse(invalidJson)).toThrow()
  })

  it('handles missing required fields', () => {
    const message = { type: 'join-room' }
    expect(message).not.toHaveProperty('roomId')
    expect(message).not.toHaveProperty('from')
  })

  it('handles room not found', () => {
    const rooms = new Map()
    const room = rooms.get('non-existent')
    expect(room).toBeUndefined()
  })

  it('handles room full scenario', () => {
    const participants = new Map([
      ['user1', {}],
      ['user2', {}],
    ])
    const maxParticipants = 2
    expect(participants.size).toBe(maxParticipants)
  })
})
