export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated and has admin role
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access forbidden: Admin role required'
    })
  }
})