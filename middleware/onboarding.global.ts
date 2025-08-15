export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware during static generation
  if (process.server && !process.env.NUXT_PUBLIC_FIREBASE_API_KEY) {
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
    '/profile',
    ...onboardingPages
  ]
  
  const user = authStore.user
  
  // Enhanced onboarding completion check
  const hasCompletedOnboarding = 
    user?.onboarding?.completed === true ||
    (!!user?.macroGoals && (user.macroGoals.kcal > 0))
  
  // If redirects are disabled via config, skip
  if (config.public.enableOnboardingRedirect === false) {
    return
  }

  // If user hasn't completed onboarding and trying to access a protected page
  if (!hasCompletedOnboarding && !exemptPages.some(page => to.path.startsWith(page))) {
    // Determine where to redirect based on current progress
    const onboardingStore = useOnboardingStore()
    onboardingStore.loadExistingOnboarding()
    
    const currentStep = onboardingStore.currentStep
    let redirectPath = '/onboarding/step-1-welcome'
    
    // Map current step to new route structure
    switch (currentStep) {
      case 1:
        redirectPath = '/onboarding/step-1-welcome'
        break
      case 2:
        redirectPath = '/onboarding/step-2-age-height-weight'
        break
      case 3:
        redirectPath = '/onboarding/step-3-gender-activity'
        break
      case 4:
        redirectPath = '/onboarding/step-4-body-fat'
        break
      case 5:
        redirectPath = '/onboarding/step-5-goal'
        break
      case 6:
        redirectPath = '/onboarding/step-6-goal-weight-and-pace'
        break
      case 7:
        redirectPath = '/onboarding/step-7-timeline-preview'
        break
      case 8:
        redirectPath = '/onboarding/step-8-macros'
        break
      case 9:
        redirectPath = '/onboarding/summary'
        break
      default:
        redirectPath = '/onboarding/step-1-welcome'
    }
    
    return navigateTo(redirectPath)
  }
  
  // If user has completed onboarding and trying to access onboarding pages
  if (hasCompletedOnboarding && to.path.startsWith('/onboarding')) {
    return navigateTo('/')
  }
  
  // Handle legacy onboarding routes - redirect to new structure
  const legacyRouteMap: Record<string, string> = {
    '/onboarding/step-1': '/onboarding/step-1-welcome',
    '/onboarding/step-2': '/onboarding/step-2-age-height-weight',
    '/onboarding/step-3': '/onboarding/step-3-gender-activity',
    '/onboarding/step-4': '/onboarding/step-4-body-fat',
    '/onboarding/step-5': '/onboarding/step-5-goal'
  }
  
  if (legacyRouteMap[to.path]) {
    return navigateTo(legacyRouteMap[to.path])
  }
})