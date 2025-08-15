import { defineStore } from 'pinia'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const { auth, db } = useFirebase()
  
  // State
  const user = ref<User | null>(null)
  const firebaseUser = ref<FirebaseUser | null>(null)
  const loading = ref(!auth) // If no auth (static generation), set as not loading
  const isAuthenticated = computed(() => !!user.value)

  // Actions
  async function login(email: string, password: string) {
    if (!auth) return { success: false, error: 'Firebase not initialized' }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await loadUserProfile(userCredential.user.uid)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  async function register(email: string, password: string, displayName?: string) {
    if (!auth || !db) return { success: false, error: 'Firebase not initialized' }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }

      // Create user profile in Firestore
      const newUser: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: displayName || '',
        role: 'user',
        language: 'en',
        units: {
          weight: 'kg',
          height: 'cm'
        },
        macroGoals: {
          kcal: 2000,
          protein: 100,
          carbs: 250,
          fat: 67
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser)
      user.value = newUser

      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      user.value = null
      firebaseUser.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { success: false, error: error.message }
    }
  }

  async function loadUserProfile(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        user.value = { ...userDoc.data(), uid } as User
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  async function updateUserProfile(updates: Partial<User>) {
    if (!user.value) return

    try {
      const userRef = doc(db, 'users', user.value.uid)
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(userRef, updateData)
      user.value = { ...user.value, ...updates }
      
      return { success: true }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  async function refreshCustomClaims() {
    if (firebaseUser.value) {
      await firebaseUser.value.getIdToken(true)
      const tokenResult = await firebaseUser.value.getIdTokenResult()
      
      if (user.value && tokenResult.claims.admin !== undefined) {
        user.value.role = tokenResult.claims.admin ? 'admin' : 'user'
      }
    }
  }

  // Initialize auth state listener
  function initializeAuth() {
    if (!auth) {
      loading.value = false
      return Promise.resolve()
    }
    
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
        loading.value = true
        firebaseUser.value = firebaseUserData
        
        if (firebaseUserData) {
          await loadUserProfile(firebaseUserData.uid)
          await refreshCustomClaims()
        } else {
          user.value = null
        }
        
        loading.value = false
        resolve()
      })

      // Return unsubscribe function for cleanup
      return unsubscribe
    })
  }

  return {
    // State
    user: readonly(user),
    firebaseUser: readonly(firebaseUser),
    loading: readonly(loading),
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    refreshCustomClaims,
    initializeAuth
  }
})