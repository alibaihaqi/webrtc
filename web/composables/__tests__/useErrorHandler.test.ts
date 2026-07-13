import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useErrorHandler } from '../useErrorHandler'

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty errors', () => {
    const { errors, lastError } = useErrorHandler()
    expect(errors.value).toHaveLength(0)
    expect(lastError.value).toBeNull()
  })

  it('handles string errors', () => {
    const { handleError, errors, lastError } = useErrorHandler()
    handleError('Test error')

    expect(errors.value).toHaveLength(1)
    expect(errors.value[0].message).toBe('Test error')
    expect(lastError.value?.message).toBe('Test error')
  })

  it('handles Error objects', () => {
    const { handleError, errors } = useErrorHandler()
    const error = new Error('Test error')
    handleError(error)

    expect(errors.value).toHaveLength(1)
    expect(errors.value[0].message).toBe('Test error')
  })

  it('clears last error', () => {
    const { handleError, clearError, lastError } = useErrorHandler()
    handleError('Test error')
    clearError()

    expect(lastError.value).toBeNull()
  })

  it('clears all errors', () => {
    const { handleError, clearAllErrors, errors } = useErrorHandler()
    handleError('Error 1')
    handleError('Error 2')
    clearAllErrors()

    expect(errors.value).toHaveLength(0)
  })

  it('keeps only last 10 errors', () => {
    const { handleError, errors } = useErrorHandler()
    for (let i = 0; i < 15; i++) {
      handleError(`Error ${i}`)
    }

    expect(errors.value).toHaveLength(10)
    expect(errors.value[0].message).toBe('Error 5')
  })
})
