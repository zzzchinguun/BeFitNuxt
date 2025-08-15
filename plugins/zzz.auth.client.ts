export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  // Ensure Firebase plugin ran and provided $firebase before init
  await authStore.initializeAuth()
})


