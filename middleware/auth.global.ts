export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during static generation or when Firebase is not configured
  if (process.server && (!process.env.NUXT_PUBLIC_FIREBASE_API_KEY || process.prerender)) {
    return
  }
  
  const authStore = useAuthStore()
  
  // Pages that don't require authentication
  const publicPages = ['/auth/login', '/auth/register', '/auth/forgot-password', '/landing']
  // Auth pages that authenticated users should be redirected away from
  const authPages = ['/auth/login', '/auth/register', '/auth/forgot-password']
  
  // Wait for auth to initialize
  if (authStore.loading) {
    return
  }
  
  // If user is not authenticated
  if (!authStore.isAuthenticated) {
    // Redirect root to landing
    if (to.path === '/') {
      return navigateTo('/landing')
    }
    // Allow access to public pages, redirect others to login
    if (!publicPages.includes(to.path)) {
      return navigateTo('/auth/login')
    }
  }
  
  // If user is authenticated and trying to access auth pages or landing, redirect to dashboard
  if (authStore.isAuthenticated) {
    if (authPages.includes(to.path) || to.path === '/landing') {
      return navigateTo('/')
    }
  }
})