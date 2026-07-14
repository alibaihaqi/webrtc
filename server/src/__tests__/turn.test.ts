import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { generateTurnCredentials, validateTurnCredential, getTurnConfig } from '../turn/credentials.js'

describe('TURN credentials', () => {
  const SECRET_KEY = 'test-secret-key'

  it('generates valid HMAC credentials', () => {
    const credentials = generateTurnCredentials(SECRET_KEY)
    expect(credentials.username).toBeDefined()
    expect(credentials.credential).toBeDefined()
    expect(typeof credentials.username).toBe('string')
    expect(typeof credentials.credential).toBe('string')
    expect(credentials.ttl).toBe(86400)
  })

  it('includes timestamp and username in the username field', () => {
    const credentials = generateTurnCredentials(SECRET_KEY, 'alice')
    const parts = credentials.username.split(':')
    expect(parts.length).toBe(2)
    expect(parts[1]).toBe('alice')
    expect(Number(parts[0])).toBeGreaterThan(0)
  })

  it('uses default username when not provided', () => {
    const credentials = generateTurnCredentials(SECRET_KEY)
    expect(credentials.username).toMatch(/^\d+:user$/)
  })

  it('validates correct credential', () => {
    const credentials = generateTurnCredentials(SECRET_KEY)
    const valid = validateTurnCredential(credentials.username, credentials.credential, SECRET_KEY)
    expect(valid).toBe(true)
  })

  it('rejects invalid credential', () => {
    const valid = validateTurnCredential('12345:user', 'wrong-credential', SECRET_KEY)
    expect(valid).toBe(false)
  })

  it('rejects expired credential', () => {
    const credentials = generateTurnCredentials(SECRET_KEY, 'user', -1)
    const valid = validateTurnCredential(credentials.username, credentials.credential, SECRET_KEY)
    expect(valid).toBe(false)
  })

  it('respects custom ttl', () => {
    const credentials = generateTurnCredentials(SECRET_KEY, 'user', 3600)
    expect(credentials.ttl).toBe(3600)
    const parts = credentials.username.split(':')
    const expiresAt = Number(parts[0])
    const now = Math.floor(Date.now() / 1000)
    expect(expiresAt).toBeGreaterThan(now)
    expect(expiresAt).toBeLessThanOrEqual(now + 3600 + 1)
  })
})

describe('getTurnConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns default localhost config', () => {
    delete process.env.COTURN_HOST
    delete process.env.COTURN_PORT
    const config = getTurnConfig()
    expect(config.urls).toEqual([
      'turn:localhost:3478',
      'turn:localhost:3478?transport=tcp',
    ])
  })

  it('uses COTURN_HOST and COTURN_PORT from env', () => {
    process.env.COTURN_HOST = 'coturn.example.com'
    process.env.COTURN_PORT = '5349'
    const config = getTurnConfig()
    expect(config.urls).toEqual([
      'turn:coturn.example.com:5349',
      'turn:coturn.example.com:5349?transport=tcp',
    ])
  })
})
