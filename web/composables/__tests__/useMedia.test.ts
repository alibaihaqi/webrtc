import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMedia } from '../useMedia'

describe('useMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
        enumerateDevices: vi.fn().mockResolvedValue([]),
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
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
      getVideoTracks: () => [{ getSettings: () => ({}) }],
      getAudioTracks: () => [],
    }

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

  describe('device switching', () => {
    it('should return empty devices list initially', () => {
      const { devices } = useMedia()
      expect(devices.value).toEqual([])
    })

    it('should track active device IDs after getMedia', async () => {
      const mockVideoTrack = { kind: 'video', getSettings: () => ({ deviceId: 'cam-1' }) }
      const mockAudioTrack = { kind: 'audio', getSettings: () => ({ deviceId: 'mic-1' }) }
      const mockStream = {
        getTracks: () => [mockVideoTrack, mockAudioTrack],
        getVideoTracks: () => [mockVideoTrack],
        getAudioTracks: () => [mockAudioTrack],
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([
        { kind: 'videoinput', deviceId: 'cam-1', label: 'Camera 1', groupId: 'g1', toJSON: () => ({}) },
        { kind: 'audioinput', deviceId: 'mic-1', label: 'Mic 1', groupId: 'g2', toJSON: () => ({}) },
      ] as MediaDeviceInfo[])

      const { getMedia, activeCameraId, activeMicrophoneId } = useMedia()
      await getMedia()

      expect(activeCameraId.value).toBe('cam-1')
      expect(activeMicrophoneId.value).toBe('mic-1')
    })

    it('should enumerate available input devices after getMedia', async () => {
      const mockVideoTrack = { kind: 'video', getSettings: () => ({ deviceId: 'cam-1' }) }
      const mockAudioTrack = { kind: 'audio', getSettings: () => ({ deviceId: 'mic-1' }) }
      const mockStream = {
        getTracks: () => [mockVideoTrack, mockAudioTrack],
        getVideoTracks: () => [mockVideoTrack],
        getAudioTracks: () => [mockAudioTrack],
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([
        { kind: 'videoinput', deviceId: 'cam-1', label: 'Camera 1', groupId: 'g1', toJSON: () => ({}) },
        { kind: 'videoinput', deviceId: 'cam-2', label: 'Camera 2', groupId: 'g2', toJSON: () => ({}) },
        { kind: 'audioinput', deviceId: 'mic-1', label: 'Mic 1', groupId: 'g3', toJSON: () => ({}) },
        { kind: 'audiooutput', deviceId: 'spk-1', label: 'Speaker 1', groupId: 'g4', toJSON: () => ({}) },
      ] as MediaDeviceInfo[])

      const { getMedia, devices } = useMedia()
      await getMedia()

      expect(devices.value).toHaveLength(3)
      expect(devices.value.every(d => d.kind === 'videoinput' || d.kind === 'audioinput')).toBe(true)
    })

    it('should switch camera by device ID', async () => {
      const mockOldVideoTrack = { kind: 'video', stop: vi.fn(), getSettings: () => ({ deviceId: 'cam-1' }) }
      const mockAudioTrack = { kind: 'audio', getSettings: () => ({ deviceId: 'mic-1' }) }
      const mockStream = {
        getTracks: () => [mockOldVideoTrack, mockAudioTrack],
        getVideoTracks: () => [mockOldVideoTrack],
        getAudioTracks: () => [mockAudioTrack],
        removeTrack: vi.fn(),
        addTrack: vi.fn(),
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([] as MediaDeviceInfo[])

      const { getMedia, switchCamera, activeCameraId } = useMedia()
      await getMedia()

      const mockNewVideoTrack = { kind: 'video', getSettings: () => ({ deviceId: 'cam-2' }) }
      const mockNewStream = {
        getVideoTracks: () => [mockNewVideoTrack],
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValueOnce(mockNewStream as any)

      const dispatchedEvents: CustomEvent[] = []
      window.addEventListener('track-replaced', (e) => dispatchedEvents.push(e as CustomEvent))

      const result = await switchCamera('cam-2')

      expect(result).toBe(true)
      expect(activeCameraId.value).toBe('cam-2')
      expect(mockOldVideoTrack.stop).toHaveBeenCalled()
      expect(mockStream.removeTrack).toHaveBeenCalledWith(mockOldVideoTrack)
      expect(mockStream.addTrack).toHaveBeenCalledWith(mockNewVideoTrack)
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { deviceId: { exact: 'cam-2' } },
        audio: false,
      })
      expect(dispatchedEvents).toHaveLength(1)
      expect(dispatchedEvents[0].detail).toEqual({ kind: 'video', track: mockNewVideoTrack })
    })

    it('should switch microphone by device ID', async () => {
      const mockVideoTrack = { kind: 'video', getSettings: () => ({ deviceId: 'cam-1' }) }
      const mockOldAudioTrack = { kind: 'audio', stop: vi.fn(), getSettings: () => ({ deviceId: 'mic-1' }) }
      const mockStream = {
        getTracks: () => [mockVideoTrack, mockOldAudioTrack],
        getVideoTracks: () => [mockVideoTrack],
        getAudioTracks: () => [mockOldAudioTrack],
        removeTrack: vi.fn(),
        addTrack: vi.fn(),
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([] as MediaDeviceInfo[])

      const { getMedia, switchMicrophone, activeMicrophoneId } = useMedia()
      await getMedia()

      const mockNewAudioTrack = { kind: 'audio', getSettings: () => ({ deviceId: 'mic-2' }) }
      const mockNewStream = {
        getAudioTracks: () => [mockNewAudioTrack],
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValueOnce(mockNewStream as any)

      const dispatchedEvents: CustomEvent[] = []
      window.addEventListener('track-replaced', (e) => dispatchedEvents.push(e as CustomEvent))

      const result = await switchMicrophone('mic-2')

      expect(result).toBe(true)
      expect(activeMicrophoneId.value).toBe('mic-2')
      expect(mockOldAudioTrack.stop).toHaveBeenCalled()
      expect(mockStream.removeTrack).toHaveBeenCalledWith(mockOldAudioTrack)
      expect(mockStream.addTrack).toHaveBeenCalledWith(mockNewAudioTrack)
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: false,
        audio: { deviceId: { exact: 'mic-2' } },
      })
      expect(dispatchedEvents).toHaveLength(1)
      expect(dispatchedEvents[0].detail).toEqual({ kind: 'audio', track: mockNewAudioTrack })
    })

    it('should return false when switching camera without a stream', async () => {
      const { switchCamera } = useMedia()
      const result = await switchCamera('cam-2')
      expect(result).toBe(false)
    })

    it('should return false when switching microphone without a stream', async () => {
      const { switchMicrophone } = useMedia()
      const result = await switchMicrophone('mic-2')
      expect(result).toBe(false)
    })

    it('should return false and log error on switch camera failure', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
        removeTrack: vi.fn(),
        addTrack: vi.fn(),
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([] as MediaDeviceInfo[])

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { getMedia, switchCamera } = useMedia()
      await getMedia()

      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(new Error('Device not found'))

      const result = await switchCamera('cam-not-found')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to switch camera:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should return false and log error on switch microphone failure', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
        removeTrack: vi.fn(),
        addTrack: vi.fn(),
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([] as MediaDeviceInfo[])

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { getMedia, switchMicrophone } = useMedia()
      await getMedia()

      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(new Error('Device not found'))

      const result = await switchMicrophone('mic-not-found')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to switch microphone:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should handle enumerateDevices failure gracefully', async () => {
      const mockStream = {
        getTracks: () => [],
        getVideoTracks: () => [],
        getAudioTracks: () => [],
      }
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream as any)
      vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockRejectedValue(new Error('Permission denied'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { getMedia, devices } = useMedia()
      await getMedia()

      expect(devices.value).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to enumerate devices:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})
