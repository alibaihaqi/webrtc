import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useQuality } from '../useQuality'

describe('useQuality', () => {
  let mockPeerConnection: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockPeerConnection = {
      getStats: vi.fn().mockResolvedValue({
        forEach: (callback: Function) => {
          callback({
            type: 'inbound-rtp',
            kind: 'video',
            bytesReceived: 1000000,
            packetsLost: 10,
            packetsReceived: 1000,
          })
          callback({
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.05,
            jitter: 0.001,
          })
        },
      }),
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default quality', () => {
    const { quality } = useQuality(mockPeerConnection)
    expect(quality.value.level).toBe('good')
    expect(quality.value.bitrate).toBe(0)
    expect(quality.value.packetLoss).toBe(0)
  })

  it('updates quality stats', async () => {
    const { quality, updateQuality } = useQuality(mockPeerConnection)
    await updateQuality()

    expect(quality.value.bitrate).toBeGreaterThan(0)
    expect(quality.value.packetLoss).toBeGreaterThanOrEqual(0)
    expect(quality.value.latency).toBeGreaterThan(0)
  })

  it('calculates good quality level', async () => {
    const { quality, updateQuality } = useQuality(mockPeerConnection)
    await updateQuality()

    expect(quality.value.level).toBe('good')
  })

  it('calculates poor quality level', async () => {
    mockPeerConnection.getStats.mockResolvedValue({
      forEach: (callback: Function) => {
        callback({
          type: 'inbound-rtp',
          kind: 'video',
          bytesReceived: 10000,
          packetsLost: 100,
          packetsReceived: 200,
        })
        callback({
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.5,
          jitter: 0.01,
        })
      },
    })

    const { quality, updateQuality } = useQuality(mockPeerConnection)
    await updateQuality()

    expect(quality.value.level).toBe('poor')
  })

  it('starts and stops monitoring', () => {
    const { isMonitoring, startMonitoring, stopMonitoring } = useQuality(mockPeerConnection)

    expect(isMonitoring.value).toBe(false)

    startMonitoring()
    expect(isMonitoring.value).toBe(true)

    stopMonitoring()
    expect(isMonitoring.value).toBe(false)
  })
})
