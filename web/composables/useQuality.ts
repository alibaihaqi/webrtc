import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export type QualityLevel = 'good' | 'fair' | 'poor'

export interface ConnectionQuality {
  level: QualityLevel
  bitrate: number
  packetLoss: number
  latency: number
  jitter: number
}

export function useQuality(peerConnection: RTCPeerConnection | null) {
  const quality: Ref<ConnectionQuality> = ref({
    level: 'good',
    bitrate: 0,
    packetLoss: 0,
    latency: 0,
    jitter: 0,
  })

  const isMonitoring = ref(false)
  let intervalId: NodeJS.Timeout | null = null

  async function getStats() {
    if (!peerConnection) return null

    try {
      const stats = await peerConnection.getStats()
      let totalBytesReceived = 0
      let totalPacketsLost = 0
      let totalPacketsReceived = 0
      let roundTripTime = 0
      let jitter = 0

      stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          totalBytesReceived += report.bytesReceived || 0
          totalPacketsLost += report.packetsLost || 0
          totalPacketsReceived += report.packetsReceived || 0
        }
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          roundTripTime = report.currentRoundTripTime || 0
          jitter = report.jitter || 0
        }
      })

      const packetLoss = totalPacketsReceived > 0
        ? (totalPacketsLost / (totalPacketsLost + totalPacketsReceived)) * 100
        : 0

      return {
        bitrate: totalBytesReceived * 8,
        packetLoss,
        latency: roundTripTime * 1000,
        jitter: jitter * 1000,
      }
    } catch {
      return null
    }
  }

  function calculateQualityLevel(stats: { bitrate: number; packetLoss: number; latency: number; jitter: number }): QualityLevel {
    if (stats.packetLoss < 1 && stats.latency < 100 && stats.bitrate > 500000) {
      return 'good'
    }

    if (stats.packetLoss > 5 || stats.latency > 300 || stats.bitrate < 100000) {
      return 'poor'
    }

    return 'fair'
  }

  async function updateQuality() {
    const stats = await getStats()
    if (stats) {
      quality.value = {
        level: calculateQualityLevel(stats),
        ...stats,
      }
    }
  }

  function startMonitoring(intervalMs: number = 2000) {
    if (isMonitoring.value) return

    isMonitoring.value = true
    intervalId = setInterval(updateQuality, intervalMs)
    updateQuality()
  }

  function stopMonitoring() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isMonitoring.value = false
  }

  onUnmounted(() => {
    stopMonitoring()
  })

  return { quality, isMonitoring, startMonitoring, stopMonitoring, updateQuality }
}
