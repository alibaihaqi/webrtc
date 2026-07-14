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
  keys: vi.fn().mockResolvedValue([]),
}

vi.mock('../redis.js', () => ({
  getRedisClient: vi.fn(() => mockRedis),
}))

import { initRoomManager, getRoomManager, RoomManager } from '../state.js'
import { RedisRoomManager } from '../rooms/redis.js'
import { getRedisClient } from '../redis.js'

describe('initRoomManager fallback', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes RedisRoomManager when Redis is available', async () => {
    vi.mocked(getRedisClient).mockReturnValue(mockRedis as any)

    await initRoomManager()

    const manager = getRoomManager()
    expect(manager).toBeInstanceOf(RedisRoomManager)
  })

  it('falls back to in-memory RoomManager when getRedisClient returns null', async () => {
    vi.mocked(getRedisClient).mockReturnValue(null)

    await initRoomManager()

    const manager = getRoomManager()
    expect(manager).toBeInstanceOf(RoomManager)
  })
})

describe('RedisRoomManager integration', () => {
  let manager: RedisRoomManager

  beforeEach(async () => {
    vi.useFakeTimers()
    mockRedis.hset.mockResolvedValue(1)
    mockRedis.hgetall.mockResolvedValue({})
    mockRedis.expire.mockResolvedValue(1)
    mockRedis.sadd.mockResolvedValue(1)
    mockRedis.srem.mockResolvedValue(1)
    mockRedis.smembers.mockResolvedValue([])
    mockRedis.scard.mockResolvedValue(0)
    mockRedis.sismember.mockResolvedValue(0)
    mockRedis.del.mockResolvedValue(1)
    mockRedis.keys.mockResolvedValue([])

    vi.mocked(getRedisClient).mockReturnValue(mockRedis as any)
    await initRoomManager()
    manager = getRoomManager() as RedisRoomManager
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('createRoom', () => {
    it('creates a room via Redis and returns Room object', async () => {
      const room = await manager.createRoom('test-room')

      expect(room.id).toBe('test-room')
      expect(room.participants.size).toBe(0)
      expect(typeof room.createdAt).toBe('number')
      expect(mockRedis.hset).toHaveBeenCalledWith('room:test-room', {
        id: 'test-room',
        createdAt: room.createdAt.toString(),
      })
      expect(mockRedis.expire).toHaveBeenCalledWith('room:test-room', 3600)
    })

    it('throws when Redis becomes unavailable', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      await expect(manager.createRoom('room-x')).rejects.toThrow('Redis not available')
    })
  })

  describe('joinRoom', () => {
    it('adds a participant to the room via Redis', async () => {
      // joinRoom calls getRoom first (hgetall + smembers for participants)
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'j-room', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce([])

      const result = await manager.joinRoom('j-room', {
        userId: 'u1',
        displayName: 'Alice',
        joinedAt: 1000,
      })

      expect(result.success).toBe(true)
      expect(mockRedis.hset).toHaveBeenCalledWith(
        'room:j-room:participant:u1',
        expect.objectContaining({ userId: 'u1', displayName: 'Alice' }),
      )
      expect(mockRedis.sadd).toHaveBeenCalledWith('room:j-room:participants', 'u1')
    })

    it('rejects when room is full (3rd participant)', async () => {
      // joinRoom → getRoom: hgetall returns room, smembers returns 2 participants
      // Then joinRoom checks size >= 2
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'j-room', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce(['u1', 'u2'])
      // getParticipants iterates: hgetall for each participant
      mockRedis.hgetall
        .mockResolvedValueOnce({ userId: 'u1', displayName: 'A', joinedAt: '100' })
        .mockResolvedValueOnce({ userId: 'u2', displayName: 'B', joinedAt: '200' })

      const result = await manager.joinRoom('j-room', {
        userId: 'u3',
        displayName: 'Charlie',
        joinedAt: Date.now(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Room is full')
    })

    it('rejects when room does not exist', async () => {
      // joinRoom → getRoom: hgetall returns empty (no id field) → getRoom returns null
      mockRedis.hgetall.mockResolvedValueOnce({})

      const result = await manager.joinRoom('nonexistent', {
        userId: 'u1',
        displayName: 'Alice',
        joinedAt: Date.now(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Room not found')
    })

    it('rejects when Redis is unavailable', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const result = await manager.joinRoom('j-room', {
        userId: 'u1',
        displayName: 'Alice',
        joinedAt: Date.now(),
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Redis not available')
    })
  })

  describe('leaveRoom', () => {
    it('removes a participant from the room via Redis', async () => {
      mockRedis.srem.mockResolvedValueOnce(1)

      const left = await manager.leaveRoom('room-l', 'u1')

      expect(left).toBe(true)
      expect(mockRedis.srem).toHaveBeenCalledWith('room:room-l:participants', 'u1')
      expect(mockRedis.del).toHaveBeenCalledWith('room:room-l:participant:u1')
    })

    it('returns false when user is not in the room', async () => {
      mockRedis.srem.mockResolvedValueOnce(0)

      const left = await manager.leaveRoom('room-l', 'u1')
      expect(left).toBe(false)
    })

    it('returns false when Redis is unavailable', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const left = await manager.leaveRoom('room-l', 'u1')
      expect(left).toBe(false)
    })

    it('schedules cleanup when last participant leaves', async () => {
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      await manager.leaveRoom('room-c', 'u1')

      // Room still exists before cleanup delay
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'room-c', createdAt: '500' })
      mockRedis.smembers.mockResolvedValueOnce([])
      const before = await manager.getRoom('room-c')
      expect(before).not.toBeNull()

      // Advance past 30s cleanup delay
      mockRedis.scard.mockResolvedValueOnce(0)
      mockRedis.smembers.mockResolvedValueOnce([])
      mockRedis.del.mockResolvedValue(1)
      vi.advanceTimersByTime(30_000)
      await vi.advanceTimersByTimeAsync(0)

      expect(mockRedis.del).toHaveBeenCalledWith('room:room-c')
    })
  })

  describe('getParticipants', () => {
    it('returns empty array for room with no participants', async () => {
      mockRedis.smembers.mockResolvedValueOnce([])

      const participants = await manager.getParticipants('room-g')
      expect(participants).toEqual([])
    })

    it('returns participants from Redis', async () => {
      mockRedis.smembers.mockResolvedValueOnce(['u1', 'u2'])
      mockRedis.hgetall
        .mockResolvedValueOnce({ userId: 'u1', displayName: 'Alice', joinedAt: '100' })
        .mockResolvedValueOnce({ userId: 'u2', displayName: 'Bob', joinedAt: '200' })

      const participants = await manager.getParticipants('room-g')

      expect(participants).toHaveLength(2)
      expect(participants[0]).toEqual({ userId: 'u1', displayName: 'Alice', joinedAt: 100 })
      expect(participants[1]).toEqual({ userId: 'u2', displayName: 'Bob', joinedAt: 200 })
    })

    it('returns empty array when Redis is unavailable', async () => {
      vi.mocked(getRedisClient).mockReturnValue(null)
      const participants = await manager.getParticipants('room-g')
      expect(participants).toEqual([])
    })
  })

  describe('end-to-end CRUD', () => {
    it('creates room, joins two users, lists participants, leaves, and cleans up', async () => {
      // 1. Create room (only calls hset + expire, no hgetall/smembers)
      const room = await manager.createRoom('e2e')
      expect(room.id).toBe('e2e')
      expect(mockRedis.hset).toHaveBeenCalledWith('room:e2e', expect.any(Object))
      expect(mockRedis.expire).toHaveBeenCalledWith('room:e2e', 3600)

      // 2. First user joins — getRoom sees empty room
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'e2e', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce([])
      const j1 = await manager.joinRoom('e2e', { userId: 'u1', displayName: 'A', joinedAt: 1000 })
      expect(j1.success).toBe(true)

      // 3. Second user joins — getRoom sees u1 already present
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'e2e', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce(['u1'])
      mockRedis.hgetall.mockResolvedValueOnce({ userId: 'u1', displayName: 'A', joinedAt: '1000' })
      const j2 = await manager.joinRoom('e2e', { userId: 'u2', displayName: 'B', joinedAt: 2000 })
      expect(j2.success).toBe(true)

      // 4. Third user rejected — getRoom sees u1+u2 (size=2, full)
      mockRedis.hgetall.mockResolvedValueOnce({ id: 'e2e', createdAt: '1000' })
      mockRedis.smembers.mockResolvedValueOnce(['u1', 'u2'])
      mockRedis.hgetall.mockResolvedValueOnce({ userId: 'u1', displayName: 'A', joinedAt: '1000' })
      mockRedis.hgetall.mockResolvedValueOnce({ userId: 'u2', displayName: 'B', joinedAt: '2000' })
      const j3 = await manager.joinRoom('e2e', { userId: 'u3', displayName: 'C', joinedAt: 3000 })
      expect(j3.success).toBe(false)
      expect(j3.error).toBe('Room is full')

      // 5. List participants
      mockRedis.smembers.mockResolvedValueOnce(['u1', 'u2'])
      mockRedis.hgetall.mockResolvedValueOnce({ userId: 'u1', displayName: 'A', joinedAt: '1000' })
      mockRedis.hgetall.mockResolvedValueOnce({ userId: 'u2', displayName: 'B', joinedAt: '2000' })
      const participants = await manager.getParticipants('e2e')
      expect(participants).toHaveLength(2)

      // 6. First user leaves
      mockRedis.srem.mockResolvedValueOnce(1)
      const left1 = await manager.leaveRoom('e2e', 'u1')
      expect(left1).toBe(true)

      // 7. Second user leaves (last participant → triggers cleanup)
      mockRedis.srem.mockResolvedValueOnce(1)
      mockRedis.scard.mockResolvedValueOnce(0)
      const left2 = await manager.leaveRoom('e2e', 'u2')
      expect(left2).toBe(true)

      // 8. Room destroyed after cleanup delay
      mockRedis.scard.mockResolvedValueOnce(0)
      mockRedis.smembers.mockResolvedValueOnce([])
      mockRedis.del.mockResolvedValue(1)
      vi.advanceTimersByTime(30_000)
      await vi.advanceTimersByTimeAsync(0)

      expect(mockRedis.del).toHaveBeenCalledWith('room:e2e')
    })
  })
})
