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
    roomStore.setIsDisableToRoomButton(false)
  }

  socket.addEventListener('message', ({ data }: any) => {
    const message = JSON.parse(data)

    switch (message.event) {
      case 'create-room': {
        roomStore.setSocketId(message.connectionId)
        roomStore.setRoomId(message.roomId)
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
      case 'connection-signal': {
        handleSignalingData(message)
        break
      }
      case 'connection-init': {
        initiatePeerConnection(message.connectedSocketId, true)
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

export const wsCreateRoom = () => {
  const message = {
    action: 'message',
    event: 'create-room',
  }
  socket?.send(constructMessage(message))
}

export const wsJoinRoom = (roomId: string) => {
  const message = {
    action: 'message',
    event: 'join-room',
    data: { roomId: roomId }
  }
  socket?.send(constructMessage(message))
}

export const signalPeerData = (data: any) => {
  const message = {
    action: 'message',
    event: 'connection-signal',
    data
  }
  socket?.send(constructMessage(message))
}