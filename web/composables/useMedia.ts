import { ref, readonly, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useMedia() {
  const localStream: Ref<MediaStream | null> = ref(null)
  const error: Ref<string | null> = ref(null)
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  const devices = ref<MediaDeviceInfo[]>([])
  const activeCameraId = ref('')
  const activeMicrophoneId = ref('')

  async function enumerateDevices(): Promise<void> {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      devices.value = allDevices.filter(d => d.kind === 'videoinput' || d.kind === 'audioinput')
    } catch (e) {
      console.error('Failed to enumerate devices:', e)
    }
  }

  async function getMedia(constraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    error.value = null
    const video = constraints?.video ?? true
    const audio = constraints?.audio ?? true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
      localStream.value = stream
      trackActiveDevices(stream)
      await enumerateDevices()
      return stream
    } catch {
      // Fall back based on what was requested
    }

    if (audio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false })
        localStream.value = stream
        trackActiveDevices(stream)
        await enumerateDevices()
        return stream
      } catch {
        // Continue to next fallback
      }
    }

    if (video) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio })
        localStream.value = stream
        trackActiveDevices(stream)
        await enumerateDevices()
        return stream
      } catch {
        // All fallbacks failed
      }
    }

    error.value = 'No camera or microphone found'
    return null
  }

  function trackActiveDevices(stream: MediaStream) {
    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]
    if (videoTrack) activeCameraId.value = videoTrack.getSettings().deviceId || ''
    if (audioTrack) activeMicrophoneId.value = audioTrack.getSettings().deviceId || ''
  }

  async function switchCamera(deviceId: string): Promise<boolean> {
    if (!localStream.value) return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      })

      const newVideoTrack = stream.getVideoTracks()[0]
      const oldVideoTrack = localStream.value.getVideoTracks()[0]

      if (oldVideoTrack) {
        localStream.value.removeTrack(oldVideoTrack)
        oldVideoTrack.stop()
      }

      localStream.value.addTrack(newVideoTrack)
      activeCameraId.value = deviceId

      window.dispatchEvent(new CustomEvent('track-replaced', {
        detail: { kind: 'video', track: newVideoTrack },
      }))

      return true
    } catch (e) {
      console.error('Failed to switch camera:', e)
      return false
    }
  }

  async function switchMicrophone(deviceId: string): Promise<boolean> {
    if (!localStream.value) return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { deviceId: { exact: deviceId } },
      })

      const newAudioTrack = stream.getAudioTracks()[0]
      const oldAudioTrack = localStream.value.getAudioTracks()[0]

      if (oldAudioTrack) {
        localStream.value.removeTrack(oldAudioTrack)
        oldAudioTrack.stop()
      }

      localStream.value.addTrack(newAudioTrack)
      activeMicrophoneId.value = deviceId

      window.dispatchEvent(new CustomEvent('track-replaced', {
        detail: { kind: 'audio', track: newAudioTrack },
      }))

      return true
    } catch (e) {
      console.error('Failed to switch microphone:', e)
      return false
    }
  }

  function toggleMute() {
    if (localStream.value) {
      const audioTrack = localStream.value.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        isMuted.value = !audioTrack.enabled
      }
    }
  }

  function toggleVideo() {
    if (localStream.value) {
      const videoTrack = localStream.value.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        isVideoOff.value = !videoTrack.enabled
      }
    }
  }

  function cleanup() {
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    localStream, error, isMuted, isVideoOff,
    getMedia, toggleMute, toggleVideo, cleanup,
    devices: readonly(devices),
    activeCameraId: readonly(activeCameraId),
    activeMicrophoneId: readonly(activeMicrophoneId),
    switchCamera,
    switchMicrophone,
  }
}
