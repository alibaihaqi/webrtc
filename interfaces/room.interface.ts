export interface IRoomActionButton {
  isActive: boolean
  title: string
  iconPath: string
}

export type TActionButton = 'setMicrophone' | 'setVideo'

export interface IInitiateRoom {
  isHostMeeting: boolean
  roomId?: string
}

export interface IRoomState {
  messages: any[]
  roomId: string
  roomUsers: any[]
  signalConnections: any[]
  socketId: string
  isDisableToRoomButton: boolean
  isHostMeeting: boolean
  isMicrophoneActive: boolean
  isVideoActive: boolean
}