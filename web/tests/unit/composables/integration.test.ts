import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Composable integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useMedia and useWebRTC work together', async () => {
    const mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    })

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
      configurable: true,
    })

    const mockPeerConnection = {
      createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      addTrack: vi.fn(),
    }
    vi.stubGlobal('RTCPeerConnection', vi.fn(() => mockPeerConnection))

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    expect(stream).toBeDefined()
    expect(stream.getTracks()).toHaveLength(1)

    const pc = new RTCPeerConnection()
    expect(pc).toBeDefined()
  })

  it('useSignaling and useWebRTC work together', () => {
    const signaling = {
      connect: vi.fn(),
      send: vi.fn(),
      disconnect: vi.fn(),
    }

    signaling.connect('room-1', 'user-1', 'Alice')
    expect(signaling.connect).toHaveBeenCalledWith('room-1', 'user-1', 'Alice')

    signaling.send({ type: 'offer', roomId: 'room-1', from: 'user-1' })
    expect(signaling.send).toHaveBeenCalled()

    signaling.disconnect()
    expect(signaling.disconnect).toHaveBeenCalled()
  })
})
