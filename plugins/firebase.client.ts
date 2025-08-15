import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  const app = initializeApp(firebaseConfig)
  
  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)

  // Connect to emulators only when explicitly enabled
  if (process.dev && config.public.useFirebaseEmulators) {
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
  let messaging = null
  if (process.client && await isSupported()) {
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
})