export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during static generation or when Firebase is not configured
  if (process.server && (!process.env.NUXT_PUBLIC_FIREBASE_API_KEY || process.prerender)) {
    return
  }
  
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  
  // Skip if still loading or not authenticated
  if (authStore.loading || !authStore.isAuthenticated) {
    return
  }
  
  // Enhanced onboarding pages list for 8-step flow
  const onboardingPages = [
    '/onboarding/step-1-welcome',
    '/onboarding/step-2-age-height-weight',
    '/onboarding/step-3-gender-activity',
    '/onboarding/step-4-body-fat',
    '/onboarding/step-5-goal',
    '/onboarding/step-6-goal-weight-and-pace',
    '/onboarding/step-7-timeline-preview',
    '/onboarding/step-8-macros',
    '/onboarding/summary',
    '/onboarding/simplified',
    // Legacy support
    '/onboarding/step-1',
    '/onboarding/step-2',
    '/onboarding/step-3',
    '/onboarding/step-4',
    '/onboarding/step-5'
  ]
  
  // Pages that don't require onboarding completion
  const exemptPages = [
    '/auth/login', 
    '/auth/register', 
    '/auth/forgot-password',
    ...onboardingPages
  ]
  
  // Meal generation pages that don't need meal plan completion
  const mealGenerationPages = [
    '/meal-generation',
    '/meal-generation/preview',
    '/meal-generation/shopping-list'
  ]
  
  const user = authStore.user
  
  // Enhanced onboarding completion check
  const hasCompletedOnboarding = 
    user?.onboarding?.completed === true ||
    (!!user?.macroGoals && (user.macroGoals.kcal > 0 && user.macroGoals.proteinG > 0))
  
  // Check if user has generated their first meal plan
  const hasMealPlan = user?.mealPlanGenerated === true
  
  // If redirects are disabled via config, skip
  if (config.public.enableOnboardingRedirect === false) {
    return
  }

  // If user hasn't completed onboarding and trying to access a protected page
  if (!hasCompletedOnboarding && !exemptPages.some(page => to.path.startsWith(page))) {
    // Redirect to simplified onboarding instead of step-by-step
    return navigateTo('/onboarding/simplified')
  }
  
  // If user has completed onboarding but hasn't generated a meal plan
  if (hasCompletedOnboarding && !hasMealPlan && !mealGenerationPages.some(page => to.path.startsWith(page)) && !exemptPages.some(page => to.path.startsWith(page))) {
    return navigateTo('/meal-generation')
  }
  
  // If user has completed onboarding and trying to access onboarding pages
  if (hasCompletedOnboarding && to.path.startsWith('/onboarding')) {
    // If they have a meal plan, go to dashboard, otherwise meal generation
    return navigateTo(hasMealPlan ? '/' : '/meal-generation')
  }
  
  // Handle legacy onboarding routes - redirect to simplified onboarding
  const legacyRoutes = [
    '/onboarding/step-1',
    '/onboarding/step-2', 
    '/onboarding/step-3',
    '/onboarding/step-4',
    '/onboarding/step-5',
    '/onboarding/step-1-welcome',
    '/onboarding/step-2-age-height-weight',
    '/onboarding/step-3-gender-activity',
    '/onboarding/step-4-body-fat',
    '/onboarding/step-5-goal',
    '/onboarding/step-6-goal-weight-and-pace',
    '/onboarding/step-7-timeline-preview',
    '/onboarding/step-8-macros',
    '/onboarding/summary'
  ]
  
  if (legacyRoutes.includes(to.path)) {
    return navigateTo('/onboarding/simplified')
  }
})