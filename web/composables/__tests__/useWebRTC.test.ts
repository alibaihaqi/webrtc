import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWebRTC } from '../useWebRTC'

vi.mock('../useMedia', () => ({
  useMedia: () => ({
    localStream: { value: null },
    error: { value: null },
    getMedia: vi.fn(),
    cleanup: vi.fn(),
  }),
}))

describe('useWebRTC', () => {
  let mockPeerConnection: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPeerConnection = {
      createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
      createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' }),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      setRemoteDescription: vi.fn().mockResolvedValue(undefined),
      addIceCandidate: vi.fn().mockResolvedValue(undefined),
      addTrack: vi.fn(),
      close: vi.fn(),
      onicecandidate: null,
      ontrack: null,
      onconnectionstatechange: null,
      oniceconnectionstatechange: null,
      connectionState: 'new',
      iceConnectionState: 'new',
      remoteDescription: null,
    }
    vi.stubGlobal('RTCPeerConnection', vi.fn(() => mockPeerConnection))
  })

  it('creates an offer', async () => {
    const { createOffer, connectionState } = useWebRTC()
    const offer = await createOffer()

    expect(offer).toEqual({ type: 'offer', sdp: 'mock-sdp' })
    expect(connectionState.value).toBe('signaling')
  })

  it('handles an answer', async () => {
    const { handleAnswer } = useWebRTC()
    mockPeerConnection.remoteDescription = { type: 'offer', sdp: 'mock-sdp' }
    await handleAnswer({ type: 'answer', sdp: 'mock-sdp' } as any)

    expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith({ type: 'answer', sdp: 'mock-sdp' })
  })

  it('adds ICE candidate', async () => {
    const { addIceCandidate } = useWebRTC()
    mockPeerConnection.remoteDescription = { type: 'offer', sdp: 'mock-sdp' }
    const candidate = { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 }
    await addIceCandidate(candidate as any)

    expect(mockPeerConnection.addIceCandidate).toHaveBeenCalledWith(candidate)
  })

  it('queues candidates when remote description not set', async () => {
    const { addIceCandidate } = useWebRTC()
    const candidate = { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 }
    await addIceCandidate(candidate as any)

    expect(mockPeerConnection.addIceCandidate).not.toHaveBeenCalled()
  })

  it('closes peer connection on hangup', async () => {
    const { createOffer, hangup, connectionState } = useWebRTC()
    await createOffer()
    await hangup()

    expect(mockPeerConnection.close).toHaveBeenCalled()
    expect(connectionState.value).toBe('closed')
  })

  describe('ICE restart', () => {
    it('should attempt ICE restart on failed connection', async () => {
      const { createOffer, iceRestart, iceRestartAttempts } = useWebRTC()
      await createOffer()

      const result = await iceRestart()

      expect(result).toBe(true)
      expect(iceRestartAttempts.value).toBe(1)
      expect(mockPeerConnection.createOffer).toHaveBeenCalledWith({ iceRestart: true })
      expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled()
    })

    it('should dispatch ice-restart-offer event', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      const { createOffer, iceRestart } = useWebRTC()
      await createOffer()

      await iceRestart()

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ice-restart-offer',
          detail: { type: 'offer', sdp: 'mock-sdp' },
        })
      )
      dispatchSpy.mockRestore()
    })

    it('should fall back to reconnect after max attempts', async () => {
      const { createOffer, iceRestart } = useWebRTC()
      await createOffer()

      await iceRestart()
      await iceRestart()
      await iceRestart()
      const result = await iceRestart()

      expect(result).toBe(false)
    })

    it('should reset attempts on successful connection', async () => {
      const { createOffer, iceRestartAttempts, iceRestart } = useWebRTC()
      await createOffer()

      await iceRestart()
      await iceRestart()
      expect(iceRestartAttempts.value).toBe(2)

      mockPeerConnection.iceConnectionState = 'connected'
      mockPeerConnection.oniceconnectionstatechange()

      expect(iceRestartAttempts.value).toBe(0)
    })

    it('should auto-attempt restart on ICE failed state', async () => {
      const { createOffer, iceRestartAttempts } = useWebRTC()
      await createOffer()

      mockPeerConnection.iceConnectionState = 'failed'
      mockPeerConnection.oniceconnectionstatechange()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(iceRestartAttempts.value).toBe(1)
    })

    it('should dispatch ice-reconnect-needed when restart fails', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      const { createOffer, iceRestart } = useWebRTC()
      await createOffer()

      await iceRestart()
      await iceRestart()
      await iceRestart()

      mockPeerConnection.iceConnectionState = 'failed'
      mockPeerConnection.oniceconnectionstatechange()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ice-reconnect-needed' })
      )
      dispatchSpy.mockRestore()
    })

    it('should return false when no peer connection exists', async () => {
      const { hangup, iceRestart } = useWebRTC()
      await hangup()

      const result = await iceRestart()
      expect(result).toBe(false)
    })
  })
})
