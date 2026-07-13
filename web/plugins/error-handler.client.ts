export default defineNuxtPlugin((nuxtApp) => {
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason)
  })

  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    console.error('Vue error:', err, info)
  }
})
