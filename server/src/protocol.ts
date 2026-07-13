// Message types for client-server communication

export interface BaseMessage {
  type: string
  roomId: string
  from: string
  timestamp: number
}

// Client -> Server messages
export interface JoinRoomMessage extends BaseMessage {
  type: 'join-room'
  displayName: string
}

export interface LeaveRoomMessage extends BaseMessage {
  type: 'leave-room'
}

export interface OfferMessage extends BaseMessage {
  type: 'offer'
  sdp: RTCSessionDescriptionInit
}

export interface AnswerMessage extends BaseMessage {
  type: 'answer'
  sdp: RTCSessionDescriptionInit
}

export interface IceCandidateMessage extends BaseMessage {
  type: 'ice-candidate'
  candidate: RTCIceCandidateInit
}

export interface DataChannelMessage extends BaseMessage {
  type: 'data-channel-message'
  data: unknown
}

// Server -> Client messages
export interface RoomJoinedMessage extends BaseMessage {
  type: 'room-joined'
  participants: ParticipantInfo[]
}

export interface ParticipantJoinedMessage extends BaseMessage {
  type: 'participant-joined'
  participant: ParticipantInfo
}

export interface ParticipantLeftMessage extends BaseMessage {
  type: 'participant-left'
  userId: string
}

export interface RoomFullMessage extends BaseMessage {
  type: 'room-full'
  maxParticipants: number
}

export interface ErrorMessage extends BaseMessage {
  type: 'error'
  error: string
}

// Types
export interface ParticipantInfo {
  userId: string
  displayName: string
  joinedAt: number
}

// Discriminated union
export type ClientMessage =
  | JoinRoomMessage
  | LeaveRoomMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | DataChannelMessage

export type ServerMessage =
  | RoomJoinedMessage
  | ParticipantJoinedMessage
  | ParticipantLeftMessage
  | RoomFullMessage
  | ErrorMessage
