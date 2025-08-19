// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false
  },

  runtimeConfig: {
    // Private keys (only available on the server-side)
    firebaseAdminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    firebaseAdminClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    firebaseAdminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    
    // Public keys (exposed to the client-side)
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
      useFirebaseEmulators: process.env.NUXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
      ,
      enableOnboardingRedirect: process.env.NUXT_PUBLIC_ENABLE_ONBOARDING_REDIRECT !== 'false'
    }
  },

  // Tailwind CSS configuration (let @nuxt/ui manage Tailwind)
  tailwindcss: {
    viewer: false,
    quiet: true
  },


  // Nitro configuration - Universal deployment (works with Vercel, Netlify, GitHub Pages)
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/landing'],
      ignore: ['/', '/auth/**', '/onboarding/**', '/meals/**', '/exercises/**'],
      failOnError: false
    },
    routeRules: {
      '/': { prerender: false, ssr: false },
      '/auth/**': { prerender: false, ssr: false },
      '/onboarding/**': { prerender: false, ssr: false },
      '/meals/**': { prerender: false, ssr: false },
      '/exercises/**': { prerender: false, ssr: false },
      '/landing': { prerender: true, ssr: true },
      '/api/**': { prerender: false, ssr: false }
    }
  },

  // App configuration
  app: {
    head: {
      title: 'BeFit - Fitness Tracking App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Track your fitness journey with BeFit - nutrition, exercise, and weight tracking made simple.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/brand/favicon.svg' },
        { rel: 'mask-icon', href: '/images/brand/favicon.svg', color: '#0584FF' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Image optimization
  image: {
    domains: ['firebasestorage.googleapis.com', 'cdn.emartmall.mn']
  },

  // Build configuration
  build: {
    transpile: ['vue-toastification']
  },
  vite: {
    server: {
      port: 3001,
      watch: {
        ignored: ['**/node_modules/**', '**/.nuxt/**']
      }
    }
  }
})
