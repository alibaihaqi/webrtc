import { defineStore } from 'pinia'
import { micToggle, videoToggle } from '@/utils/rtc.util'

export const useRoomStore = defineStore({
  id: 'roomStore',
  state: () => ({
    roomId: '',
    isHostMeeting: true,
    isMicrophoneActive: true,
    isVideoActive: true,
  }),
  actions: {
    resetToDefaultState() {
      this.roomId = ''
      this.isHostMeeting = true
      this.isMicrophoneActive = true
      this.isVideoActive = true
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
    setVideo() {
      this.isVideoActive = !this.isVideoActive

      videoToggle(this.isVideoActive)
    }
  }
})
