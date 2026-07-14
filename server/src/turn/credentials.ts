import { createHmac, timingSafeEqual } from 'crypto'

export interface TurnCredentials {
  username: string
  credential: string
  ttl: number
}

export function generateTurnCredentials(
  secretKey: string,
  username: string = 'user',
  ttl: number = 86400
): TurnCredentials {
  const timestamp = Math.floor(Date.now() / 1000) + ttl
  const fullUsername = `${timestamp}:${username}`
  const hmac = createHmac('sha1', secretKey)
  hmac.update(fullUsername)
  const credential = hmac.digest('base64')

  return {
    username: fullUsername,
    credential,
    ttl,
  }
}

export function validateTurnCredential(username: string, credential: string, secretKey: string): boolean {
  const parts = username.split(':')
  if (parts.length < 2) return false

  const timestamp = parseInt(parts[0], 10)
  if (isNaN(timestamp) || timestamp < Date.now() / 1000) return false

  const hmac = createHmac('sha1', secretKey)
  hmac.update(username)
  const expectedCredential = hmac.digest('base64')

  if (credential.length !== expectedCredential.length) return false

  return timingSafeEqual(Buffer.from(credential), Buffer.from(expectedCredential))
}

export function getTurnConfig(): { urls: string[] } {
  const coturnHost = process.env.COTURN_HOST || 'localhost'
  const coturnPort = process.env.COTURN_PORT || '3478'

  return {
    urls: [
      `turn:${coturnHost}:${coturnPort}`,
      `turn:${coturnHost}:${coturnPort}?transport=tcp`,
    ],
  }
}
