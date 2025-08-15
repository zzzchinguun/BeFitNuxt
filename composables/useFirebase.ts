import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import type { Messaging } from 'firebase/messaging'

export const useFirebase = () => {
  const { $firebase } = useNuxtApp()

  // When running on server or before client plugin is ready, $firebase can be undefined.
  if (!$firebase) {
    return {
      app: null,
      auth: null as unknown as Auth,
      db: null as unknown as Firestore,
      storage: null as unknown as FirebaseStorage,
      messaging: null as unknown as Messaging | null
    }
  }

  return {
    app: $firebase.app,
    auth: $firebase.auth as Auth,
    db: $firebase.db as Firestore,
    storage: $firebase.storage as FirebaseStorage,
    messaging: $firebase.messaging as Messaging | null
  }
}