import { useFirestore, useDocument } from 'vuefire'
import {
  addDoc,
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore'
import type { IInitiateRoom } from '@/interfaces/room.interface'
import { useRoomStore } from '@/stores/room.store'

const db = useFirestore()
const roomStore = useRoomStore()

export const createMeetingRoom = async (offer: any) => {
  try {
    const result = await addDoc(collection(db, 'rooms'), {
      ...offer,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    })

    roomStore.setRoomId(result.id)
    return {
      success: true,
      roomRef: result
    }
  } catch (error) {
    console.log('Error create room:', error)
    return {
      success: false,
      message: error
    }
  }
}

export const getRoomById = async (roomId: string) => {
  const {
    promise: result,
  } = useDocument(doc(collection(db, 'rooms'), roomId), { once: true })

  return result.value
}

export const updateMeetingRoom = async (roomId: string, roomWithOffer: any) => {
  return updateDoc(doc(collection(db, 'rooms'), roomId), {
    ...roomWithOffer,
    updatedAt: Date.now(),
  })
}

export const checkAvailabilityRoom = async (payload: IInitiateRoom) => {
  const {
    promise: result,
  } = useDocument(doc(collection(db, 'rooms'), payload.roomId), { once: true })
  const meetingById = await result.value
  if (!meetingById) {
    return {
      success: false,
    }
  }

  roomStore.setIsHostMeeting(false)
  roomStore.setRoomId(meetingById?.id)
  return {
    success: true,
  }
}
