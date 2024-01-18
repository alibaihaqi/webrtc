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
