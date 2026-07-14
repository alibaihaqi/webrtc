import { ParticipantInfo } from './protocol.js'
import { RedisRoomManager } from './rooms/redis.js'

export interface Room {
  id: string
  participants: Map<string, ParticipantInfo>
  createdAt: number
}

let useRedis = false
let redisManager: RedisRoomManager | null = null

export function getRoomManager(): RoomManager | RedisRoomManager {
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

export class RoomManager {
  private rooms: Map<string, Room> = new Map()
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map()

  createRoom(roomId: string): Room {
    const room: Room = {
      id: roomId,
      participants: new Map(),
      createdAt: Date.now(),
    }
    this.rooms.set(roomId, room)
    return room
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  joinRoom(roomId: string, participant: ParticipantInfo): { success: boolean; error?: string } {
    const room = this.getRoom(roomId)
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

  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.getRoom(roomId)
    if (!room) return false

    const deleted = room.participants.delete(userId)
    if (deleted && room.participants.size === 0) {
      this.scheduleCleanup(roomId)
    }
    return deleted
  }

  getParticipants(roomId: string): ParticipantInfo[] {
    const room = this.getRoom(roomId)
    return room ? Array.from(room.participants.values()) : []
  }

  isInRoom(roomId: string, userId: string): boolean {
    const room = this.getRoom(roomId)
    return room?.participants.has(userId) ?? false
  }

  destroyRoom(roomId: string): boolean {
    this.cancelCleanup(roomId)
    return this.rooms.delete(roomId)
  }

  private scheduleCleanup(roomId: string): void {
    const timer = setTimeout(() => {
      const room = this.getRoom(roomId)
      if (room && room.participants.size === 0) {
        this.destroyRoom(roomId)
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

  get size(): number {
    return this.rooms.size
  }
}
