export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during static generation
  if (process.server && !process.env.NUXT_PUBLIC_FIREBASE_API_KEY) {
    return
  }
  
  const authStore = useAuthStore()
  
  // Pages that don't require authentication
  const publicPages = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/landing']
  
  // Wait for auth to initialize
  if (authStore.loading) {
    return
  }
  
  // If user is not authenticated
  if (!authStore.isAuthenticated) {
    // Open landing on root
    if (to.path === '/') {
      return navigateTo('/landing')
    }
    if (!publicPages.includes(to.path)) {
      return navigateTo('/auth/login')
    }
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (authStore.isAuthenticated && publicPages.includes(to.path)) {
    return navigateTo('/')
  }
})