export interface IRoomActionButton {
  isActive: boolean
  title: string
  iconPath: string
}

export type TActionButton = 'setMicrophone' | 'setVideo' | 'setIsShowParticipants' | 'setIsShowRoomChats'

export interface IInitiateRoom {
  isHostMeeting: boolean
  roomId?: string
}

export interface IRoomUser {
  connectionId: string
  name: string | null
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
  isShowRoomChats: boolean
  isShowParticipants: boolean
  isVideoActive: boolean
}

export interface IChatMessage {
  socketId: string
  name: string
  content: string
  isDirectMessage?: boolean
  targetSocketId?: string
}
