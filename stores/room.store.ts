import { defineStore } from 'pinia'
import { micToggle, videoToggle } from '@/utils/rtc.util'

export const useRoomStore = defineStore({
  id: 'roomStore',
  state: () => ({
    messages: [],
    roomId: '',
    socketId: '',
    isHostMeeting: true,
    isMicrophoneActive: true,
    isVideoActive: true,
  }),
  actions: {
    resetToDefaultState() {
      this.messages = []
      this.roomId = ''
      this.socketId = ''
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
