export interface IRoomActionButton {
  isActive: boolean
  title: string
  iconPath: string
}

export type TActionButton = 'setMicrophone' | 'setVideo' | 'setIsShowParticipants'

export interface IInitiateRoom {
  isHostMeeting: boolean
  roomId?: string
}

export interface IRoomUser {
  connectionId: string
  name: string | null
  userId: string
}

export interface IRoomState {
  messages: any[]
  roomId: string
  roomUsers: IRoomUser[]
  signalConnections: any[]
  socketId: string
  isDisableToRoomButton: boolean
  isHostMeeting: boolean
  isMicrophoneActive: boolean
  isShowParticipants: boolean
  isVideoActive: boolean
}