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
      getSenders: vi.fn().mockReturnValue([]),
      close: vi.fn(),
      onicecandidate: null,
      ontrack: null,
      onconnectionstatechange: null,
      oniceconnectionstatechange: null,
      connectionState: 'new',
      iceConnectionState: 'new',
      remoteDescription: null,
    }
    vi.stubGlobal('RTCPeerConnection', vi.fn().mockImplementation(function() { return mockPeerConnection }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        username: '12345:user',
        credential: 'mock-credential',
        urls: ['turn:localhost:3478'],
      }),
    }))
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

  describe('TURN credentials', () => {
    it('fetches TURN credentials when creating peer connection', async () => {
      const fetchSpy = vi.mocked(globalThis.fetch)
      const { createOffer } = useWebRTC()
      await createOffer()

      expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3001/turn-credentials')
    })

    it('passes TURN servers to RTCPeerConnection', async () => {
      const { createOffer } = useWebRTC()
      await createOffer()

      expect(RTCPeerConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          iceServers: expect.arrayContaining([
            expect.objectContaining({
              urls: ['turn:localhost:3478'],
              username: '12345:user',
              credential: 'mock-credential',
            }),
          ]),
        })
      )
    })

    it('gracefully handles fetch failure', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { createOffer } = useWebRTC()
      await createOffer()

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch TURN credentials:', expect.any(Error))
      expect(RTCPeerConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          iceServers: [],
        })
      )
      consoleSpy.mockRestore()
    })
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

  describe('track replacement', () => {
    it('should replace track on sender by kind', async () => {
      const mockSender = {
        track: { kind: 'video' },
        replaceTrack: vi.fn().mockResolvedValue(undefined),
      }
      mockPeerConnection.getSenders = vi.fn().mockReturnValue([mockSender])

      const { createOffer, replaceTrack } = useWebRTC()
      await createOffer()

      const newTrack = { kind: 'video' } as MediaStreamTrack
      await replaceTrack('video', newTrack)

      expect(mockSender.replaceTrack).toHaveBeenCalledWith(newTrack)
    })

    it('should do nothing when no peer connection exists', async () => {
      const { replaceTrack } = useWebRTC()

      const newTrack = { kind: 'video' } as MediaStreamTrack
      await replaceTrack('video', newTrack)

      // No error thrown = success
    })

    it('should do nothing when no matching sender found', async () => {
      mockPeerConnection.getSenders = vi.fn().mockReturnValue([])

      const { createOffer, replaceTrack } = useWebRTC()
      await createOffer()

      const newTrack = { kind: 'video' } as MediaStreamTrack
      await replaceTrack('video', newTrack)

      // No error thrown = success
    })

    it('should listen for track-replaced events and call replaceTrack', async () => {
      const mockSender = {
        track: { kind: 'video' },
        replaceTrack: vi.fn().mockResolvedValue(undefined),
      }
      mockPeerConnection.getSenders = vi.fn().mockReturnValue([mockSender])

      const { createOffer } = useWebRTC()
      await createOffer()

      const newTrack = { kind: 'video' } as MediaStreamTrack
      window.dispatchEvent(new CustomEvent('track-replaced', { detail: { kind: 'video', track: newTrack } }))

      expect(mockSender.replaceTrack).toHaveBeenCalledWith(newTrack)
    })

    it('should expose replaceTrack in return value', () => {
      const { replaceTrack } = useWebRTC()
      expect(typeof replaceTrack).toBe('function')
    })
  })
})
