export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  typescript: { strict: true },

  nitro: {
    preset: 'vercel',
  },

  runtimeConfig: {
    public: {
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      firebaseApiKey: process.env.NUXT_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_FIREBASE_APP_ID || '',
    },
  },
})
