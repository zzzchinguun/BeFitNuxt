<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-4xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="8" 
        :total-steps="8"
        :show-save-exit="false"
      />
      
      <div class="text-center">
        <div class="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-heroicons-check" class="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          You're All Set!
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Your personalized fitness plan is ready
        </p>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Profile -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-user" class="w-5 h-5 mr-2" />
            Your Profile
          </h3>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Age</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ physical?.ageYears }} years</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Gender</span>
              <span class="font-medium text-gray-900 dark:text-white capitalize">{{ physical?.gender }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Height</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ physical?.height.value }}{{ physical?.height.unit }}
                <span v-if="heightConversion" class="text-gray-500 dark:text-gray-400">({{ heightConversion }})</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Weight</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ physical?.weight.value }}{{ physical?.weight.unit }}
                <span v-if="weightConversion" class="text-gray-500 dark:text-gray-400">({{ weightConversion }})</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Activity Level</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ activityLabel }}</span>
            </div>
            <div v-if="bodyFatPercent" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Body Fat</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ Math.round(bodyFatPercent) }}%</span>
            </div>
          </div>
        </div>

        <!-- Goal & Timeline -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-target" class="w-5 h-5 mr-2" />
            Goal & Timeline
          </h3>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Goal Type</span>
              <span class="font-medium text-gray-900 dark:text-white capitalize">{{ goalTypeLabel }}</span>
            </div>
            <div v-if="plan?.targetWeightKg && goalType !== 'maintain'" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Target Weight</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatWeight(plan.targetWeightKg) }}</span>
            </div>
            <div v-if="plan?.paceKgPerWeek && goalType !== 'maintain'" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Pace</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ plan.paceKgPerWeek }} kg/week</span>
            </div>
            <div v-if="timeline" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Timeline</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ timeline.estimatedWeeks }} weeks
                <span v-if="timeline.finishDate" class="text-gray-500 dark:text-gray-400">
                  ({{ formatDate(timeline.finishDate) }})
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Metabolic Data -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-fire" class="w-5 h-5 mr-2" />
            Metabolic Data
          </h3>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">BMR</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ bmr?.toLocaleString() }} kcal</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">TDEE</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ tdee?.toLocaleString() }} kcal</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Target Calories</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ calorieTarget?.toLocaleString() }} kcal</span>
            </div>
            <div v-if="leanBodyMass" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Lean Body Mass</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ Math.round(leanBodyMass * 10) / 10 }} kg</span>
            </div>
          </div>
        </div>

        <!-- Macro Plan -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 mr-2" />
            Macro Plan
          </h3>
          
          <div v-if="finalMacros" class="space-y-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ finalMacros.kcal.toLocaleString() }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Daily Calories
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-3 text-center text-sm">
              <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div class="font-bold text-red-600 dark:text-red-400">{{ finalMacros.proteinG }}g</div>
                <div class="text-red-800 dark:text-red-200">Protein</div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div class="font-bold text-green-600 dark:text-green-400">{{ finalMacros.carbsG }}g</div>
                <div class="text-green-800 dark:text-green-200">Carbs</div>
              </div>
              <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <div class="font-bold text-yellow-600 dark:text-yellow-400">{{ finalMacros.fatG }}g</div>
                <div class="text-yellow-800 dark:text-yellow-200">Fat</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- App version -->
      <div v-if="appVersion" class="text-center text-xs text-gray-500 dark:text-gray-400">
        Version {{ appVersion }}
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <UButton
          variant="ghost"
          @click="handleEdit"
        >
          <UIcon name="i-heroicons-pencil" class="w-4 h-4 mr-2" />
          Edit Plan
        </UButton>
        
        <UButton
          @click="handleComplete"
          :loading="isLoading"
          size="lg"
          class="px-8"
        >
          <UIcon name="i-heroicons-check" class="w-5 h-5 mr-2" />
          Complete Setup
        </UButton>
        
        <UButton
          variant="outline"
          @click="handleRestart"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
          Start Over
        </UButton>
      </div>

      <!-- Completion status -->
      <div v-if="completionMessage" class="text-center">
        <div class="inline-flex items-center px-4 py-2 rounded-lg" :class="completionMessage.class">
          <UIcon :name="completionMessage.icon" class="w-4 h-4 mr-2" />
          <span class="text-sm font-medium">{{ completionMessage.text }}</span>
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
const { t } = useI18n()

