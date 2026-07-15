import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { getRoomManager } from './state.js'
import type { IRoomManager } from './state.js'
import { captureMetric, captureError } from './monitoring/apm.js'
import type {
  ClientMessage,
  ServerMessage,
  ParticipantInfo,
} from './protocol.js'

const HEARTBEAT_INTERVAL = 30_000
const HEARTBEAT_TIMEOUT = 10_000

export class SignalingServer {
  private wss: WebSocketServer
  private roomManager: IRoomManager
  private clients: Map<WebSocket, { userId: string; roomId: string }> = new Map()

  constructor(wss: WebSocketServer) {
    this.wss = wss
    this.roomManager = getRoomManager()
    this.setupConnectionHandler()
  }

  private startHeartbeat(ws: WebSocket): void {
    const isAlive = { value: true }

    ws.on('pong', () => {
      isAlive.value = true
    })

    const interval = setInterval(() => {
      if (!isAlive.value) {
        console.log('WebSocket heartbeat timeout, terminating')
        ws.terminate()
        return
      }
      isAlive.value = false
      ws.ping()
    }, HEARTBEAT_INTERVAL)

    ws.on('close', () => {
      clearInterval(interval)
    })
  }

  private setupConnectionHandler(): void {
    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      console.log('New WebSocket connection')
      this.startHeartbeat(ws)

      ws.on('message', (data: Buffer) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString())
          this.handleMessage(ws, message).catch((err) => {
            captureError(err)
            this.sendError(ws, 'Internal server error')
          })
        } catch {
          this.sendError(ws, 'Invalid message format')
        }
      })

      ws.on('close', () => {
        this.handleDisconnect(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        captureError(error)
        this.handleDisconnect(ws)
      })
    })
  }

  private async handleMessage(ws: WebSocket, message: ClientMessage): Promise<void> {
    switch (message.type) {
      case 'join-room':
        await this.handleJoinRoom(ws, message)
        break
      case 'leave-room':
        await this.handleLeaveRoom(ws)
        break
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        this.handleRelayMessage(ws, message)
        break
      case 'data-channel-message':
        this.handleDataChannelMessage(ws, message)
        break
      default:
        this.sendError(ws, 'Unknown message type')
    }
  }

  private async handleJoinRoom(
    ws: WebSocket,
    message: { type: 'join-room'; roomId: string; from: string; displayName: string; timestamp: number },
  ): Promise<void> {
    const { roomId, from, displayName } = message

    await this.handleDisconnect(ws)

    if (!(await this.roomManager.getRoom(roomId))) {
      await this.roomManager.createRoom(roomId)
    }

    const participant: ParticipantInfo = {
      userId: from,
      displayName,
      joinedAt: Date.now(),
    }

    const result = await this.roomManager.joinRoom(roomId, participant)
    if (!result.success) {
      this.send(ws, {
        type: 'room-full',
        roomId,
        from: 'server',
        timestamp: Date.now(),
        maxParticipants: 2,
      })
      return
    }

    this.clients.set(ws, { userId: from, roomId })

    captureMetric('room.joined', 1, { roomId })

    const participants = await this.roomManager.getParticipants(roomId)
    this.send(ws, {
      type: 'room-joined',
      roomId,
      from: 'server',
      timestamp: Date.now(),
      participants,
    })

    this.broadcast(
      roomId,
      {
        type: 'participant-joined',
        roomId,
        from: 'server',
        timestamp: Date.now(),
        participant,
      },
      ws,
    )
  }

  private async handleLeaveRoom(ws: WebSocket): Promise<void> {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    const { roomId, userId } = clientInfo
    await this.roomManager.leaveRoom(roomId, userId)
    this.clients.delete(ws)

    captureMetric('room.left', 1, { roomId })

    this.broadcast(roomId, {
      type: 'participant-left',
      roomId,
      from: 'server',
      timestamp: Date.now(),
      userId,
    })
  }

  private handleRelayMessage(ws: WebSocket, message: ClientMessage): void {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    this.broadcast(clientInfo.roomId, message as unknown as ServerMessage, ws)
  }

  private handleDataChannelMessage(ws: WebSocket, message: ClientMessage): void {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    this.broadcast(clientInfo.roomId, message as unknown as ServerMessage, ws)
  }

  private async handleDisconnect(ws: WebSocket): Promise<void> {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    const { roomId, userId } = clientInfo
    await this.roomManager.leaveRoom(roomId, userId)
    this.clients.delete(ws)

    captureMetric('websocket.disconnected', 1, { roomId })

    this.broadcast(roomId, {
      type: 'participant-left',
      roomId,
      from: 'server',
      timestamp: Date.now(),
      userId,
    })
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private broadcast(roomId: string, message: ServerMessage, exclude?: WebSocket): void {
    this.clients.forEach((clientInfo, clientWs) => {
      if (clientInfo.roomId === roomId && clientWs !== exclude) {
        this.send(clientWs, message)
      }
    })
  }

  private sendError(ws: WebSocket, error: string): void {
    this.send(ws, {
      type: 'error',
      roomId: '',
      from: 'server',
      timestamp: Date.now(),
      error,
    })
  }

  getRoomManager(): IRoomManager {
    return this.roomManager
  }

  getClientCount(): number {
    return this.clients.size
  }
}
