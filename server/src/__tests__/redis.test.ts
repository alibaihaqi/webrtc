import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockRedis = {
  hset: vi.fn().mockResolvedValue(1),
  hgetall: vi.fn().mockResolvedValue({}),
  expire: vi.fn().mockResolvedValue(1),
  sadd: vi.fn().mockResolvedValue(1),
  srem: vi.fn().mockResolvedValue(1),
  smembers: vi.fn().mockResolvedValue([]),
  scard: vi.fn().mockResolvedValue(0),
  sismember: vi.fn().mockResolvedValue(0),
  del: vi.fn().mockResolvedValue(1),
  scan: vi.fn().mockResolvedValue(['0', []]),
}

vi.mock('../redis.js', () => ({
  getRedisClient: vi.fn(() => mockRedis),
}))

import { RedisRoomManager } from '../rooms/redis.js'
import { getRedisClient } from '../redis.js'

describe('RedisRoomManager', () => {
  let manager: RedisRoomManager

  beforeEach(() => {
    vi.useFakeTimers()
    // Restore default mock implementations
    mockRedis.hset.mockResolvedValue(1)
    mockRedis.hgetall.mockResolvedValue({})
    mockRedis.expire.mockResolvedValue(1)
    mockRedis.sadd.mockResolvedValue(1)
    mockRedis.srem.mockResolvedValue(1)
    mockRedis.smembers.mockResolvedValue([])
    mockRedis.scard.mockResolvedValue(0)
    mockRedis.sismember.mockResolvedValue(0)
    mockRedis.del.mockResolvedValue(1)
    mockRedis.scan.mockResolvedValue(['0', []])
    vi.mocked(getRedisClient).mockReturnValue(mockRedis as any)
    manager = new RedisRoomManager()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('createRoom', () => {
    it('creates a room in Redis', async () => {
      const room = await manager.createRoom('room-1')

      expect(room.id).toBe('room-1')
      expect(room.participants.size).toBe(0)
      expect(typeof room.createdAt).toBe('number')
      expect(mockRedis.hset).toHaveBeenCalledWith('room:room-1', {
        id: 'room-1',
        createdAt: room.createdAt.toString(),
      })
      expect(mockRedis.expire).toHaveBeenCalledWith('room:room-1', 3600)
    })

    it('throws when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      await expect(manager.createRoom('room-1')).rejects.toThrow('Redis not available')
    })
  })

  describe('getRoom', () => {
    it('returns room data when it exists', async () => {
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'room-1', createdAt: '12345' })
      mockRedis.smembers.mockResolvedValueOnce([])

      const room = await manager.getRoom('room-1')

      expect(room).not.toBeNull()
      expect(room!.id).toBe('room-1')
      expect(room!.createdAt).toBe(12345)
      expect(room!.participants.size).toBe(0)
    })

    it('returns null when room does not exist', async () => {
      mockRedis.hgetall.mockResolvedValueOnce({})

      const room = await manager.getRoom('room-1')
      expect(room).toBeNull()
    })

    it('returns null when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const room = await manager.getRoom('room-1')
      expect(room).toBeNull()
    })

    it('includes participants in room data', async () => {
      mockRedis.hgetall
        .mockResolvedValueOnce({ id: 'room-1', createdAt: '1000' })
        .mockResolvedValueOnce({
          userId: 'user-1',
          displayName: 'Alice',
          joinedAt: '2000',
        })
      mockRedis.smembers.mockResolvedValueOnce(['user-1'])

      const room = await manager.getRoom('room-1')

      expect(room!.participants.size).toBe(1)
      expect(room!.participants.get('user-1')).toEqual({
        userId: 'user-1',
        displayName: 'Alice',
        joinedAt: 2000,
      })
    })
  })

  describe('joinRoom', () => {
    beforeEach(async () => {
      mockRedis.hgetall.mockResolvedValue({ id: 'room-1', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValue([])
      await manager.createRoom('room-1')
      // Reset after createRoom setup
      mockRedis.hset.mockClear()
      mockRedis.expire.mockClear()
    })

    it('adds a participant to the room', async () => {
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'room-1', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce([])

      const result = await manager.joinRoom('room-1', {
        userId: 'user-1',
        displayName: 'Alice',
        joinedAt: Date.now(),
      })

      expect(result.success).toBe(true)
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'room:room-1:participant:user-1',
        expect.objectContaining({ userId: 'user-1', displayName: 'Alice' }),
      )
      expect(mockRedis.sadd).toHaveBeenCalledWith('room:room-1:participants', 'user-1')
    })

    it('enforces max 2 participants', async () => {
      mockRedis.hgetall
        .mockResolvedValueOnce({ id: 'room-1', createdAt: '1000' })
        .mockResolvedValueOnce({ userId: 'user-1', displayName: 'Alice', joinedAt: '100' })
        .mockResolvedValueOnce({ userId: 'user-2', displayName: 'Bob', joinedAt: '200' })
      mockRedis.smembers.mockResolvedValue(['user-1', 'user-2'])

      const result = await manager.joinRoom('room-1', {
        userId: 'user-3',
        displayName: 'Charlie',
        joinedAt: Date.now(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Room is full')
    })

    it('returns error when room does not exist', async () => {
      mockRedis.hgetall.mockResolvedValueOnce({})

      const result = await manager.joinRoom('nonexistent', {
        userId: 'user-1',
        displayName: 'Alice',
        joinedAt: Date.now(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Room not found')
    })

    it('returns error when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const result = await manager.joinRoom('room-1', {
        userId: 'user-1',
        displayName: 'Alice',
        joinedAt: Date.now(),
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Redis not available')
    })

    it('cancels pending cleanup on join', async () => {
      // Leave triggers cleanup
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      await manager.leaveRoom('room-1', 'user-1')

      // Now join should cancel the cleanup
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'room-1', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce([])

      const result = await manager.joinRoom('room-1', {
        userId: 'user-2',
        displayName: 'Bob',
        joinedAt: Date.now(),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('leaveRoom', () => {
    it('removes a participant from the room', async () => {
      mockRedis.srem.mockResolvedValueOnce(1)

      const left = await manager.leaveRoom('room-1', 'user-1')
      expect(left).toBe(true)
      expect(mockRedis.srem).toHaveBeenCalledWith('room:room-1:participants', 'user-1')
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1:participant:user-1')
    })

    it('returns false when user is not in the room', async () => {
      mockRedis.srem.mockResolvedValueOnce(0)

      const left = await manager.leaveRoom('room-1', 'user-1')
      expect(left).toBe(false)
    })

    it('returns false when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const left = await manager.leaveRoom('room-1', 'user-1')
      expect(left).toBe(false)
    })

    it('schedules room cleanup when last participant leaves', async () => {
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      await manager.leaveRoom('room-1', 'user-1')

      // Room should still exist before cleanup
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'room-1', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce([])
      const roomBefore = await manager.getRoom('room-1')
      expect(roomBefore).not.toBeNull()

      // Advance past cleanup delay
      mockRedis.scard.mockResolvedValueOnce(0)
      mockRedis.smembers.mockResolvedValueOnce([])
      mockRedis.del.mockResolvedValue(1)
      vi.advanceTimersByTime(30_000)

      // Allow async cleanup to complete
      await vi.advanceTimersByTimeAsync(0)

      // Room should be destroyed
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1')
    })
  })

  describe('getParticipants', () => {
    it('returns empty array for room with no participants', async () => {
      mockRedis.smembers.mockResolvedValueOnce([])

      const participants = await manager.getParticipants('room-1')
      expect(participants).toEqual([])
    })

    it('returns participants list', async () => {
      mockRedis.smembers.mockResolvedValueOnce(['user-1', 'user-2'])
      mockRedis.hgetall
        .mockResolvedValueOnce({ userId: 'user-1', displayName: 'Alice', joinedAt: '100' })
        .mockResolvedValueOnce({ userId: 'user-2', displayName: 'Bob', joinedAt: '200' })

      const participants = await manager.getParticipants('room-1')
      expect(participants).toHaveLength(2)
      expect(participants[0].userId).toBe('user-1')
      expect(participants[1].userId).toBe('user-2')
    })

    it('returns empty array when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const participants = await manager.getParticipants('room-1')
      expect(participants).toEqual([])
    })
  })

  describe('isInRoom', () => {
    it('returns true when user is in room', async () => {
      mockRedis.sismember.mockResolvedValueOnce(1)

      const inRoom = await manager.isInRoom('room-1', 'user-1')
      expect(inRoom).toBe(true)
    })

    it('returns false when user is not in room', async () => {
      mockRedis.sismember.mockResolvedValueOnce(0)

      const inRoom = await manager.isInRoom('room-1', 'user-1')
      expect(inRoom).toBe(false)
    })

    it('returns false when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const inRoom = await manager.isInRoom('room-1', 'user-1')
      expect(inRoom).toBe(false)
    })
  })

  describe('destroyRoom', () => {
    it('removes all room keys from Redis', async () => {
      mockRedis.smembers.mockResolvedValueOnce(['user-1', 'user-2'])
      mockRedis.del.mockResolvedValue(1)

      const destroyed = await manager.destroyRoom('room-1')
      expect(destroyed).toBe(true)
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1:participant:user-1')
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1:participant:user-2')
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1:participants')
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1')
    })

    it('returns false when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const destroyed = await manager.destroyRoom('room-1')
      expect(destroyed).toBe(false)
    })

    it('cancels pending cleanup', async () => {
      // Leave triggers cleanup
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      await manager.leaveRoom('room-1', 'user-1')

      // Destroy before cleanup fires
      mockRedis.smembers.mockResolvedValueOnce([])
      mockRedis.del.mockResolvedValue(1)
      await manager.destroyRoom('room-1')

      // Advance timers - cleanup should not run
      mockRedis.del.mockClear()
      vi.advanceTimersByTime(30_000)
      await vi.advanceTimersByTimeAsync(0)

      expect(mockRedis.del).not.toHaveBeenCalled()
    })
  })

  describe('size', () => {
    it('returns number of rooms', async () => {
      mockRedis.scan.mockResolvedValueOnce(['0', ['room:room-1', 'room:room-2']])

      const size = await manager.size()
      expect(size).toBe(2)
    })

    it('excludes participant-related keys', async () => {
      mockRedis.scan.mockResolvedValueOnce([
        '0',
        [
          'room:room-1',
          'room:room-1:participants',
          'room:room-1:participant:user-1',
          'room:room-2',
        ],
      ])

      const size = await manager.size()
      expect(size).toBe(2)
    })

    it('handles multiple SCAN iterations', async () => {
      mockRedis.scan
        .mockResolvedValueOnce(['42', ['room:room-1']])
        .mockResolvedValueOnce(['0', ['room:room-2']])

      const size = await manager.size()
      expect(size).toBe(2)
      expect(mockRedis.scan).toHaveBeenCalledTimes(2)
    })

    it('returns 0 when Redis is not available', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const size = await manager.size()
      expect(size).toBe(0)
    })
  })

  describe('cleanup scheduling', () => {
    it('cancels previous cleanup when new cleanup is scheduled', async () => {
      // Leave triggers cleanup
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      await manager.leaveRoom('room-1', 'user-1')

      // Advance 15 seconds (half of cleanup delay)
      vi.advanceTimersByTime(15_000)

      // Join again (cancels cleanup)
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'room-1', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce([])
      await manager.joinRoom('room-1', { userId: 'user-2', displayName: 'Bob', joinedAt: Date.now() })

      // Leave again (new cleanup scheduled)
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      await manager.leaveRoom('room-1', 'user-2')

      // Advance remaining 15s + full 30s = should not trigger first cleanup
      mockRedis.del.mockClear()
      vi.advanceTimersByTime(30_000)
      await vi.advanceTimersByTimeAsync(0)

      // The second cleanup should have fired (30s from second leave)
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-1')
    })
  })
})
