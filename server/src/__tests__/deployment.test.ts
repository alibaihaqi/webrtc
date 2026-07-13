import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Deployment configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has valid Dockerfile', () => {
    const dockerfilePath = join(process.cwd(), 'Dockerfile')
    const dockerfile = readFileSync(dockerfilePath, 'utf-8')

    expect(dockerfile).toContain('FROM node:20-alpine')
    expect(dockerfile).toContain('WORKDIR /app')
    expect(dockerfile).toContain('EXPOSE 3001')
    expect(dockerfile).toContain('CMD')
  })

  it('has valid railway.json', () => {
    const railwayPath = join(process.cwd(), '..', 'railway.json')
    const railway = readFileSync(railwayPath, 'utf-8')
    const config = JSON.parse(railway)

    expect(config.build).toBeDefined()
    expect(config.deploy).toBeDefined()
    expect(config.deploy.healthcheckPath).toBe('/health')
  })

  it('has valid vercel.json', () => {
    const vercelPath = join(process.cwd(), '..', 'web', 'vercel.json')
    const vercel = readFileSync(vercelPath, 'utf-8')
    const config = JSON.parse(vercel)

    expect(config.buildCommand).toBe('nuxt build')
    expect(config.outputDirectory).toBe('.output/public')
  })
})
