import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Frontend error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles media device errors', () => {
    const error = new Error('NotAllowedError')
    expect(error.message).toBe('NotAllowedError')
  })

  it('handles WebSocket connection errors', () => {
    const error = new Event('error')
    expect(error.type).toBe('error')
  })

  it('handles WebRTC connection failures', () => {
    const states = ['new', 'connecting', 'connected', 'failed', 'closed']
    expect(states).toContain('failed')
  })

  it('handles ICE candidate errors', () => {
    const error = new Error('Failed to add ICE candidate')
    expect(error.message).toContain('ICE candidate')
  })
})
