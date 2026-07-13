import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../useAuth'

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn((auth: unknown, callback: (user: null) => void) => {
    callback(null)
    return vi.fn()
  }),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { loading } = useAuth()
    expect(loading.value).toBe(true)
  })

  it('should provide signInWithGoogle function', () => {
    const { signInWithGoogle } = useAuth()
    expect(typeof signInWithGoogle).toBe('function')
  })

  it('should provide signOut function', () => {
    const { signOut } = useAuth()
    expect(typeof signOut).toBe('function')
  })
})
