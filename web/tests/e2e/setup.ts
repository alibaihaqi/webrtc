import { vi } from 'vitest'

Object.defineProperty(globalThis, 'RTCPeerConnection', {
  value: vi.fn().mockImplementation(() => ({
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
    connectionState: 'new',
  })),
})

Object.defineProperty(globalThis, 'navigator', {
  value: {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  },
})
