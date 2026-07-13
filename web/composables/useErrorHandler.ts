import { ref } from 'vue'
import type { Ref } from 'vue'

export interface AppError {
  message: string
  code?: string
  timestamp: number
}

export function useErrorHandler() {
  const errors: Ref<AppError[]> = ref([])
  const lastError: Ref<AppError | null> = ref(null)

  function handleError(error: Error | string, code?: string) {
    const appError: AppError = {
      message: typeof error === 'string' ? error : error.message,
      code,
      timestamp: Date.now(),
    }

    errors.value.push(appError)
    lastError.value = appError

    if (errors.value.length > 10) {
      errors.value.shift()
    }

    console.error('App error:', appError)
  }

  function clearError() {
    lastError.value = null
  }

  function clearAllErrors() {
    errors.value = []
    lastError.value = null
  }

  return {
    errors,
    lastError,
    handleError,
    clearError,
    clearAllErrors,
  }
}
