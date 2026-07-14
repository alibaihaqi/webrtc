import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('elastic-apm-node', () => {
  const mockTransaction = {
    addLabels: vi.fn(),
    end: vi.fn(),
  }
  const mock = {
    start: vi.fn(),
    startTransaction: vi.fn(() => mockTransaction),
    captureError: vi.fn(),
    setCustomContext: vi.fn(),
  }
  return { default: mock }
})

import apm from 'elastic-apm-node'

describe('APM monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initAPM', () => {
    it('should not start APM when ELASTIC_APM_ENABLED is not "true"', async () => {
      delete process.env.ELASTIC_APM_ENABLED
      const { initAPM } = await import('../monitoring/apm.js')
      initAPM()
      expect(apm.start).not.toHaveBeenCalled()
    })

    it('should start APM when ELASTIC_APM_ENABLED is "true"', async () => {
      process.env.ELASTIC_APM_ENABLED = 'true'
      process.env.ELASTIC_APM_SERVICE_NAME = 'test-service'
      process.env.ELASTIC_APM_SERVER_URL = 'http://test:8200'
      process.env.NODE_ENV = 'test'
      const { initAPM } = await import('../monitoring/apm.js')
      initAPM()
      expect(apm.start).toHaveBeenCalledWith({
        serviceName: 'test-service',
        serverUrl: 'http://test:8200',
        environment: 'test',
        active: true,
        logLevel: 'info',
      })
      delete process.env.ELASTIC_APM_ENABLED
      delete process.env.ELASTIC_APM_SERVICE_NAME
      delete process.env.ELASTIC_APM_SERVER_URL
      delete process.env.NODE_ENV
    })

    it('should use defaults when env vars are not set', async () => {
      process.env.ELASTIC_APM_ENABLED = 'true'
      const { initAPM } = await import('../monitoring/apm.js')
      initAPM()
      expect(apm.start).toHaveBeenCalledWith({
        serviceName: 'webrtc-signaling',
        serverUrl: 'http://localhost:8200',
        environment: expect.any(String),
        active: true,
        logLevel: 'info',
      })
      delete process.env.ELASTIC_APM_ENABLED
    })
  })

  describe('captureMetric', () => {
    it('should create a transaction with the metric name', async () => {
      const { captureMetric } = await import('../monitoring/apm.js')
      captureMetric('test.metric', 42)
      expect(apm.startTransaction).toHaveBeenCalledWith('test.metric', 'custom')
      const transaction = (apm.startTransaction as any).mock.results[0].value
      expect(transaction.addLabels).toHaveBeenCalledWith({ value: '42' })
      expect(transaction.end).toHaveBeenCalled()
    })

    it('should include labels in the transaction', async () => {
      const { captureMetric } = await import('../monitoring/apm.js')
      captureMetric('room.joined', 1, { roomId: 'room-1' })
      expect(apm.setCustomContext).toHaveBeenCalledWith({ roomId: 'room-1' })
      expect(apm.startTransaction).toHaveBeenCalledWith('room.joined', 'custom')
      const transaction = (apm.startTransaction as any).mock.results[0].value
      expect(transaction.addLabels).toHaveBeenCalledWith({ value: '1', roomId: 'room-1' })
    })
  })

  describe('captureError', () => {
    it('should call apm.captureError with the error', async () => {
      const { captureError } = await import('../monitoring/apm.js')
      const error = new Error('test error')
      captureError(error)
      expect(apm.captureError).toHaveBeenCalledWith(error)
    })
  })
})
