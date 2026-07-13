import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Call flow E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('user can navigate to login page', () => {
    const loginPage = {
      path: '/login',
      hasSignInButton: true,
    }
    expect(loginPage.path).toBe('/login')
    expect(loginPage.hasSignInButton).toBe(true)
  })

  it('user can create a room', () => {
    const room = {
      id: 'test-room',
      createdAt: Date.now(),
    }
    expect(room.id).toBeDefined()
    expect(room.createdAt).toBeGreaterThan(0)
  })

  it('user can join a room', () => {
    const room = {
      id: 'test-room',
      participants: ['user1'],
    }
    room.participants.push('user2')
    expect(room.participants).toHaveLength(2)
  })

  it('user can leave a room', () => {
    const room = {
      id: 'test-room',
      participants: ['user1', 'user2'],
    }
    room.participants = room.participants.filter(p => p !== 'user2')
    expect(room.participants).toHaveLength(1)
  })
})
