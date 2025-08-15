<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="3" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gender & Activity Level
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          This helps us calculate your daily calorie needs
        </p>
      </div>

      <form @submit.prevent="handleNext" class="space-y-8">
        <!-- Gender Selection -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white text-center">
            What's your gender?
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="formData.gender = 'male'"
              class="p-6 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md"
              :class="{
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20': formData.gender === 'male',
                'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-gray-300': formData.gender !== 'male'
              }"
            >
              <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-100 dark:bg-blue-800': formData.gender === 'male',
                  'bg-gray-100 dark:bg-gray-600': formData.gender !== 'male'
                }"
              >
                <UIcon 
                  name="i-heroicons-user" 
                  class="w-8 h-8"
                  :class="{
                    'text-blue-600 dark:text-blue-400': formData.gender === 'male',
                    'text-gray-500 dark:text-gray-400': formData.gender !== 'male'
                  }"
                />
              </div>
              <div class="font-semibold"
                :class="{
                  'text-blue-900 dark:text-blue-100': formData.gender === 'male',
                  'text-gray-900 dark:text-white': formData.gender !== 'male'
                }"
              >
                Male
              </div>
            </button>
            
            <button
              type="button"
              @click="formData.gender = 'female'"
              class="p-6 rounded-xl border-2 text-center transition-all duration-200 hover:shadow-md"
              :class="{
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20': formData.gender === 'female',
                'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-gray-300': formData.gender !== 'female'
              }"
            >
              <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-100 dark:bg-blue-800': formData.gender === 'female',
                  'bg-gray-100 dark:bg-gray-600': formData.gender !== 'female'
                }"
              >
                <UIcon 
                  name="i-heroicons-user" 
                  class="w-8 h-8"
                  :class="{
                    'text-blue-600 dark:text-blue-400': formData.gender === 'female',
                    'text-gray-500 dark:text-gray-400': formData.gender !== 'female'
                  }"
                />
              </div>
              <div class="font-semibold"
                :class="{
                  'text-blue-900 dark:text-blue-100': formData.gender === 'female',
                  'text-gray-900 dark:text-white': formData.gender !== 'female'
                }"
              >
                Female
              </div>
            </button>
          </div>
        </div>

        <!-- Activity Level Selection -->
        <div class="space-y-4">
          <ActivitySelector
            v-model="formData.activity"
            label="Activity Level"
            description="How active are you during a typical week?"
            :error="errors.activity"
          />
        </div>

        <!-- Preview calculations -->
        <div v-if="previewCalculations" class="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <h4 class="font-semibold text-gray-900 dark:text-white text-center">
            Estimated Calorie Needs
          </h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ previewCalculations.bmr }}
              </div>
              <div class="text-sm text-blue-800 dark:text-blue-200">
                BMR (cal/day)
              </div>
            </div>
            
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ previewCalculations.tdee }}
              </div>
              <div class="text-sm text-green-800 dark:text-green-200">
                TDEE (cal/day)
              </div>
            </div>
          </div>
          
          <div class="text-xs text-gray-600 dark:text-gray-400 text-center">
            These are estimates based on your physical stats and activity level
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
import type { ActivityLevel } from '~/types'
import { calculateBMR, calculateTDEE, convertToMetric } from '~/utils/onboarding'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Form data
const formData = reactive({
  gender: null as 'male' | 'female' | null,
  activity: null as ActivityLevel | null
})

// Validation
const errors = ref<Record<string, string>>({})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  const existingPhysical = onboardingStore.physical
  const existingActivity = onboardingStore.activity
  
  if (existingPhysical.gender) {
    formData.gender = existingPhysical.gender
  }
  if (existingActivity) {
    formData.activity = existingActivity
  }
})

const isStepValid = computed(() => {
  return formData.gender && formData.activity
})

// Preview calculations
const previewCalculations = computed(() => {
  if (!formData.gender || !formData.activity || !onboardingStore.physical.ageYears) {
    return null
  }
  
  const physical = onboardingStore.physical
  if (!physical.height || !physical.weight) return null
  
  try {
    const { heightCm, weightKg } = convertToMetric({
      ...physical,
      gender: formData.gender
    })
    
    const bmr = calculateBMR(weightKg, heightCm, physical.ageYears, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activity)
    
    return {
      bmr: bmr.toLocaleString(),
      tdee: tdee.toLocaleString()
    }
  } catch {
    return null
  }
})

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.gender) {
    errors.value.gender = 'Please select your gender'
    return false
  }
  
  if (!formData.activity) {
    errors.value.activity = 'Please select your activity level'
    return false
  }
  
  return true
}

function handleNext() {
  if (!validateForm() || !isStepValid.value) return

  // Update physical data with gender
  onboardingStore.setPhysical({
    ...onboardingStore.physical,
    gender: formData.gender!
  })
  
  // Set activity level
  onboardingStore.setActivity(formData.activity!)

  onboardingStore.nextStep()
  navigateTo('/onboarding/step-4-body-fat')
}

function handlePrevious() {
  onboardingStore.previousStep()
  navigateTo('/onboarding/step-2-age-height-weight')
}

function saveAndExit() {
  if (isStepValid.value) {
    onboardingStore.setPhysical({
      ...onboardingStore.physical,
      gender: formData.gender!
    })
    onboardingStore.setActivity(formData.activity!)
  }
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Gender & Activity - BeFit Onboarding'
})
</script>