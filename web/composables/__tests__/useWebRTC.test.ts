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
})
