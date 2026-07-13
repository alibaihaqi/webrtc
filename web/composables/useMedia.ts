import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useMedia() {
  const localStream: Ref<MediaStream | null> = ref(null)
  const error: Ref<string | null> = ref(null)
  const isMuted = ref(false)
  const isVideoOff = ref(false)

  async function getMedia(constraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    error.value = null
    const video = constraints?.video ?? true
    const audio = constraints?.audio ?? true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
      localStream.value = stream
      return stream
    } catch {
      // Fall back based on what was requested
    }

    if (audio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false })
        localStream.value = stream
        return stream
      } catch {
        // Continue to next fallback
      }
    }

    if (video) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio })
        localStream.value = stream
        return stream
      } catch {
        // All fallbacks failed
      }
    }

    error.value = 'No camera or microphone found'
    return null
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

  return { localStream, error, isMuted, isVideoOff, getMedia, toggleMute, toggleVideo, cleanup }
}