// Get data from store
const physical = computed(() => onboardingStore.physical)
const activity = computed(() => onboardingStore.activity)
const bodyFatPercent = computed(() => onboardingStore.bodyFatPercent)
const goalType = computed(() => onboardingStore.goalType)
const plan = computed(() => onboardingStore.plan)
const timeline = computed(() => onboardingStore.timeline)
const bmr = computed(() => onboardingStore.bmr)
const tdee = computed(() => onboardingStore.tdee)
const calorieTarget = computed(() => onboardingStore.calorieTarget)
const leanBodyMass = computed(() => onboardingStore.leanBodyMass)
const finalMacros = computed(() => onboardingStore.finalMacros)
const isLoading = computed(() => onboardingStore.isLoading)

// App version
const config = useRuntimeConfig()
const appVersion = computed(() => config.public.appVersion)

// Completion state
const completionMessage = ref<{
  text: string
  class: string
  icon: string
} | null>(null)

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  onboardingStore.computeAll()
})

// Format conversions
const heightConversion = computed(() => {
  if (!physical.value?.height) return null
  
  if (physical.value.height.unit === 'cm') {
    const inches = physical.value.height.value / 2.54
    return `${Math.round(inches * 10) / 10}"`
  } else {
    const cm = physical.value.height.value * 2.54
    return `${Math.round(cm)}cm`
  }
})

const weightConversion = computed(() => {
  if (!physical.value?.weight) return null
  
  if (physical.value.weight.unit === 'kg') {
    const lbs = physical.value.weight.value * 2.20462
    return `${Math.round(lbs * 10) / 10}lb`
  } else {
    const kg = physical.value.weight.value / 2.20462
    return `${Math.round(kg * 10) / 10}kg`
  }
})

// Labels
const activityLabel = computed(() => {
  if (!activity.value) return ''
  const labels: Record<string, string> = {
    'sedentary': 'Sedentary (Little/no exercise)',
    'lightly_active': 'Lightly Active (1-3 days/week)',
    'moderately_active': 'Moderately Active (3-5 days/week)',
    'very_active': 'Very Active (6-7 days/week)',
    'extremely_active': 'Extremely Active (2x/day)'
  }
  return labels[activity.value] || activity.value
})

const goalTypeLabel = computed(() => {
  if (!goalType.value) return ''
  const labels: Record<string, string> = {
    'cut': 'Fat Loss',
    'bulk': 'Muscle Gain',
    'maintain': 'Maintain Weight'
  }
  return labels[goalType.value] || goalType.value
})

function formatWeight(weightKg: number): string {
  const unit = physical.value?.weight.unit || 'kg'
  if (unit === 'lb') {
    return `${Math.round(weightKg * 2.20462 * 10) / 10}lb`
  }
  return `${Math.round(weightKg * 10) / 10}kg`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

async function handleComplete() {
  try {
    const result = await onboardingStore.saveToFirestore()
    
    if (result.success) {
      completionMessage.value = {
        text: 'Setup completed successfully! Redirecting to dashboard...',
        class: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
        icon: 'i-heroicons-check-circle'
      }
      
      // Redirect to meal generation after a short delay
      setTimeout(() => {
        navigateTo('/meal-generation')
      }, 2000)
    } else {
      completionMessage.value = {
        text: result.error || 'Failed to save your plan. Please try again.',
        class: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
        icon: 'i-heroicons-exclamation-circle'
      }
    }
  } catch (error: any) {
    console.error('Onboarding completion error:', error)
    completionMessage.value = {
      text: error.message || 'Failed to save your plan. Please try again.',
      class: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      icon: 'i-heroicons-exclamation-circle'
    }
  }
}

function handleEdit() {
  // Allow user to go back to step 8 to make final adjustments
  onboardingStore.goToStep(8)
  navigateTo('/onboarding/step-8-macros')
}

function handleRestart() {
  if (confirm('Are you sure you want to start over? This will delete all your current progress.')) {
    onboardingStore.reset()
    navigateTo('/onboarding/step-1-welcome')
  }
}

// Set page title
useHead({
  title: 'Onboarding Complete - BeFit'
})
</script>