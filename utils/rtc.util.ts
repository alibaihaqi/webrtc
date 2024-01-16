import { defaultMediaStreamConstraints, rtcPeerConfiguration } from '@/constants/rtc.constant'
import { useRoomStore } from '@/stores/room.store'
import { createMeetingRoom } from '@/utils/firebase.util'

let localStream: null | MediaStream = null
let peerConnection: null | RTCPeerConnection = null
let streams: MediaStream[] = []

export const getStreamPreview = async (config: any) => {
  try {
    localStream = await openMediaDevices(defaultMediaStreamConstraints)

    showVideoStream(localStream)

    localStream.getTracks().forEach(track => {
      peerConnection?.addTrack(track, localStream as MediaStream);
    })
  } catch (error) {
    console.log(error)
  }
}

const openMediaDevices = async (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints)
}

const getConnectedDevices = async (type: string) => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter(device => device.kind === type)
}

export const showVideoStream = (stream: MediaStream) => {
  const videosContainer = document.getElementById('videos_container')
  videosContainer?.classList.add('videos_container_styles')

  const videoContainer = document.createElement('div')
  videoContainer.classList.add('video_container_style')

  const videoElement = document.createElement('video')
  videoElement.autoplay = true
  videoElement.muted = true
  videoElement.srcObject = stream

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

export const prepareNewPeerConnection = () => {
  peerConnection = new RTCPeerConnection(rtcPeerConfiguration)
}

export const registerPeerConnectionListeners = () => {
  peerConnection?.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection?.iceGatheringState}`);
  });

  peerConnection?.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection?.connectionState}`);
  });

  peerConnection?.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection?.signalingState}`);
  });

  peerConnection?.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection?.iceConnectionState}`);
  });
}