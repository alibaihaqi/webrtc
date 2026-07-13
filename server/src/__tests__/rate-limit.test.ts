import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit, cleanupRateLimit } from '../middleware/rate-limit'

describe('Rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests within limit', () => {
    const result = rateLimit('rl-allows', 5, 60000)
    expect(result).toBe(true)
  })

  it('blocks requests over limit', () => {
    for (let i = 0; i < 5; i++) {
      rateLimit('rl-blocks', 5, 60000)
    }
    const result = rateLimit('rl-blocks', 5, 60000)
    expect(result).toBe(false)
  })

  it('resets after window expires', () => {
    const key = 'rl-reset'
    rateLimit(key, 2, 1000)
    rateLimit(key, 2, 1000)

    vi.advanceTimersByTime(1500)

    const result = rateLimit(key, 2, 1000)
    expect(result).toBe(true)
  })
})
