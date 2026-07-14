import { ref, readonly, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useMedia } from './useMedia'

export type ConnectionState = 'new' | 'signaling' | 'connecting' | 'connected' | 'closed' | 'failed' | 'reconnecting'
export type IceState = 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed'

export interface WebRTCState {
  connectionState: ConnectionState
  iceState: IceState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  error: string | null
}

export function useWebRTC(iceConfig?: RTCConfiguration) {
  const { localStream, error: mediaError, getMedia, cleanup: cleanupMedia, toggleMute, toggleVideo, isMuted, isVideoOff } = useMedia()

  const connectionState: Ref<ConnectionState> = ref('new')
  const iceState: Ref<IceState> = ref('new')
  const remoteStream: Ref<MediaStream | null> = ref(null)
  const error: Ref<string | null> = ref(null)

  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 3
  const reconnectDelay = 2000

  const ICE_RESTART_MAX_ATTEMPTS = 3
  const iceRestartAttempts = ref(0)

  let peerConnection: RTCPeerConnection | null = null
  const pendingCandidates: RTCIceCandidateInit[] = []

  function replaceTrack(kind: 'audio' | 'video', newTrack: MediaStreamTrack): void {
    if (!peerConnection) return

    const sender = peerConnection.getSenders().find(s =>
      s.track?.kind === kind
    )

    if (sender) {
      sender.replaceTrack(newTrack)
        .then(() => console.log(`${kind} track replaced successfully`))
        .catch(e => console.error(`Failed to replace ${kind} track:`, e))
    }
  }

  function setupTrackReplacement(): void {
    window.addEventListener('track-replaced', ((event: CustomEvent) => {
      const { kind, track } = event.detail
      replaceTrack(kind, track)
    }) as EventListener)
  }

  function createPeerConnection() {
    peerConnection = new RTCPeerConnection(iceConfig)

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateEvent = new CustomEvent('ice-candidate', { detail: event.candidate })
        window.dispatchEvent(candidateEvent)
      }
    }

    peerConnection.ontrack = (event) => {
      remoteStream.value = event.streams[0]
    }

    peerConnection.onconnectionstatechange = () => {
      connectionState.value = peerConnection?.connectionState as ConnectionState
    }

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection?.iceConnectionState as IceState
      iceState.value = state

      if (state === 'failed' || state === 'disconnected') {
        console.log(`ICE connection ${state}, attempting restart`)
        iceRestart().then(success => {
          if (!success) {
            error.value = 'ICE connection failed, reconnecting...'
            window.dispatchEvent(new CustomEvent('ice-reconnect-needed'))
          }
        })
      }

      if (state === 'connected' || state === 'completed') {
        iceRestartAttempts.value = 0
      }
    }

    setupTrackReplacement()

    return peerConnection
  }

  async function attemptReconnect(): Promise<boolean> {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      error.value = 'Failed to reconnect after maximum attempts'
      return false
    }

    reconnectAttempts.value++
    connectionState.value = 'reconnecting'

    try {
      await new Promise(resolve => setTimeout(resolve, reconnectDelay * reconnectAttempts.value))

      const stream = await getMedia()
      if (!stream) {
        error.value = 'Failed to get media for reconnection'
        return false
      }

      if (peerConnection) {
        peerConnection.close()
      }
      createPeerConnection()

      stream.getTracks().forEach(track => {
        peerConnection?.addTrack(track, stream)
      })

      connectionState.value = 'signaling'
      return true
    } catch (e) {
      error.value = 'Reconnection failed'
      return false
    }
  }

  async function iceRestart(): Promise<boolean> {
    if (iceRestartAttempts.value >= ICE_RESTART_MAX_ATTEMPTS) {
      console.log('Max ICE restart attempts reached, falling back to full reconnect')
      return false
    }

    if (!peerConnection) return false

    iceRestartAttempts.value++
    console.log(`ICE restart attempt ${iceRestartAttempts.value}/${ICE_RESTART_MAX_ATTEMPTS}`)

    try {
      const offer = await peerConnection.createOffer({ iceRestart: true })
      await peerConnection.setLocalDescription(offer)

      window.dispatchEvent(new CustomEvent('ice-restart-offer', { detail: offer }))

      return true
    } catch (e) {
      console.error('ICE restart failed:', e)
      return false
    }
  }

  function resetReconnectAttempts() {
    reconnectAttempts.value = 0
  }

  async function createOffer(): Promise<RTCSessionDescriptionInit> {
    connectionState.value = 'signaling'
    if (!peerConnection) createPeerConnection()

    const offer = await peerConnection!.createOffer()
    await peerConnection!.setLocalDescription(offer)
    return offer
  }

  async function handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!peerConnection) createPeerConnection()
    await peerConnection!.setRemoteDescription(answer)
  }

  async function addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!peerConnection) createPeerConnection()

    if (peerConnection!.remoteDescription) {
      await peerConnection!.addIceCandidate(candidate)
    } else {
      pendingCandidates.push(candidate)
    }
  }

  async function flushPendingCandidates(): Promise<void> {
    if (peerConnection?.remoteDescription) {
      for (const candidate of pendingCandidates) {
        await peerConnection.addIceCandidate(candidate)
      }
      pendingCandidates.length = 0
    }
  }

  function addLocalTrack(track: MediaStreamTrack, stream: MediaStream) {
    peerConnection?.addTrack(track, stream)
  }

  async function hangup(): Promise<void> {
    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }
    connectionState.value = 'closed'
    remoteStream.value = null
    pendingCandidates.length = 0
    cleanupMedia()
  }

  function cleanup() {
    hangup()
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    connectionState: readonly(connectionState),
    iceState: readonly(iceState),
    localStream,
    remoteStream: readonly(remoteStream),
    error: error,
    mediaError,
    getMedia,
    createOffer,
    handleAnswer,
    addIceCandidate,
    flushPendingCandidates,
    addLocalTrack,
    hangup,
    cleanup,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoOff,
    reconnectAttempts: readonly(reconnectAttempts),
    maxReconnectAttempts,
    attemptReconnect,
    resetReconnectAttempts,
    iceRestartAttempts: readonly(iceRestartAttempts),
    iceRestart,
    replaceTrack,
  }
}
