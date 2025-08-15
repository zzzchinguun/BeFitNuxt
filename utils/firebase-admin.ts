import { cert, initializeApp, getApps, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | null = null

export function getFirebaseAdmin() {
  if (adminApp) {
    return adminApp
  }

  const config = useRuntimeConfig()
  
  if (!config.firebaseAdminProjectId || !config.firebaseAdminClientEmail || !config.firebaseAdminPrivateKey) {
    throw new Error('Firebase Admin credentials not configured')
  }

  const privateKey = config.firebaseAdminPrivateKey.replace(/\\n/g, '\n')

  const apps = getApps()
  if (apps.length > 0) {
    adminApp = apps[0]
  } else {
    adminApp = initializeApp({
      credential: cert({
        projectId: config.firebaseAdminProjectId,
        clientEmail: config.firebaseAdminClientEmail,
        privateKey
      }),
      projectId: config.firebaseAdminProjectId
    })
  }

  return adminApp
}

export function getFirebaseAdminDb() {
  const app = getFirebaseAdmin()
  return getFirestore(app)
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdmin()
  return getAuth(app)
}