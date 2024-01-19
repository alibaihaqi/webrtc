import { useRoomStore } from '@/stores/room.store'
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

  socket.addEventListener('open', () => {
    const message = JSON.stringify({ action: 'message', event: 'client-id' })
    socket?.send(message)
  })

  socket.addEventListener('message', ({ data }: any) => {
    const message = JSON.parse(data)
    console.log('addEventListener', message)
    switch (message.event) {
      case 'client-id': {
        console.log('message.data', message.data, config.public.wsDomain)
        roomStore.setSocketId(message.data)
      }
      case 'connection-prepare': {
        initiatePeerConnection(data.connectedSocketId, false)
        
        const emitMessage = JSON.stringify({ event: 'connection-init', data: { connectedSocketId: data.connectedSocketId }})
        socket?.send(emitMessage)
      }
      case 'connection-signal': handleSignalingData(message.data)
      case 'connection-init': initiatePeerConnection(message.data.connectedSocketId, true)
      case 'user-disconnected': removePeerConnection(message.data)
    }

  })
}

export const disconnectWebSocket = () => {
  disconnectStream()
  socket?.close()
}

export const wsCreateRoom = () => {

}

export const wsJoinRoom = () => {
  
}

export const signalPeerData = (data: any) => {
  const message = JSON.stringify({ event: 'connection-signal', data })
  socket?.send(message)
}