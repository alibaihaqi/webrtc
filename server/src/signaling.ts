import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { RoomManager } from './state.js'
import type {
  ClientMessage,
  ServerMessage,
  ParticipantInfo,
} from './protocol.js'

export class SignalingServer {
  private wss: WebSocketServer
  private roomManager: RoomManager
  private clients: Map<WebSocket, { userId: string; roomId: string }> = new Map()

  constructor(wss: WebSocketServer) {
    this.wss = wss
    this.roomManager = new RoomManager()
    this.setupConnectionHandler()
  }

  private setupConnectionHandler(): void {
    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      console.log('New WebSocket connection')

      ws.on('message', (data: Buffer) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch {
          this.sendError(ws, 'Invalid message format')
        }
      })

      ws.on('close', () => {
        this.handleDisconnect(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.handleDisconnect(ws)
      })
    })
  }

  private handleMessage(ws: WebSocket, message: ClientMessage): void {
    switch (message.type) {
      case 'join-room':
        this.handleJoinRoom(ws, message)
        break
      case 'leave-room':
        this.handleLeaveRoom(ws)
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

  private handleJoinRoom(
    ws: WebSocket,
    message: { type: 'join-room'; roomId: string; from: string; displayName: string; timestamp: number },
  ): void {
    const { roomId, from, displayName } = message

    this.handleDisconnect(ws)

    if (!this.roomManager.getRoom(roomId)) {
      this.roomManager.createRoom(roomId)
    }

    const participant: ParticipantInfo = {
      userId: from,
      displayName,
      joinedAt: Date.now(),
    }

    const result = this.roomManager.joinRoom(roomId, participant)
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

    const participants = this.roomManager.getParticipants(roomId)
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

  private handleLeaveRoom(ws: WebSocket): void {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    const { roomId, userId } = clientInfo
    this.roomManager.leaveRoom(roomId, userId)
    this.clients.delete(ws)

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

    this.broadcast(clientInfo.roomId, message as ServerMessage, ws)
  }

  private handleDataChannelMessage(ws: WebSocket, message: ClientMessage): void {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    this.broadcast(clientInfo.roomId, message as ServerMessage, ws)
  }

  private handleDisconnect(ws: WebSocket): void {
    const clientInfo = this.clients.get(ws)
    if (!clientInfo) return

    const { roomId, userId } = clientInfo
    this.roomManager.leaveRoom(roomId, userId)
    this.clients.delete(ws)

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

  getRoomManager(): RoomManager {
    return this.roomManager
  }

  getClientCount(): number {
    return this.clients.size
  }
}
