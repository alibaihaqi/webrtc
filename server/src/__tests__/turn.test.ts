import { describe, it, expect } from 'vitest'
import { generateTurnCredentials, validateTurnCredential } from '../turn/credentials.js'

describe('TURN credentials', () => {
  const SECRET_KEY = 'test-secret-key'

  it('generates valid HMAC credentials', () => {
    const credentials = generateTurnCredentials(SECRET_KEY)
    expect(credentials.username).toBeDefined()
    expect(credentials.credential).toBeDefined()
    expect(typeof credentials.username).toBe('string')
    expect(typeof credentials.credential).toBe('string')
  })

  it('validates correct credential', () => {
    const credentials = generateTurnCredentials(SECRET_KEY)
    const valid = validateTurnCredential(credentials.username, credentials.credential, SECRET_KEY)
    expect(valid).toBe(true)
  })

  it('rejects invalid credential', () => {
    const valid = validateTurnCredential('user', 'wrong-credential', SECRET_KEY)
    expect(valid).toBe(false)
  })

  it('rejects expired credential', () => {
    const credentials = generateTurnCredentials(SECRET_KEY, -1) // Already expired
    const valid = validateTurnCredential(credentials.username, credentials.credential, SECRET_KEY)
    expect(valid).toBe(false)
  })

  it('generates unique credentials', () => {
    const cred1 = generateTurnCredentials(SECRET_KEY)
    const cred2 = generateTurnCredentials(SECRET_KEY)
    expect(cred1.username).not.toBe(cred2.username)
  })
})
