import { describe, it, expect } from 'vitest'
import { server } from '../index'

describe('Health endpoint', () => {
  it('should return ok status', async () => {
    const res = await fetch('http://localhost:3001/health')
    const data = await res.json()
    expect(data.status).toBe('ok')
  })
})
