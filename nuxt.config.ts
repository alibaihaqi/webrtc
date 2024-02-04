// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'WebRTC Alibaihaqi',
    },
  },

  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/web-vitals',
    '@pinia/nuxt',
    'nuxt-vuefire',
  ],

  runtimeConfig: {
    public: {
      apiDomain: '',
      isMuteVideo: '',
      wsDomain: '',
    },
  },

  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true,
    },

    config: {
      apiKey: process.env.NUXT_FIREBASE_API_KEY,
      appId: process.env.NUXT_FIREBASE_APP_ID,
      authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
      measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID,
      messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
      projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
    },
  },
})