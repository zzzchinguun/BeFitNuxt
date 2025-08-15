<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="2" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tell us about yourself
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          We'll use this information to calculate your personalized plan
        </p>
      </div>

      <form @submit.prevent="handleNext" class="space-y-6">
        <!-- Age -->
        <UFormGroup label="Age" name="age" :error="errors.age">
          <UInput
            v-model.number="formData.ageYears"
            type="number"
            min="13"
            max="100"
            required
            placeholder="Enter your age"
            size="lg"
          />
          <template #help>
            <span class="text-xs text-gray-500">Must be between 13 and 100 years</span>
          </template>
        </UFormGroup>

        <!-- Height -->
        <UFormGroup label="Height" name="height" :error="errors.height">
          <UnitInput
            v-model="formData.height.value"
            v-model:unit="formData.height.unit"
            :unit-options="heightUnits"
            placeholder="Enter your height"
            :min="120"
            :max="250"
            hint="Choose your preferred unit"
          />
        </UFormGroup>

        <!-- Weight -->
        <UFormGroup label="Weight" name="weight" :error="errors.weight">
          <UnitInput
            v-model="formData.weight.value"
            v-model:unit="formData.weight.unit"
            :unit-options="weightUnits"
            placeholder="Enter your weight"
            :min="30"
            :max="300"
            :step="0.1"
            hint="Choose your preferred unit"
          />
        </UFormGroup>

        <!-- BMI Display -->
        <div v-if="bmi" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              BMI: {{ bmi }}
            </div>
            <div class="text-sm" :class="bmiColorClass">
              {{ bmiCategory }}
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
import { physicalStatsSchema } from '~/utils/onboarding.schemas'
import type { PhysicalStats } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Form data
const formData = reactive<PhysicalStats>({
  ageYears: 25,
  height: { value: 175, unit: 'cm' },
  weight: { value: 70, unit: 'kg' },
  gender: 'male' // Will be set in next step, but needed for type
})

// Unit options
const heightUnits = [
  { label: 'cm', value: 'cm' },
  { label: 'in', value: 'in' }
]

const weightUnits = [
  { label: 'kg', value: 'kg' },
  { label: 'lb', value: 'lb' }
]

// Validation
const errors = ref<Record<string, string>>({})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  const existing = onboardingStore.physical
  
  if (existing.ageYears) formData.ageYears = existing.ageYears
  if (existing.height) {
    formData.height = { ...existing.height }
  }
  if (existing.weight) {
    formData.weight = { ...existing.weight }
  }
})

// BMI calculation
const bmi = computed(() => {
  if (!formData.height.value || !formData.weight.value) return null
  
  let heightM = formData.height.value
  let weightKg = formData.weight.value
  
  // Convert to metric
  if (formData.height.unit === 'in') {
    heightM = heightM * 2.54 / 100
  } else {
    heightM = heightM / 100
  }
  
  if (formData.weight.unit === 'lb') {
    weightKg = weightKg * 0.453592
  }
  
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
})

const bmiCategory = computed(() => {
  if (!bmi.value) return ''
  
  if (bmi.value < 18.5) return 'Underweight'
  if (bmi.value < 25) return 'Normal'
  if (bmi.value < 30) return 'Overweight'
  return 'Obese'
})

const bmiColorClass = computed(() => {
  if (!bmi.value) return ''
  
  if (bmi.value < 18.5) return 'text-blue-600 dark:text-blue-400'
  if (bmi.value < 25) return 'text-green-600 dark:text-green-400'
  if (bmi.value < 30) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
})

const isStepValid = computed(() => {
  return formData.ageYears >= 13 && formData.ageYears <= 100 &&
         formData.height.value >= 120 && formData.height.value <= 250 &&
         formData.weight.value >= 30 && formData.weight.value <= 300
})

function validateForm(): boolean {
  errors.value = {}
  
  try {
    physicalStatsSchema.omit({ gender: true }).parse(formData)
    return true
  } catch (error: any) {
    if (error.errors) {
      error.errors.forEach((err: any) => {
        const field = err.path.join('.')
        errors.value[field] = err.message
      })
    }
    return false
  }
}

function handleNext() {
  if (!validateForm() || !isStepValid.value) return

  // Save partial data (without gender which comes in next step)
  onboardingStore.setPhysical({
    ageYears: formData.ageYears,
    height: { ...formData.height },
    weight: { ...formData.weight }
  })

  onboardingStore.nextStep()
  navigateTo('/onboarding/step-3-gender-activity')
}

function handlePrevious() {
  onboardingStore.previousStep()
  navigateTo('/onboarding/step-1-welcome')
}

function saveAndExit() {
  if (isStepValid.value) {
    onboardingStore.setPhysical({
      ageYears: formData.ageYears,
      height: { ...formData.height },
      weight: { ...formData.weight }
    })
  }
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Basic Information - BeFit Onboarding'
})
</script>