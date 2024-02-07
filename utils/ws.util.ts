import { useRoomStore } from '@/stores/room.store'
import { constructMessage } from '@/utils/message.util'
import {
  disconnectStream,
  handleSignalingData,
  initiatePeerConnection,
  removePeerConnection,
} from '@/utils/rtc.util'

let socket: WebSocket | null = null

export const initiateSocket = () => {
  const roomStore = useRoomStore()
  const config = useRuntimeConfig()
  socket = new WebSocket(config.public.wsDomain)

  socket.onopen = () => {
    const messageClientId = {
      action: 'message',
      event: 'client-id',
    }
    socket?.send(constructMessage(messageClientId))
    
    roomStore.setIsDisableToRoomButton(false)
  }

  socket.addEventListener('message', ({ data }: any) => {
    const message = JSON.parse(data)

    switch (message.event) {
      case 'client-id':
        roomStore.setSocketId(message.connectionId)
        break
      case 'create-room': {
        roomStore.setRoomId(message.roomId)
        break
      }
      case 'room-users': {
        roomStore.setRoomUsers(message.connectedUsers)
        break
      }
      case 'connection-prepare': {
        initiatePeerConnection(message.connectedSocketId, false)
        
        const messageConnectionInit = {
          action: 'message',
          event: 'connection-init',
          data: { connectionId: message.connectedSocketId }
        }
        const emitMessage = constructMessage(messageConnectionInit)
        socket?.send(emitMessage)
        break
      }
      case 'connection-init': {
        initiatePeerConnection(message.connectedSocketId, true)
        break
      }
      case 'connection-signal': {
        handleSignalingData(message)
        break
      }
      case 'user-disconnected': {
        removePeerConnection(message.connectionId)
        break
      }
    }
  })
}

export const disconnectWebSocket = () => {
  disconnectStream()
  socket?.close()
}

export const wsCreateRoom = (name: string) => {
  const message = {
    action: 'message',
    event: 'create-room',
    data: { name },
  }
  socket?.send(constructMessage(message))
}

export const wsJoinRoom = (roomId: string, name: string) => {
  const message = {
    action: 'message',
    event: 'join-room',
    data: { roomId: roomId, name }
  }
  socket?.send(constructMessage(message))
}

export const signalPeerData = (data: any) => {
  // const roomStore = useRoomStore()

  // const isSignalConnectionSent = roomStore.signalConnections.filter((signalConnection) => {
  //   return signalConnection.connectionId === data.connectionId && signalConnection?.signal?.type === data?.signal?.type
  // })

  // if (!isSignalConnectionSent.length) {
    // roomStore.setSignalConnections(data)
  // }
  const message = {
    action: 'message',
    event: 'connection-signal',
    data
  }
  socket?.send(constructMessage(message))
}