import { ParticipantInfo } from './protocol.js'
import { RedisRoomManager } from './rooms/redis.js'

export interface Room {
  id: string
  participants: Map<string, ParticipantInfo>
  createdAt: number
}

export interface IRoomManager {
  createRoom(roomId: string): Promise<Room>
  getRoom(roomId: string): Promise<Room | null>
  joinRoom(roomId: string, participant: ParticipantInfo): Promise<{ success: boolean; error?: string }>
  leaveRoom(roomId: string, userId: string): Promise<boolean>
  getParticipants(roomId: string): Promise<ParticipantInfo[]>
  isInRoom(roomId: string, userId: string): Promise<boolean>
  destroyRoom(roomId: string): Promise<boolean>
  size(): Promise<number>
}

let useRedis = false
let redisManager: RedisRoomManager | null = null

export function getRoomManager(): IRoomManager {
  if (useRedis && redisManager) {
    return redisManager
  }
  return new RoomManager()
}

export async function initRoomManager(): Promise<void> {
  try {
    redisManager = new RedisRoomManager()
    useRedis = true
    console.log('Using Redis for room persistence')
  } catch (e) {
    console.warn('Failed to initialize Redis, using in-memory:', e)
    useRedis = false
  }
}

export class RoomManager implements IRoomManager {
  private rooms: Map<string, Room> = new Map()
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map()

  async createRoom(roomId: string): Promise<Room> {
    const room: Room = {
      id: roomId,
      participants: new Map(),
      createdAt: Date.now(),
    }
    this.rooms.set(roomId, room)
    return room
  }

  async getRoom(roomId: string): Promise<Room | null> {
    return this.rooms.get(roomId) ?? null
  }

  async joinRoom(roomId: string, participant: ParticipantInfo): Promise<{ success: boolean; error?: string }> {
    const room = await this.getRoom(roomId)
    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    if (room.participants.size >= 2) {
      return { success: false, error: 'Room is full' }
    }

    room.participants.set(participant.userId, participant)
    this.cancelCleanup(roomId)
    return { success: true }
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const room = await this.getRoom(roomId)
    if (!room) return false

    const deleted = room.participants.delete(userId)
    if (deleted && room.participants.size === 0) {
      this.scheduleCleanup(roomId)
    }
    return deleted
  }

  async getParticipants(roomId: string): Promise<ParticipantInfo[]> {
    const room = await this.getRoom(roomId)
    return room ? Array.from(room.participants.values()) : []
  }

  async isInRoom(roomId: string, userId: string): Promise<boolean> {
    const room = await this.getRoom(roomId)
    return room?.participants.has(userId) ?? false
  }

  async destroyRoom(roomId: string): Promise<boolean> {
    this.cancelCleanup(roomId)
    return this.rooms.delete(roomId)
  }

  private scheduleCleanup(roomId: string): void {
    const timer = setTimeout(() => {
      const room = this.rooms.get(roomId)
      if (room && room.participants.size === 0) {
        this.cancelCleanup(roomId)
        this.rooms.delete(roomId)
      }
    }, 30_000)
    this.cleanupTimers.set(roomId, timer)
  }

  private cancelCleanup(roomId: string): void {
    const timer = this.cleanupTimers.get(roomId)
    if (timer) {
      clearTimeout(timer)
      this.cleanupTimers.delete(roomId)
    }
  }

  async size(): Promise<number> {
    return this.rooms.size
  }
}
