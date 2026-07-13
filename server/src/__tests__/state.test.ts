import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RoomManager } from '../state'

describe('RoomManager', () => {
  let manager: RoomManager

  beforeEach(() => {
    vi.useFakeTimers()
    manager = new RoomManager()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a room', () => {
    const room = manager.createRoom('room-1')
    expect(room.id).toBe('room-1')
    expect(room.participants.size).toBe(0)
    expect(manager.size).toBe(1)
  })

  it('joins a room', () => {
    manager.createRoom('room-1')
    const result = manager.joinRoom('room-1', {
      userId: 'user-1',
      displayName: 'Alice',
      joinedAt: Date.now(),
    })
    expect(result.success).toBe(true)
    expect(manager.getParticipants('room-1')).toHaveLength(1)
  })

  it('enforces max 2 participants', () => {
    manager.createRoom('room-1')
    manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    manager.joinRoom('room-1', { userId: 'user-2', displayName: 'Bob', joinedAt: Date.now() })

    const result = manager.joinRoom('room-1', { userId: 'user-3', displayName: 'Charlie', joinedAt: Date.now() })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Room is full')
  })

  it('leaves a room', () => {
    manager.createRoom('room-1')
    manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })

    const left = manager.leaveRoom('room-1', 'user-1')
    expect(left).toBe(true)
    expect(manager.getParticipants('room-1')).toHaveLength(0)
  })

  it('schedules room cleanup after 30s when empty', () => {
    manager.createRoom('room-1')
    manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    manager.leaveRoom('room-1', 'user-1')

    expect(manager.getRoom('room-1')).toBeDefined()

    vi.advanceTimersByTime(30_000)

    expect(manager.getRoom('room-1')).toBeUndefined()
  })

  it('cancels cleanup when someone joins', () => {
    manager.createRoom('room-1')
    manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    manager.leaveRoom('room-1', 'user-1')

    vi.advanceTimersByTime(20_000)

    manager.joinRoom('room-1', { userId: 'user-2', displayName: 'Bob', joinedAt: Date.now() })

    vi.advanceTimersByTime(15_000)

    expect(manager.getRoom('room-1')).toBeDefined()
  })

  it('checks if user is in room', () => {
    manager.createRoom('room-1')
    manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })

    expect(manager.isInRoom('room-1', 'user-1')).toBe(true)
    expect(manager.isInRoom('room-1', 'user-2')).toBe(false)
  })

  it('returns false when leaving non-existent room', () => {
    const left = manager.leaveRoom('room-1', 'user-1')
    expect(left).toBe(false)
  })

  it('returns error when joining non-existent room', () => {
    const result = manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Room not found')
  })
})
