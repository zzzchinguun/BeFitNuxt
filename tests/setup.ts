import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock Nuxt composables
config.global.mocks = {
  $t: (key: string) => key,
  $toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => [])
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  connectAuthEmulator: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn()
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  connectStorageEmulator: vi.fn()
}))

// Mock Nuxt runtime
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    firebaseApiKey: 'test',
    firebaseAuthDomain: 'test',
    firebaseProjectId: 'test',
    firebaseStorageBucket: 'test',
    firebaseMessagingSenderId: 'test',
    firebaseAppId: 'test',
    appVersion: '1.0.0'
  }
}))

global.useNuxtApp = vi.fn(() => ({
  $toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}))

global.navigateTo = vi.fn()
global.useRoute = vi.fn(() => ({ path: '/' }))
global.useRouter = vi.fn(() => ({ push: vi.fn() }))