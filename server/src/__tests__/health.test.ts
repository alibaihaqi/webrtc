import { describe, it, expect } from 'vitest'
import http from 'http'
import { server } from '../index'

function request(path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as any
    const req = http.get(`http://127.0.0.1:${addr.port}${path}`, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve({ status: res.statusCode!, body: JSON.parse(data) }))
    })
    req.on('error', reject)
  })
}

describe('Health endpoint', () => {
  it('should return ok status', async () => {
    const { body } = await request('/health')
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeGreaterThan(0)
  })
})
