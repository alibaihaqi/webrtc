import { inject } from '@vercel/analytics'
 
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const isAnalyticsEnabled = JSON.parse(config.public?.isProduction as string || 'false')

  if (isAnalyticsEnabled) {
    inject()
  }
})