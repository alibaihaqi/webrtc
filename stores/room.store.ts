import { defineStore } from 'pinia'
import type { IRoomState } from '@/interfaces/room.interface'
import { micToggle, videoToggle } from '@/utils/rtc.util'

export const useRoomStore = defineStore({
  id: 'roomStore',
  state: (): IRoomState => ({
    messages: [],
    roomId: '',
    roomUsers: [],
    signalConnections: [],
    socketId: '',
    isDisableToRoomButton: true,
    isHostMeeting: true,
    isMicrophoneActive: true,
    isVideoActive: true,
  }),
  actions: {
    resetToDefaultState() {
      this.messages = []
      this.roomId = ''
      this.roomUsers = []
      this.signalConnections = []
      this.socketId = ''
      this.isDisableToRoomButton = true
      this.isHostMeeting = true
      this.isMicrophoneActive = true
      this.isVideoActive = true
    },
    setMessages(messages: any) {
      this.messages = messages
    },
    setRoomId(value: string) {
      this.roomId = value
    },
    setRoomUsers(value: any) {
      this.roomUsers = value
    },
    setSignalConnections(value: any) {
      this.signalConnections.push(value)
    },
    setIsDisableToRoomButton(value: boolean) {
      this.isDisableToRoomButton = value
    },
    setIsHostMeeting(value: boolean) {
      this.isHostMeeting = value
    },
    setMicrophone() {
      this.isMicrophoneActive = !this.isMicrophoneActive

      micToggle(this.isMicrophoneActive)
    },
    setSocketId(value: string) {
      this.socketId = value
    },
    setVideo() {
      this.isVideoActive = !this.isVideoActive

      videoToggle(this.isVideoActive)
    }
  }
})
