<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-4xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="5" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Fitness Goal
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          This will determine your calorie target and macro distribution
        </p>
      </div>

      <form @submit.prevent="handleNext" class="space-y-8">
        <!-- Goal Selector -->
        <GoalSelector
          v-model="formData.goal"
          label="Fitness Goal"
          description="What do you want to achieve?"
          :error="errors.goal"
        />

        <!-- Current metrics display -->
        <div v-if="currentMetrics" class="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Your Current Metrics
          </h4>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div class="font-medium text-blue-600 dark:text-blue-400">
                {{ currentMetrics.bmr }}
              </div>
              <div class="text-blue-800 dark:text-blue-200">
                BMR
              </div>
            </div>
            
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div class="font-medium text-green-600 dark:text-green-400">
                {{ currentMetrics.tdee }}
              </div>
              <div class="text-green-800 dark:text-green-200">
                TDEE
              </div>
            </div>
            
            <div v-if="currentMetrics.bodyFat" class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div class="font-medium text-purple-600 dark:text-purple-400">
                {{ currentMetrics.bodyFat }}%
              </div>
              <div class="text-purple-800 dark:text-purple-200">
                Body Fat
              </div>
            </div>
            
            <div v-if="currentMetrics.leanMass" class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div class="font-medium text-orange-600 dark:text-orange-400">
                {{ currentMetrics.leanMass }}kg
              </div>
              <div class="text-orange-800 dark:text-orange-200">
                Lean Mass
              </div>
            </div>
          </div>
        </div>

        <!-- Goal-specific guidance -->
        <div v-if="goalGuidance" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <UIcon :name="goalGuidance.icon" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {{ goalGuidance.title }}
              </h4>
              <p class="text-sm text-blue-800 dark:text-blue-200">
                {{ goalGuidance.description }}
              </p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div class="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Focus
                </div>
                <div class="text-blue-700 dark:text-blue-300">
                  {{ goalGuidance.focus }}
                </div>
              </div>
              
              <div class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div class="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Approach
                </div>
                <div class="text-blue-700 dark:text-blue-300">
                  {{ goalGuidance.approach }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between pt-4">
          <UButton
            type="button"
            variant="ghost"
            @click="handlePrevious"
          >
            Previous
          </UButton>
          
          <UButton
            type="submit"
            :disabled="!isStepValid"
            size="lg"
          >
            Next
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GoalType } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Form data
const formData = reactive({
  goal: null as GoalType | null
})

// Validation
const errors = ref<Record<string, string>>({})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  const existing = onboardingStore.goalType
  
  if (existing) {
    formData.goal = existing
  }
})

const isStepValid = computed(() => {
  return !!formData.goal
})

// Current metrics display
const currentMetrics = computed(() => {
  const bmr = onboardingStore.bmr
  const tdee = onboardingStore.tdee
  const bodyFat = onboardingStore.bodyFatPercent
  const leanMass = onboardingStore.leanBodyMass
  
  if (!bmr || !tdee) return null
  
  return {
    bmr: bmr.toLocaleString(),
    tdee: tdee.toLocaleString(),
    bodyFat: bodyFat ? Math.round(bodyFat) : null,
    leanMass: leanMass ? Math.round(leanMass * 10) / 10 : null
  }
})

// Goal-specific guidance
const goalGuidance = computed(() => {
  if (!formData.goal) return null
  
  switch (formData.goal) {
    case 'cut':
      return {
        title: 'Fat Loss Plan',
        description: 'Create a caloric deficit to lose fat while preserving muscle mass',
        focus: 'High protein, moderate carbs, strategic training',
        approach: 'Gradual deficit with strength training',
        icon: 'i-heroicons-arrow-trending-down'
      }
    case 'bulk':
      return {
        title: 'Muscle Building Plan',
        description: 'Create a caloric surplus to build muscle mass and strength',
        focus: 'Progressive overload, adequate protein, consistent training',
        approach: 'Controlled surplus with resistance training',
        icon: 'i-heroicons-arrow-trending-up'
      }
    case 'maintain':
      return {
        title: 'Maintenance Plan',
        description: 'Maintain current weight while improving body composition',
        focus: 'Balanced macros, consistent training, lifestyle sustainability',
        approach: 'Maintenance calories with body recomposition',
        icon: 'i-heroicons-minus'
      }
    default:
      return null
  }
})

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.goal) {
    errors.value.goal = 'Please select your fitness goal'
    return false
  }
  
  return true
}

function handleNext() {
  if (!validateForm() || !isStepValid.value) return

  // Save goal
  onboardingStore.setGoal(formData.goal!)

  onboardingStore.nextStep()
  
  // Skip weight/pace setting for maintain goal
  if (formData.goal === 'maintain') {
    onboardingStore.setPlan({
      targetWeightKg: onboardingStore.metricPhysical?.weightKg || 70,
      paceKgPerWeek: 0,
      estimatedWeeks: 0
    })
    onboardingStore.nextStep() // Skip step 6
    navigateTo('/onboarding/step-7-timeline-preview')
  } else {
    navigateTo('/onboarding/step-6-goal-weight-and-pace')
  }
}

function handlePrevious() {
  onboardingStore.previousStep()
  navigateTo('/onboarding/step-4-body-fat')
}

function saveAndExit() {
  if (isStepValid.value) {
    onboardingStore.setGoal(formData.goal!)
  }
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Fitness Goal - BeFit Onboarding'
})
</script>