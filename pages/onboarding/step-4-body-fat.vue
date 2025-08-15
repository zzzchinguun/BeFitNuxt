<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-3xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="4" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Body Fat Estimation
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Help us estimate your body fat percentage for better calculations
        </p>
      </div>

      <form @submit.prevent="handleNext" class="space-y-8">
        <!-- Body Fat Selector -->
        <BodyFatSelector
          v-model="formData"
          :gender="gender"
          :height-cm="metricMeasurements?.heightCm"
          :weight-kg="metricMeasurements?.weightKg"
          label="Body Fat Method"
          description="Choose how you'd like to estimate your body fat"
          :error="errors.bodyFat"
        />

        <!-- Estimated body fat display -->
        <div v-if="estimatedBodyFat" class="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div class="text-center space-y-4">
            <h4 class="font-semibold text-gray-900 dark:text-white">
              Estimated Body Fat
            </h4>
            
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ estimatedBodyFat }}%
            </div>
            
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ bodyFatCategory }}
            </div>
            
            <!-- Accuracy warning for certain methods -->
            <div v-if="showAccuracyWarning" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <div class="flex items-start space-x-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div class="text-sm text-yellow-800 dark:text-yellow-200">
                  {{ accuracyWarningText }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Body fat ranges reference -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Body Fat Reference Ranges
          </h4>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div v-for="range in bodyFatRanges" :key="range.category" class="text-center p-3 rounded-lg"
              :class="range.bgClass"
            >
              <div class="font-medium" :class="range.textClass">
                {{ range.category }}
              </div>
              <div class="text-xs" :class="range.textClass">
                {{ range.range }}
              </div>
            </div>
          </div>
        </div>

        <!-- Skip option -->
        <div class="text-center">
          <button
            type="button"
            @click="skipBodyFat"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Skip this step (we'll use averages)
          </button>
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
import type { BodyFatInput } from '~/types'
import { convertToMetric } from '~/utils/onboarding'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Form data
const formData = ref<BodyFatInput>({
  method: 'unknown'
})

// Validation
const errors = ref<Record<string, string>>({})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  const existing = onboardingStore.bodyFatData
  
  if (existing.method) {
    formData.value = { ...existing }
  }
})

// Get gender and measurements from previous steps
const gender = computed(() => onboardingStore.physical.gender)

const metricMeasurements = computed(() => {
  const physical = onboardingStore.physical
  if (!physical.height || !physical.weight || !physical.gender) return null
  
  return convertToMetric(physical as any)
})

// Body fat estimation
const estimatedBodyFat = computed(() => {
  return onboardingStore.bodyFatPercent
})

// Body fat category
const bodyFatCategory = computed(() => {
  if (!estimatedBodyFat.value || !gender.value) return ''
  
  const percent = estimatedBodyFat.value
  
  if (gender.value === 'male') {
    if (percent < 6) return 'Essential Fat'
    if (percent < 14) return 'Athletic'
    if (percent < 18) return 'Fitness'
    if (percent < 25) return 'Average'
    return 'Obese'
  } else {
    if (percent < 14) return 'Essential Fat'
    if (percent < 21) return 'Athletic'
    if (percent < 25) return 'Fitness'
    if (percent < 32) return 'Average'
    return 'Obese'
  }
})

// Accuracy warnings
const showAccuracyWarning = computed(() => {
  return formData.value.method === 'unknown' || formData.value.method === 'visual'
})

const accuracyWarningText = computed(() => {
  if (formData.value.method === 'unknown') {
    return 'This is an estimate based on statistical averages. For more accurate results, consider using body composition analysis.'
  }
  if (formData.value.method === 'visual') {
    return 'Visual estimation can be subjective. Consider using measurement methods for better accuracy.'
  }
  return ''
})

// Body fat ranges for reference
const bodyFatRanges = computed(() => {
  if (!gender.value) return []
  
  if (gender.value === 'male') {
    return [
      {
        category: 'Essential Fat',
        range: '3-5%',
        bgClass: 'bg-red-100 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-300'
      },
      {
        category: 'Athletic',
        range: '6-13%',
        bgClass: 'bg-blue-100 dark:bg-blue-900/20',
        textClass: 'text-blue-700 dark:text-blue-300'
      },
      {
        category: 'Fitness',
        range: '14-17%',
        bgClass: 'bg-green-100 dark:bg-green-900/20',
        textClass: 'text-green-700 dark:text-green-300'
      },
      {
        category: 'Average',
        range: '18-24%',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
        textClass: 'text-yellow-700 dark:text-yellow-300'
      },
      {
        category: 'Obese',
        range: '25%+',
        bgClass: 'bg-red-100 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-300'
      }
    ]
  } else {
    return [
      {
        category: 'Essential Fat',
        range: '10-13%',
        bgClass: 'bg-red-100 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-300'
      },
      {
        category: 'Athletic',
        range: '14-20%',
        bgClass: 'bg-blue-100 dark:bg-blue-900/20',
        textClass: 'text-blue-700 dark:text-blue-300'
      },
      {
        category: 'Fitness',
        range: '21-24%',
        bgClass: 'bg-green-100 dark:bg-green-900/20',
        textClass: 'text-green-700 dark:text-green-300'
      },
      {
        category: 'Average',
        range: '25-31%',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
        textClass: 'text-yellow-700 dark:text-yellow-300'
      },
      {
        category: 'Obese',
        range: '32%+',
        bgClass: 'bg-red-100 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-300'
      }
    ]
  }
})

function skipBodyFat() {
  formData.value = { method: 'unknown' }
  handleNext()
}

function handleNext() {
  // Save body fat data
  onboardingStore.setBodyFat(formData.value)

  onboardingStore.nextStep()
  navigateTo('/onboarding/step-5-goal')
}

function handlePrevious() {
  onboardingStore.previousStep()
  navigateTo('/onboarding/step-3-gender-activity')
}

function saveAndExit() {
  onboardingStore.setBodyFat(formData.value)
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Body Fat - BeFit Onboarding'
})
</script>