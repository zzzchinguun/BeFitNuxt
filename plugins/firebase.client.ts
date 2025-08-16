import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage'
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging'

interface FirebaseServices {
  app: FirebaseApp | null
  auth: Auth | null
  db: Firestore | null
  storage: FirebaseStorage | null
  messaging: Messaging | null
}

export default defineNuxtPlugin(async (): Promise<{ provide: { firebase: FirebaseServices } }> => {
  const config = useRuntimeConfig()
  
  // Check if Firebase config is available and valid (not placeholder values)
  if (!config.public.firebaseApiKey || 
      !config.public.firebaseProjectId || 
      config.public.firebaseApiKey === 'your-firebase-api-key' ||
      config.public.firebaseProjectId === 'your-project-id' ||
      config.public.firebaseApiKey.includes('XXXXXXXXXX') ||
      config.public.firebaseApiKey.startsWith('your-')) {
    console.warn('Firebase configuration is missing or using placeholder values. Firebase features will be disabled.')
    return {
      provide: {
        firebase: {
          app: null,
          auth: null,
          db: null,
          storage: null,
          messaging: null
        }
      }
    }
  }
  
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  try {
    const app = initializeApp(firebaseConfig)
    
    const auth = getAuth(app)
    const db = getFirestore(app)
    const storage = getStorage(app)

    // Connect to emulators only when explicitly enabled
    if (import.meta.dev && config.public.useFirebaseEmulators) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099')
        connectFirestoreEmulator(db, 'localhost', 8080)
        connectStorageEmulator(storage, 'localhost', 9199)
      } catch (error) {
        // Emulators might already be connected
        console.warn('Firebase emulators connection warning:', error)
      }
    }

    // Initialize messaging if supported
    let messaging: Messaging | null = null
    if (import.meta.client && await isSupported()) {
      messaging = getMessaging(app)
    }

    return {
      provide: {
        firebase: {
          app,
          auth,
          db,
          storage,
          messaging
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return {
      provide: {
        firebase: {
          app: null,
          auth: null,
          db: null,
          storage: null,
          messaging: null
        }
      }
    }
  }
})