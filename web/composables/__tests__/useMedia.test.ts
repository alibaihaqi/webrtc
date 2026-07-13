import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMedia } from '../useMedia'

describe('useMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
    })
  })

  it('gets user media with video and audio', async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)

    const { localStream, getMedia } = useMedia()
    await getMedia()

    expect(localStream.value).toEqual(mockStream)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true })
  })

  it('falls back to video only on audio failure', async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] }

    vi.spyOn(navigator.mediaDevices, 'getUserMedia')
      .mockRejectedValueOnce(new Error('Audio device not found'))
      .mockResolvedValueOnce(mockStream as any)

    const { localStream, getMedia } = useMedia()
    await getMedia()

    expect(localStream.value).toEqual(mockStream)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true })
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: false })
  })

  it('sets error when all fallbacks fail', async () => {
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(new Error('No device'))

    const { localStream, error, getMedia } = useMedia()
    await getMedia()

    expect(localStream.value).toBeNull()
    expect(error.value).toBe('No camera or microphone found')
  })

  it('stops tracks on cleanup', async () => {
    const mockTrack = { stop: vi.fn() }
    const mockStream = { getTracks: () => [mockTrack] }
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)

    const { localStream, getMedia, cleanup } = useMedia()
    await getMedia()
    cleanup()

    expect(mockTrack.stop).toHaveBeenCalled()
    expect(localStream.value).toBeNull()
  })

  it('toggles mute', async () => {
    const mockTrack = { enabled: true }
    const mockStream = { getTracks: () => [mockTrack], getAudioTracks: () => [mockTrack] }
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)

    const { getMedia, toggleMute, isMuted } = useMedia()
    await getMedia()

    toggleMute()
    expect(isMuted.value).toBe(true)
    expect(mockTrack.enabled).toBe(false)

    toggleMute()
    expect(isMuted.value).toBe(false)
    expect(mockTrack.enabled).toBe(true)
  })
})
