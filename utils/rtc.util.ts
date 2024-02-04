// @ts-ignore
import Peer from 'simple-peer/simplepeer.min.js'
import type { SimplePeer } from 'simple-peer'

import { useFirebase } from '@/composables/firebase'
import { defaultMediaStreamConstraints, rtcPeerConfiguration } from '@/constants/rtc.constant'
import { useRoomStore } from '@/stores/room.store'
import {
  signalPeerData,
  wsCreateRoom,
  wsJoinRoom,
} from '@/utils/ws.util'

let localStream: null | MediaStream = null
let streams: MediaStream[] = []

export const getStreamPreview = async () => {
  const roomStore = useRoomStore()
  const config = useRuntimeConfig()
  const isMuteVideo = JSON.parse(config.public.isMuteVideo || 'true')
  console.log('isMuteVideo config', config.public.isMuteVideo)

  const firebase = useFirebase()
  const username = firebase?.userInfo?.value?.displayName as string

  try {
    localStream = await openMediaDevices(defaultMediaStreamConstraints)
    
    showVideoStream(localStream, roomStore.socketId, isMuteVideo)

    roomStore.isHostMeeting
      ? wsCreateRoom(username)
      : wsJoinRoom(roomStore.roomId, username)
  } catch (error) {
    console.log('Error open media devices:', error)
  }
}

const openMediaDevices = async (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints)
}

const getConnectedDevices = async (type: string) => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter(device => device.kind === type)
}

export const showVideoStream = (stream: MediaStream, socketId: string = '', isMuteVideo: boolean = true) => {
  console.log('isMuteVideo', isMuteVideo)
  const videosContainer = document.getElementById('videos_container')
  videosContainer?.classList.add('videos_container_styles')

  const videoContainer = document.createElement('div')
  videoContainer.classList.add('video_container_style')

  const videoElement = document.createElement('video')
  videoElement.autoplay = true
  videoElement.muted = isMuteVideo
  videoElement.srcObject = stream

  if (socketId) {
    videoContainer.id = socketId
    videoElement.id = `${socketId}.video`
  }

  videoElement.onloadedmetadata = () => {
    videoElement.play()
  }

  videoContainer.appendChild(videoElement)
  videosContainer?.appendChild(videoContainer)
}

export const disconnectStream = () => {
  const roomStore = useRoomStore()

  roomStore.$reset()
  localStream?.getAudioTracks()[0].stop()
  localStream?.getVideoTracks()[0].stop()
  localStream = null
}

export const micToggle = (value: boolean) => {
  if (!localStream) return

  localStream.getAudioTracks()[0].enabled = value
}

export const videoToggle = (value: boolean) => {
  if (!localStream) return

  localStream.getVideoTracks()[0].enabled = value
}

let peers: Record<string, InstanceType<SimplePeer>> = {}

export const initiatePeerConnection = (connectedSocketId: string, isInitiator: boolean) => {
  peers[connectedSocketId] = new Peer({
    initiator: isInitiator,
    config: rtcPeerConfiguration,
    stream: localStream as MediaStream,
  })

  peers[connectedSocketId].on('signal', (data: any) => {
    const signalData = {
      signal: data,
      connectionId: connectedSocketId,
    }
    signalPeerData(signalData)
  })

  peers[connectedSocketId].on('stream', (stream: any) => {
    addStream(stream, connectedSocketId)
    streams = [...streams, stream]
  })

  peers[connectedSocketId].on('data', (data: string) => {
    const messageData = JSON.parse(data)
    concatNewMessage(messageData)
  })
}

export const handleSignalingData = (data: any) => {
  peers[data.connectionId].signal(data.signal)
}

const addStream = (stream: MediaStream, connectedSocketId: string) => {
  const config = useRuntimeConfig()
  const isMuteVideo = JSON.parse(config.public.isMuteVideo || 'true')

  showVideoStream(stream, connectedSocketId, isMuteVideo)
}

export const concatNewMessage = (message: any) => {
  const roomStore = useRoomStore()
  roomStore.setMessages([...roomStore.messages, message])
}

export const removePeerConnection = (connectionId: string) => {

  const videoContainer = document.getElementById(connectionId)
  const videoElement = document.getElementById(`${connectionId}.video`) as any

  if (videoContainer && videoElement) {
    const tracks = videoElement.srcObject?.getTracks()
    tracks.forEach((t: any) => t.stop())

    videoElement.srcObject = null
    videoContainer.removeChild(videoElement)
    videoContainer.parentNode?.removeChild(videoContainer)

    if (peers[connectionId]) {
      peers[connectionId].destroy()
      delete peers[connectionId]
    }
  }
}
