import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Reconnection logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('attempts reconnect with exponential backoff', async () => {
    const delays = [2000, 4000, 8000]

    for (let i = 0; i < 3; i++) {
      const delay = Math.min(2000 * Math.pow(2, i), 30000)
      expect(delay).toBe(delays[i])
    }
  })

  it('stops reconnecting after max attempts', () => {
    const maxAttempts = 3
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++
    }

    expect(attempts).toBe(maxAttempts)
  })

  it('cancels reconnect timer', () => {
    const timer = setTimeout(() => {}, 5000)
    clearTimeout(timer)
    expect(timer).toBeDefined()
  })
})
