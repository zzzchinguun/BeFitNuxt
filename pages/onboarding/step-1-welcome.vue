<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="1" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <!-- Welcome content -->
      <div class="text-center space-y-6">
        <div class="space-y-4">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Welcome to BeFit
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Let's create your personalized fitness plan
          </p>
        </div>
        
        <!-- Welcome illustration -->
        <div class="py-8">
          <div class="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-heart" class="w-16 h-16 text-white" />
          </div>
        </div>
        
        <!-- Features overview -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-calculator" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
              Smart Calculations
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Calculate your BMR, TDEE, and optimal macro distribution
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-target" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
              Goal Setting
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Set realistic targets based on your lifestyle and preferences
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-chart-bar-square" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
              Progress Tracking
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Monitor your progress with detailed analytics and insights
            </p>
          </div>
        </div>
        
        <!-- Time estimate -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div class="flex items-center justify-center space-x-2 text-blue-800 dark:text-blue-200">
            <UIcon name="i-heroicons-clock" class="w-5 h-5" />
            <span class="text-sm font-medium">
              Takes about 5-7 minutes to complete
            </span>
          </div>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="space-y-4 pt-6">
        <div class="flex justify-between">
          <UButton
            variant="ghost"
            disabled
            class="opacity-50 cursor-not-allowed"
          >
            Previous
          </UButton>
          
          <UButton
            @click="handleNext"
            size="lg"
            class="px-8"
          >
            Get Started
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
        </div>
        
        <!-- Quick setup option -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Prefer a faster setup?
          </p>
          <UButton
            @click="handleSimplified"
            variant="outline"
            size="sm"
          >
            <UIcon name="i-heroicons-bolt" class="w-4 h-4 mr-2" />
            Single Page Setup
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()

// Load existing data if resuming
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
})

function handleNext() {
  onboardingStore.goToStep(2)
  navigateTo('/onboarding/step-2-age-height-weight')
}

function handleSimplified() {
  navigateTo('/onboarding/simplified')
}

function saveAndExit() {
  onboardingStore.persistState()
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Welcome - BeFit Onboarding'
})
</script>