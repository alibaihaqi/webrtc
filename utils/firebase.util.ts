import { useFirestore, useDocument } from 'vuefire'
import {
  addDoc,
  collection,
  doc,
} from 'firebase/firestore'
import { useRoomStore } from '@/stores/room.store'
import type { IInitiateRoom } from '~/interfaces/room.interface'

const db = useFirestore()
const roomStore = useRoomStore()

export const createMeetingRoom = async () => {
  try {
    const result = await addDoc(collection(db, 'rooms'), {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    })

    roomStore.setRoomId(result.id)
    return {
      success: true,
    }
  } catch (error) {
    console.log('Error create room:', error)
    return {
      success: false,
      message: error
    }
  }
}

export const joinMeetingRoom = async (roomId: string) => {
  const {
    promise: result,
  } = useDocument(doc(collection(db, 'rooms'), roomId), { once: true })
  const meetingById = await result.value
  if (!meetingById) {
    return {
      success: false,
    }
  }

  roomStore.setRoomId(meetingById?.id)
  return {
    success: true,
  }
}

export const initiateRoom = async ({
  isHostMeeting,
  roomId,
}: IInitiateRoom) => {
  if (isHostMeeting) {
    return createMeetingRoom()
  } else return joinMeetingRoom(roomId as string)
}