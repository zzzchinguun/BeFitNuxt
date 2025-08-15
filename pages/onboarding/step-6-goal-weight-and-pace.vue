<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-3xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="6" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Set Your Target Weight & Pace
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Choose a realistic target weight and how quickly you want to reach it
        </p>
      </div>

      <form @submit.prevent="handleNext" class="space-y-8">
        <!-- Current weight display -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Current Weight
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatWeight(currentWeight) }}
          </div>
        </div>

        <!-- Pace Selector Component -->
        <PaceSelector
          :goal-type="goalType!"
          :current-weight-kg="currentWeight"
          :target-weight-kg="formData.targetWeightKg"
          :pace="formData.paceKgPerWeek"
          :weight-unit="weightUnit"
          @update:target-weight="updateTargetWeight"
          @update:pace="updatePace"
          :error="errors.general"
        />

        <!-- Goal validation feedback -->
        <div v-if="goalValidation" class="rounded-lg p-4" :class="goalValidation.class">
          <div class="flex items-start space-x-2">
            <UIcon :name="goalValidation.icon" class="w-4 h-4 mt-0.5" />
            <div class="text-sm">
              <div class="font-medium">{{ goalValidation.title }}</div>
              <div class="mt-1">{{ goalValidation.message }}</div>
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
import { estimateTimeline, validateSafePace } from '~/utils/onboarding'
import { validateTargetWeightDirection } from '~/utils/onboarding.schemas'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Form data
const formData = reactive({
  targetWeightKg: 70,
  paceKgPerWeek: 0.5
})

// Validation
const errors = ref<Record<string, string>>({})

// Get data from store
const goalType = computed(() => onboardingStore.goalType)
const currentWeightData = computed(() => onboardingStore.physical.weight)
const weightUnit = computed(() => currentWeightData.value?.unit || 'kg')

const currentWeight = computed(() => {
  if (!onboardingStore.metricPhysical) return 70
  return onboardingStore.metricPhysical.weightKg
})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  const existing = onboardingStore.plan
  
  if (existing.targetWeightKg) {
    formData.targetWeightKg = existing.targetWeightKg
  } else {
    // Set sensible defaults based on goal
    if (goalType.value === 'cut') {
      formData.targetWeightKg = currentWeight.value - 10
    } else if (goalType.value === 'bulk') {
      formData.targetWeightKg = currentWeight.value + 5
    }
  }
  
  if (existing.paceKgPerWeek) {
    formData.paceKgPerWeek = existing.paceKgPerWeek
  }
})

const isStepValid = computed(() => {
  return formData.targetWeightKg > 0 && 
         formData.paceKgPerWeek > 0 && 
         goalValidation.value?.isValid !== false
})

// Goal validation
const goalValidation = computed(() => {
  if (!goalType.value || !formData.targetWeightKg || !formData.paceKgPerWeek) {
    return null
  }
  
  // Validate direction
  const directionValid = validateTargetWeightDirection(
    currentWeight.value,
    formData.targetWeightKg,
    goalType.value
  )
  
  if (!directionValid) {
    return {
      isValid: false,
      title: 'Incorrect Direction',
      message: goalType.value === 'cut' 
        ? 'Target weight should be lower than current weight for fat loss'
        : 'Target weight should be higher than current weight for muscle gain',
      icon: 'i-heroicons-exclamation-triangle',
      class: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    }
  }
  
  // Validate pace safety
  const paceValidation = validateSafePace(formData.paceKgPerWeek, goalType.value)
  
  if (!paceValidation.isValid) {
    return {
      isValid: false,
      title: 'Unsafe Pace',
      message: paceValidation.message || 'This pace may be too aggressive and unhealthy',
      icon: 'i-heroicons-exclamation-triangle',
      class: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    }
  }
  
  // Check for aggressive pace
  if ((goalType.value === 'cut' && formData.paceKgPerWeek > 0.75) ||
      (goalType.value === 'bulk' && formData.paceKgPerWeek > 0.35)) {
    return {
      isValid: true,
      title: 'Aggressive Pace',
      message: 'This is a fast pace. Make sure you can maintain it safely with proper nutrition and recovery.',
      icon: 'i-heroicons-exclamation-triangle',
      class: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    }
  }
  
  return {
    isValid: true,
    title: 'Good Plan',
    message: 'Your target weight and pace look realistic and achievable.',
    icon: 'i-heroicons-check-circle',
    class: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
  }
})

function formatWeight(weightKg: number): string {
  if (weightUnit.value === 'lb') {
    return `${Math.round(weightKg * 2.20462 * 10) / 10} lb`
  }
  return `${Math.round(weightKg * 10) / 10} kg`
}

function updateTargetWeight(weightKg: number) {
  formData.targetWeightKg = weightKg
}

function updatePace(pace: number) {
  formData.paceKgPerWeek = pace
}

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.targetWeightKg || formData.targetWeightKg <= 0) {
    errors.value.general = 'Please set a target weight'
    return false
  }
  
  if (!formData.paceKgPerWeek || formData.paceKgPerWeek <= 0) {
    errors.value.general = 'Please set a target pace'
    return false
  }
  
  if (goalValidation.value?.isValid === false) {
    errors.value.general = goalValidation.value.message
    return false
  }
  
  return true
}

function handleNext() {
  if (!validateForm() || !isStepValid.value) return

  // Calculate timeline
  const timeline = estimateTimeline(
    currentWeight.value,
    formData.targetWeightKg,
    formData.paceKgPerWeek
  )

  // Save plan data
  onboardingStore.setPlan({
    targetWeightKg: formData.targetWeightKg,
    paceKgPerWeek: formData.paceKgPerWeek,
    estimatedWeeks: timeline.estimatedWeeks
  })

  onboardingStore.nextStep()
  navigateTo('/onboarding/step-7-timeline-preview')
}

function handlePrevious() {
  onboardingStore.previousStep()
  navigateTo('/onboarding/step-5-goal')
}

function saveAndExit() {
  if (isStepValid.value) {
    const timeline = estimateTimeline(
      currentWeight.value,
      formData.targetWeightKg,
      formData.paceKgPerWeek
    )
    
    onboardingStore.setPlan({
      targetWeightKg: formData.targetWeightKg,
      paceKgPerWeek: formData.paceKgPerWeek,
      estimatedWeeks: timeline.estimatedWeeks
    })
  }
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Target Weight & Pace - BeFit Onboarding'
})
</script>