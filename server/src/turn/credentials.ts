import { createHmac, timingSafeEqual } from 'crypto'

export interface TurnCredentials {
  username: string
  credential: string
}

export function generateTurnCredentials(secretKey: string, expiresInSeconds: number = 86400): TurnCredentials {
  const timestamp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const username = `${timestamp}:${crypto.randomUUID()}`
  const hmac = createHmac('sha256', secretKey)
  hmac.update(username)
  const credential = hmac.digest('base64')

  return { username, credential }
}

export function validateTurnCredential(username: string, credential: string, secretKey: string): boolean {
  const parts = username.split(':')
  if (parts.length < 2) return false

  const timestamp = parseInt(parts[0], 10)
  if (isNaN(timestamp) || timestamp < Date.now() / 1000) return false

  const hmac = createHmac('sha256', secretKey)
  hmac.update(username)
  const expectedCredential = hmac.digest('base64')

  if (credential.length !== expectedCredential.length) return false

  return timingSafeEqual(Buffer.from(credential), Buffer.from(expectedCredential))
}
