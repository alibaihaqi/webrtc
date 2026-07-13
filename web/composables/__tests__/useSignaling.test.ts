import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSignaling } from '../useSignaling'

describe('useSignaling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with disconnected state', () => {
    const { isConnected, error } = useSignaling()
    expect(isConnected.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('provides connect function', () => {
    const { connect } = useSignaling()
    expect(typeof connect).toBe('function')
  })

  it('provides send function', () => {
    const { send } = useSignaling()
    expect(typeof send).toBe('function')
  })

  it('provides disconnect function', () => {
    const { disconnect } = useSignaling()
    expect(typeof disconnect).toBe('function')
  })
})
