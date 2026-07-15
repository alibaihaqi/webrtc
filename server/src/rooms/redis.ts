import { getRedisClient } from '../redis.js'
import type { ParticipantInfo } from '../protocol.js'
import type { Room, IRoomManager } from '../state.js'

const ROOM_TTL = 60 * 60 // 1 hour (rooms expire after 1 hour of inactivity)
const CLEANUP_DELAY = 30 // 30 seconds after last participant leaves

export class RedisRoomManager implements IRoomManager {
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    if (!getRedisClient()) {
      throw new Error('Redis not available')
    }
  }

  private getRedis() {
    return getRedisClient()
  }

  async createRoom(roomId: string): Promise<Room> {
    const redis = this.getRedis()
    if (!redis) throw new Error('Redis not available')

    const room: Room = {
      id: roomId,
      participants: new Map(),
      createdAt: Date.now(),
    }

    await redis.hset(`room:${roomId}`, {
      id: roomId,
      createdAt: room.createdAt.toString(),
    })

    await redis.expire(`room:${roomId}`, ROOM_TTL)

    return room
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const redis = this.getRedis()
    if (!redis) return null

    const roomData = await redis.hgetall(`room:${roomId}`)
    if (!roomData.id) return null

    const participants = await this.getParticipants(roomId)

    return {
      id: roomData.id,
      participants: new Map(participants.map(p => [p.userId, p])),
      createdAt: parseInt(roomData.createdAt),
    }
  }

  async joinRoom(roomId: string, participant: ParticipantInfo): Promise<{ success: boolean; error?: string }> {
    const redis = this.getRedis()
    if (!redis) return { success: false, error: 'Redis not available' }

    const room = await this.getRoom(roomId)
    if (!room) return { success: false, error: 'Room not found' }

    if (room.participants.size >= 2) {
      return { success: false, error: 'Room is full' }
    }

    await redis.hset(`room:${roomId}:participant:${participant.userId}`, {
      userId: participant.userId,
      displayName: participant.displayName,
      joinedAt: participant.joinedAt.toString(),
    })

    await redis.sadd(`room:${roomId}:participants`, participant.userId)
    await redis.expire(`room:${roomId}`, ROOM_TTL)

    this.cancelCleanup(roomId)

    return { success: true }
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const redis = this.getRedis()
    if (!redis) return false

    const removed = await redis.srem(`room:${roomId}:participants`, userId)
    if (removed === 0) return false

    await redis.del(`room:${roomId}:participant:${userId}`)
    await redis.expire(`room:${roomId}`, ROOM_TTL)

    const participantCount = await redis.scard(`room:${roomId}:participants`)

    if (participantCount === 0) {
      this.scheduleCleanup(roomId)
    }

    return true
  }

  async getParticipants(roomId: string): Promise<ParticipantInfo[]> {
    const redis = this.getRedis()
    if (!redis) return []

    const participantIds = await redis.smembers(`room:${roomId}:participants`)
    const participants: ParticipantInfo[] = []

    for (const userId of participantIds) {
      const data = await redis.hgetall(`room:${roomId}:participant:${userId}`)
      if (data.userId) {
        participants.push({
          userId: data.userId,
          displayName: data.displayName,
          joinedAt: parseInt(data.joinedAt),
        })
      }
    }

    return participants
  }

  async isInRoom(roomId: string, userId: string): Promise<boolean> {
    const redis = this.getRedis()
    if (!redis) return false

    return await redis.sismember(`room:${roomId}:participants`, userId) === 1
  }

  async destroyRoom(roomId: string): Promise<boolean> {
    const redis = this.getRedis()
    if (!redis) return false

    this.cancelCleanup(roomId)

    const participantIds = await redis.smembers(`room:${roomId}:participants`)

    for (const userId of participantIds) {
      await redis.del(`room:${roomId}:participant:${userId}`)
    }

    await redis.del(`room:${roomId}:participants`)
    await redis.del(`room:${roomId}`)

    return true
  }

  async size(): Promise<number> {
    const redis = this.getRedis()
    if (!redis) return 0

    let cursor = '0'
    const allKeys: string[] = []

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor, 'MATCH', 'room:*', 'COUNT', 100
      )
      cursor = nextCursor
      allKeys.push(...keys)
    } while (cursor !== '0')

    return allKeys.filter(k => !k.includes(':participants') && !k.includes(':participant:')).length
  }

  private scheduleCleanup(roomId: string): void {
    this.cancelCleanup(roomId)

    const timer = setTimeout(async () => {
      const redis = this.getRedis()
      if (!redis) return

      const currentCount = await redis.scard(`room:${roomId}:participants`)
      if (currentCount === 0) {
        await this.destroyRoom(roomId)
      }
      this.cleanupTimers.delete(roomId)
    }, CLEANUP_DELAY * 1000)

    this.cleanupTimers.set(roomId, timer)
  }

  private cancelCleanup(roomId: string): void {
    const timer = this.cleanupTimers.get(roomId)
    if (timer) {
      clearTimeout(timer)
      this.cleanupTimers.delete(roomId)
    }
  }
}
