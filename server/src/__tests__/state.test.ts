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

  it('creates a room', async () => {
    const room = await manager.createRoom('room-1')
    expect(room.id).toBe('room-1')
    expect(room.participants.size).toBe(0)
    expect(await manager.size()).toBe(1)
  })

  it('joins a room', async () => {
    await manager.createRoom('room-1')
    const result = await manager.joinRoom('room-1', {
      userId: 'user-1',
      displayName: 'Alice',
      joinedAt: Date.now(),
    })
    expect(result.success).toBe(true)
    expect(await manager.getParticipants('room-1')).toHaveLength(1)
  })

  it('enforces max 2 participants', async () => {
    await manager.createRoom('room-1')
    await manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    await manager.joinRoom('room-1', { userId: 'user-2', displayName: 'Bob', joinedAt: Date.now() })

    const result = await manager.joinRoom('room-1', { userId: 'user-3', displayName: 'Charlie', joinedAt: Date.now() })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Room is full')
  })

  it('leaves a room', async () => {
    await manager.createRoom('room-1')
    await manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })

    const left = await manager.leaveRoom('room-1', 'user-1')
    expect(left).toBe(true)
    expect(await manager.getParticipants('room-1')).toHaveLength(0)
  })

  it('schedules room cleanup after 30s when empty', async () => {
    await manager.createRoom('room-1')
    await manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    await manager.leaveRoom('room-1', 'user-1')

    expect(await manager.getRoom('room-1')).not.toBeNull()

    vi.advanceTimersByTime(30_000)

    expect(await manager.getRoom('room-1')).toBeNull()
  })

  it('cancels cleanup when someone joins', async () => {
    await manager.createRoom('room-1')
    await manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    await manager.leaveRoom('room-1', 'user-1')

    vi.advanceTimersByTime(20_000)

    await manager.joinRoom('room-1', { userId: 'user-2', displayName: 'Bob', joinedAt: Date.now() })

    vi.advanceTimersByTime(15_000)

    expect(await manager.getRoom('room-1')).not.toBeNull()
  })

  it('checks if user is in room', async () => {
    await manager.createRoom('room-1')
    await manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })

    expect(await manager.isInRoom('room-1', 'user-1')).toBe(true)
    expect(await manager.isInRoom('room-1', 'user-2')).toBe(false)
  })

  it('returns false when leaving non-existent room', async () => {
    const left = await manager.leaveRoom('room-1', 'user-1')
    expect(left).toBe(false)
  })

  it('returns error when joining non-existent room', async () => {
    const result = await manager.joinRoom('room-1', { userId: 'user-1', displayName: 'Alice', joinedAt: Date.now() })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Room not found')
  })
})
