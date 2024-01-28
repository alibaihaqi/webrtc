import type { IInitiateRoom } from '@/interfaces/room.interface'
import { useRoomStore } from '@/stores/room.store'

export const checkAvailabilityRoom = async (payload: IInitiateRoom) => {
  const config = useRuntimeConfig()
  const roomStore = useRoomStore()
  const { data, error } = await useFetch(`${config.public.apiDomain}/rtc/check-room`, {
    lazy: true,
    server: false,
    method: 'POST',
    body: {
      roomId: payload.roomId,
    },
  })

  if (error.value) {
    console.log('Error RTC check room:', error.value)

    return {
      success: false,
    }
  }

  roomStore.setIsHostMeeting(false)
  roomStore.setRoomId(payload.roomId as string)
  return data.value
}
