import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SignalingServer } from '../signaling'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer, Server } from 'http'

describe('SignalingServer', () => {
  let httpServer: Server
  let wss: WebSocketServer
  let signaling: SignalingServer
  let client1: WebSocket
  let client2: WebSocket
  let port: number

  beforeEach(async () => {
    httpServer = createServer()
    wss = new WebSocketServer({ server: httpServer })
    signaling = new SignalingServer(wss)

    await new Promise<void>((resolve) => httpServer.listen(0, resolve))
    port = (httpServer.address() as any).port
  })

  afterEach(async () => {
    if (client1?.readyState === WebSocket.OPEN) client1.close()
    if (client2?.readyState === WebSocket.OPEN) client2.close()
    wss.close()
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
  })

  function createClient(): Promise<WebSocket> {
    return new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${port}`)
      ws.on('open', () => resolve(ws))
    })
  }

  function waitForMessage(ws: WebSocket): Promise<any> {
    return new Promise((resolve) => {
      ws.once('message', (data) => resolve(JSON.parse(data.toString())))
    })
  }

  function waitForMessageType(ws: WebSocket, type: string): Promise<any> {
    return new Promise((resolve) => {
      const handler = (data: Buffer) => {
        const msg = JSON.parse(data.toString())
        if (msg.type === type) {
          ws.off('message', handler)
          resolve(msg)
        }
      }
      ws.on('message', handler)
    })
  }

  function joinRoom(ws: WebSocket, roomId: string, userId: string, displayName: string) {
    ws.send(JSON.stringify({
      type: 'join-room',
      roomId,
      from: userId,
      displayName,
      timestamp: Date.now(),
    }))
  }

  it('handles join-room and returns room-joined', async () => {
    client1 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')

    const response = await waitForMessage(client1)

    expect(response.type).toBe('room-joined')
    expect(response.roomId).toBe('room-1')
    expect(response.participants).toHaveLength(1)
    expect(response.participants[0].userId).toBe('user-1')
    expect(response.participants[0].displayName).toBe('Alice')
  })

  it('notifies existing participants when someone joins', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')

    const joinerMsg = await waitForMessage(client2)
    expect(joinerMsg.type).toBe('room-joined')
    expect(joinerMsg.participants).toHaveLength(2)

    const existingMsg = await waitForMessageType(client1, 'participant-joined')
    expect(existingMsg.participant.userId).toBe('user-2')
    expect(existingMsg.participant.displayName).toBe('Bob')
  })

  it('enforces max 2 participants with room-full', async () => {
    client1 = await createClient()
    client2 = await createClient()
    const client3 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)

    joinRoom(client3, 'room-1', 'user-3', 'Charlie')

    const fullMsg = await waitForMessage(client3)
    expect(fullMsg.type).toBe('room-full')
    expect(fullMsg.maxParticipants).toBe(2)

    client3.close()
  })

  it('relays offer from one participant to others', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)
    await waitForMessageType(client1, 'participant-joined')

    client1.send(JSON.stringify({
      type: 'offer',
      roomId: 'room-1',
      from: 'user-1',
      sdp: { type: 'offer', sdp: 'mock-sdp-offer' },
      timestamp: Date.now(),
    }))

    const offer = await waitForMessage(client2)
    expect(offer.type).toBe('offer')
    expect(offer.from).toBe('user-1')
    expect(offer.sdp.sdp).toBe('mock-sdp-offer')
  })

  it('relays answer from one participant to others', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)
    await waitForMessageType(client1, 'participant-joined')

    client2.send(JSON.stringify({
      type: 'answer',
      roomId: 'room-1',
      from: 'user-2',
      sdp: { type: 'answer', sdp: 'mock-sdp-answer' },
      timestamp: Date.now(),
    }))

    const answer = await waitForMessage(client1)
    expect(answer.type).toBe('answer')
    expect(answer.from).toBe('user-2')
  })

  it('relays ice-candidate between participants', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)
    await waitForMessageType(client1, 'participant-joined')

    client1.send(JSON.stringify({
      type: 'ice-candidate',
      roomId: 'room-1',
      from: 'user-1',
      candidate: { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 },
      timestamp: Date.now(),
    }))

    const ice = await waitForMessage(client2)
    expect(ice.type).toBe('ice-candidate')
    expect(ice.from).toBe('user-1')
    expect(ice.candidate.candidate).toBe('mock-candidate')
  })

  it('notifies others on disconnect', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)
    await waitForMessageType(client1, 'participant-joined')

    client1.close()

    const leftMsg = await waitForMessage(client2)
    expect(leftMsg.type).toBe('participant-left')
    expect(leftMsg.userId).toBe('user-1')
  })

  it('allows rejoining after disconnect', async () => {
    client1 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    client1.close()

    client1 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')

    const response = await waitForMessage(client1)
    expect(response.type).toBe('room-joined')
    expect(response.participants).toHaveLength(1)
  })

  it('returns error for invalid JSON', async () => {
    client1 = await createClient()
    client1.send('not json')

    const error = await waitForMessage(client1)
    expect(error.type).toBe('error')
    expect(error.error).toBe('Invalid message format')
  })

  it('returns error for unknown message type', async () => {
    client1 = await createClient()
    client1.send(JSON.stringify({ type: 'unknown', roomId: '', from: '', timestamp: Date.now() }))

    const error = await waitForMessage(client1)
    expect(error.type).toBe('error')
    expect(error.error).toBe('Unknown message type')
  })

  it('tracks client count', async () => {
    expect(signaling.getClientCount()).toBe(0)

    client1 = await createClient()
    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    expect(signaling.getClientCount()).toBe(1)

    client2 = await createClient()
    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)

    expect(signaling.getClientCount()).toBe(2)
  })

  it('does not relay messages to the sender', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-1', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-1', 'user-2', 'Bob')
    await waitForMessage(client2)
    await waitForMessageType(client1, 'participant-joined')

    client1.send(JSON.stringify({
      type: 'offer',
      roomId: 'room-1',
      from: 'user-1',
      sdp: { type: 'offer', sdp: 'test' },
      timestamp: Date.now(),
    }))

    const received = await waitForMessage(client2)
    expect(received.type).toBe('offer')

    let senderReceived = false
    client1.on('message', () => { senderReceived = true })
    await new Promise((r) => setTimeout(r, 100))
    expect(senderReceived).toBe(false)
  })

  it('isolates rooms from each other', async () => {
    client1 = await createClient()
    client2 = await createClient()

    joinRoom(client1, 'room-A', 'user-1', 'Alice')
    await waitForMessage(client1)

    joinRoom(client2, 'room-B', 'user-2', 'Bob')
    await waitForMessage(client2)

    client1.send(JSON.stringify({
      type: 'offer',
      roomId: 'room-A',
      from: 'user-1',
      sdp: { type: 'offer', sdp: 'test' },
      timestamp: Date.now(),
    }))

    let received = false
    client2.on('message', () => { received = true })
    await new Promise((r) => setTimeout(r, 100))
    expect(received).toBe(false)
  })
})
