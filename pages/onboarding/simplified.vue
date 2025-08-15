<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Set Up Your Fitness Plan
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Complete your profile in one simple form
        </p>
      </div>

      <!-- Progress indicator -->
      <div class="mb-8">
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${completionPercentage}%` }"
          />
        </div>
        <div class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {{ completionPercentage }}% Complete
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Left Column: Basic Information -->
          <div class="space-y-6">
            
            <!-- Personal Details Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-user" class="w-5 h-5 mr-2" />
                Personal Details
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Age -->
                <UFormGroup label="Age" name="age" :error="errors.age">
                  <UInput
                    v-model.number="formData.ageYears"
                    type="number"
                    min="13"
                    max="100"
                    required
                    placeholder="25"
                    size="lg"
                  />
                </UFormGroup>

                <!-- Gender -->
                <UFormGroup label="Gender" name="gender" :error="errors.gender">
                  <USelect
                    v-model="formData.gender"
                    :options="genderOptions"
                    placeholder="Select gender"
                    size="lg"
                  />
                </UFormGroup>

                <!-- Height -->
                <UFormGroup label="Height" name="height" :error="errors.height">
                  <UnitInput
                    v-model="formData.height.value"
                    v-model:unit="formData.height.unit"
                    :unit-options="heightUnits"
                    placeholder="175"
                    :min="120"
                    :max="250"
                  />
                </UFormGroup>

                <!-- Weight -->
                <UFormGroup label="Weight" name="weight" :error="errors.weight">
                  <UnitInput
                    v-model="formData.weight.value"
                    v-model:unit="formData.weight.unit"
                    :unit-options="weightUnits"
                    placeholder="70"
                    :min="30"
                    :max="300"
                    :step="0.1"
                  />
                </UFormGroup>
              </div>

              <!-- BMI Display -->
              <div v-if="bmi" class="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  BMI: {{ bmi }}
                </div>
                <div class="text-sm" :class="bmiColorClass">
                  {{ bmiCategory }}
                </div>
              </div>
            </div>

            <!-- Activity Level Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-bolt" class="w-5 h-5 mr-2" />
                Activity Level
              </h3>
              
              <ActivitySelector
                v-model="formData.activity"
                description="How active are you during a typical week?"
                :error="errors.activity"
              />
            </div>

            <!-- Body Fat Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 mr-2" />
                Body Fat (Optional)
              </h3>
              
              <BodyFatSelector
                v-model="formData.bodyFatData"
                :gender="formData.gender"
                :height-cm="metricMeasurements?.heightCm"
                :weight-kg="metricMeasurements?.weightKg"
                :error="errors.bodyFat"
              />
            </div>
          </div>

          <!-- Right Column: Goals & Results -->
          <div class="space-y-6">
            
            <!-- Goal Selection Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-target" class="w-5 h-5 mr-2" />
                Fitness Goal
              </h3>
              
              <GoalSelector
                v-model="formData.goalType"
                description="What's your primary fitness goal?"
                :error="errors.goalType"
              />
            </div>

            <!-- Goal Weight & Pace (only for cut/bulk) -->
            <div v-if="formData.goalType && formData.goalType !== 'maintain'" 
                 class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5 mr-2" />
                Target & Timeline
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Target Weight -->
                <UFormGroup label="Target Weight" name="targetWeight" :error="errors.targetWeight">
                  <UnitInput
                    v-model="formData.plan.targetWeightKg"
                    v-model:unit="weightDisplayUnit"
                    :unit-options="weightUnits"
                    placeholder="65"
                    :min="30"
                    :max="300"
                    :step="0.1"
                  />
                  <template #help>
                    <div v-if="targetWeightSuggestion" class="text-xs text-gray-500 mt-1">
                      Suggested range: {{ targetWeightSuggestion.min }}-{{ targetWeightSuggestion.max }}kg
                      <button 
                        @click="formData.plan.targetWeightKg = targetWeightSuggestion.recommended"
                        class="ml-2 text-blue-600 hover:text-blue-700 underline"
                        type="button"
                      >
                        Use {{ targetWeightSuggestion.recommended }}kg
                      </button>
                    </div>
                  </template>
                </UFormGroup>

                <!-- Pace -->
                <UFormGroup label="Pace (kg/week)" name="pace" :error="errors.pace">
                  <UInput
                    v-model.number="formData.plan.paceKgPerWeek"
                    type="number"
                    min="0.1"
                    max="2"
                    step="0.1"
                    placeholder="0.5"
                    size="lg"
                  />
                  <template #help>
                    <span class="text-xs text-gray-500">
                      Recommended: {{ recommendedPaceRange }}
                    </span>
                  </template>
                </UFormGroup>
              </div>

              <!-- Timeline Preview -->
              <div v-if="timeline" class="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div class="text-center">
                  <div class="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Estimated Timeline: {{ timeline.estimatedWeeks }} weeks
                  </div>
                  <div class="text-sm text-blue-700 dark:text-blue-300">
                    Target date: {{ formatDate(timeline.finishDate) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Metabolic Preview -->
            <div v-if="showMetabolicPreview" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-fire" class="w-5 h-5 mr-2" />
                Metabolic Calculations
              </h3>
              
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ bmr?.toLocaleString() }}
                  </div>
                  <div class="text-sm text-blue-800 dark:text-blue-200">
                    BMR (cal/day)
                  </div>
                  <div class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Base metabolism
                  </div>
                </div>
                
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {{ tdee?.toLocaleString() }}
                  </div>
                  <div class="text-sm text-green-800 dark:text-green-200">
                    TDEE (cal/day)
                  </div>
                  <div class="text-xs text-green-600 dark:text-green-300 mt-1">
                    With activity
                  </div>
                </div>

                <div v-if="calorieTarget" class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {{ calorieTarget.toLocaleString() }}
                  </div>
                  <div class="text-sm text-purple-800 dark:text-purple-200">
                    Target Calories
                  </div>
                  <div class="text-xs text-purple-600 dark:text-purple-300 mt-1">
                    {{ formData.goalType === 'cut' ? 'Deficit' : formData.goalType === 'bulk' ? 'Surplus' : 'Maintain' }}
                  </div>
                </div>

                <div v-if="bodyFatPercent" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {{ Math.round(bodyFatPercent) }}%
                  </div>
                  <div class="text-sm text-yellow-800 dark:text-yellow-200">
                    Body Fat
                  </div>
                  <div v-if="leanBodyMass" class="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                    {{ Math.round(leanBodyMass * 10) / 10 }}kg lean
                  </div>
                </div>
              </div>
              
              <!-- Calculation explanation -->
              <div v-if="formData.goalType && formData.goalType !== 'maintain'" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{{ formData.goalType === 'cut' ? 'Calorie Deficit:' : 'Calorie Surplus:' }}</strong>
                  {{ Math.abs((calorieTarget || 0) - (tdee || 0)) }} cal/day
                  ({{ formData.plan.paceKgPerWeek }}kg/week pace)
                </div>
              </div>
            </div>

            <!-- Macro Breakdown -->
            <div v-if="finalMacros" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 mr-2" />
                Daily Macro Targets
              </h3>
              
              <div class="text-center mb-4">
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
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

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <UButton
            variant="ghost"
            @click="saveAndExit"
          >
            Save & Exit
          </UButton>
          
          <UButton
            type="submit"
            :disabled="!isFormComplete"
            :loading="isLoading"
            size="lg"
            class="px-8"
          >
            <UIcon name="i-heroicons-check" class="w-5 h-5 mr-2" />
            Complete Setup
          </UButton>
          
          <UButton
            variant="outline"
            @click="resetForm"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
            Reset
          </UButton>
        </div>

        <!-- Status Messages -->
        <div v-if="statusMessage" class="text-center">
          <div class="inline-flex items-center px-4 py-2 rounded-lg" :class="statusMessage.class">
            <UIcon :name="statusMessage.icon" class="w-4 h-4 mr-2" />
            <span class="text-sm font-medium">{{ statusMessage.text }}</span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLevel, GoalType, BodyFatInput } from '~/types'
import { calculateBMR, calculateTDEE, convertToMetric, getRecommendedPaceRange, estimateTimeline, calculateCalorieTarget, calculateMacros, calculateLeanBodyMass } from '~/utils/onboarding'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()

// Form data structure that matches the store
const formData = reactive({
  ageYears: 25,
  gender: null as 'male' | 'female' | null,
  height: { value: 175, unit: 'cm' },
  weight: { value: 70, unit: 'kg' },
  activity: null as ActivityLevel | null,
  bodyFatData: { method: 'unknown' } as BodyFatInput,
  goalType: null as GoalType | null,
  plan: {
    targetWeightKg: null as number | null,
    paceKgPerWeek: 0.5,
    estimatedWeeks: 0
  }
})

// Form options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
]

const heightUnits = [
  { label: 'cm', value: 'cm' },
  { label: 'in', value: 'in' }
]

const weightUnits = [
  { label: 'kg', value: 'kg' },
  { label: 'lb', value: 'lb' }
]

// State
const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const statusMessage = ref<{
  text: string
  class: string
  icon: string
} | null>(null)

// Weight display unit for target weight
const weightDisplayUnit = ref('kg')

// Load existing data on mount
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  
  // Load existing data into form
  const existing = onboardingStore.physical
  if (existing.ageYears) formData.ageYears = existing.ageYears
  if (existing.gender) formData.gender = existing.gender
  if (existing.height) formData.height = { ...existing.height }
  if (existing.weight) {
    formData.weight = { ...existing.weight }
    weightDisplayUnit.value = existing.weight.unit
  }
  
  if (onboardingStore.activity) formData.activity = onboardingStore.activity
  if (onboardingStore.bodyFatData) formData.bodyFatData = { ...onboardingStore.bodyFatData }
  if (onboardingStore.goalType) formData.goalType = onboardingStore.goalType
  if (onboardingStore.plan) {
    formData.plan = { ...onboardingStore.plan }
  }
})

// Computed values
const metricMeasurements = computed(() => {
  if (!formData.height.value || !formData.weight.value || !formData.gender) return null
  
  return convertToMetric({
    ageYears: formData.ageYears,
    gender: formData.gender,
    height: formData.height,
    weight: formData.weight
  })
})

// BMI calculation
const bmi = computed(() => {
  if (!metricMeasurements.value) return null
  
  const heightM = metricMeasurements.value.heightCm / 100
  const weightKg = metricMeasurements.value.weightKg
  
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

// Metabolic calculations
const bmr = computed(() => {
  if (!metricMeasurements.value) return null
  return calculateBMR(
    metricMeasurements.value.weightKg,
    metricMeasurements.value.heightCm,
    formData.ageYears,
    formData.gender!
  )
})

const tdee = computed(() => {
  if (!bmr.value || !formData.activity) return null
  return calculateTDEE(bmr.value, formData.activity)
})

const calorieTarget = computed(() => {
  if (!tdee.value || !formData.goalType || !formData.gender) return null
  
  // For maintain goal, return TDEE
  if (formData.goalType === 'maintain') {
    return Math.round(tdee.value)
  }
  
  // For cut/bulk goals, need pace
  if (!formData.plan.paceKgPerWeek) return null
  
  // Use the proper calculation function from utils (imported at top)
  return calculateCalorieTarget(tdee.value, formData.goalType, formData.plan.paceKgPerWeek, formData.gender)
})

const bodyFatPercent = computed(() => {
  if (!formData.gender || !metricMeasurements.value) return null
  
  // Calculate body fat directly without side effects
  if (formData.bodyFatData.method === 'visual' && formData.bodyFatData.percent) {
    return formData.bodyFatData.percent
  }
  
  // Estimate from BMI if no specific data
  if (!bmi.value) return null
  
  // Simple BMI-based estimation
  const bmiVal = bmi.value
  if (formData.gender === 'male') {
    return Math.max(5, Math.min(35, (bmiVal - 15) * 1.2 + 10))
  } else {
    return Math.max(10, Math.min(40, (bmiVal - 15) * 1.5 + 15))
  }
})

const leanBodyMass = computed(() => {
  if (!metricMeasurements.value || !bodyFatPercent.value) return null
  return calculateLeanBodyMass(metricMeasurements.value.weightKg, bodyFatPercent.value)
})

const finalMacros = computed(() => {
  if (!calorieTarget.value || !formData.goalType || !metricMeasurements.value) return null
  
  // Use the sophisticated macro calculation from utils
  return calculateMacros(
    calorieTarget.value,
    formData.goalType,
    metricMeasurements.value.weightKg,
    leanBodyMass.value || undefined
  )
})

const timeline = computed(() => {
  if (!metricMeasurements.value || !formData.plan.targetWeightKg || !formData.plan.paceKgPerWeek) return null
  
  return estimateTimeline(
    metricMeasurements.value.weightKg,
    formData.plan.targetWeightKg,
    formData.plan.paceKgPerWeek
  )
})

const recommendedPaceRange = computed(() => {
  if (!formData.goalType) return ''
  const range = getRecommendedPaceRange(formData.goalType)
  return `${range.min}-${range.max} kg/week (recommended)`
})

// Auto-set recommended pace when goal changes
watch(() => formData.goalType, (newGoal) => {
  if (newGoal && newGoal !== 'maintain') {
    const range = getRecommendedPaceRange(newGoal)
    formData.plan.paceKgPerWeek = range.default
    
    // Auto-suggest target weight based on BMI and goal
    if (metricMeasurements.value && !formData.plan.targetWeightKg) {
      const currentWeight = metricMeasurements.value.weightKg
      const heightM = metricMeasurements.value.heightCm / 100
      const currentBMI = currentWeight / (heightM * heightM)
      
      let targetBMI: number
      if (newGoal === 'cut') {
        // Target healthy BMI range (20-24)
        targetBMI = currentBMI > 25 ? 23 : Math.max(20, currentBMI - 2)
      } else { // bulk
        // Target slightly higher BMI but stay healthy (22-26)
        targetBMI = currentBMI < 22 ? 24 : Math.min(26, currentBMI + 2)
      }
      
      const targetWeight = targetBMI * (heightM * heightM)
      formData.plan.targetWeightKg = Math.round(targetWeight * 2) / 2 // Round to 0.5kg
    }
  }
})

// Suggested target weight range
const targetWeightSuggestion = computed(() => {
  if (!metricMeasurements.value || !formData.goalType || formData.goalType === 'maintain') return null
  
  const currentWeight = metricMeasurements.value.weightKg
  const heightM = metricMeasurements.value.heightCm / 100
  const currentBMI = currentWeight / (heightM * heightM)
  
  if (formData.goalType === 'cut') {
    const healthyMinWeight = 18.5 * (heightM * heightM)
    const healthyMaxWeight = 24.9 * (heightM * heightM)
    const minTarget = Math.max(healthyMinWeight, currentWeight - (currentWeight * 0.2)) // Max 20% loss
    const maxTarget = Math.min(healthyMaxWeight, currentWeight - 2) // At least 2kg loss
    return {
      min: Math.round(minTarget * 2) / 2,
      max: Math.round(maxTarget * 2) / 2,
      recommended: Math.round((minTarget + maxTarget) / 2 * 2) / 2
    }
  } else {
    // bulk
    const healthyMaxWeight = 26 * (heightM * heightM) // Slightly above normal BMI
    const minTarget = currentWeight + 2 // At least 2kg gain
    const maxTarget = Math.min(healthyMaxWeight, currentWeight + (currentWeight * 0.15)) // Max 15% gain
    return {
      min: Math.round(minTarget * 2) / 2,
      max: Math.round(maxTarget * 2) / 2,
      recommended: Math.round((minTarget + maxTarget) / 2 * 2) / 2
    }
  }
})

// Form completion tracking with better validation
const completionPercentage = computed(() => {
  let completed = 0
  const total = 7
  
  // Age validation
  if (formData.ageYears >= 13 && formData.ageYears <= 100) completed++
  
  // Gender validation
  if (formData.gender) completed++
  
  // Height validation with unit consideration
  const heightValid = formData.height.unit === 'cm' 
    ? formData.height.value >= 120 && formData.height.value <= 250
    : formData.height.value >= 47 && formData.height.value <= 98 // inches
  if (heightValid) completed++
  
  // Weight validation with unit consideration
  const weightValid = formData.weight.unit === 'kg'
    ? formData.weight.value >= 30 && formData.weight.value <= 300
    : formData.weight.value >= 66 && formData.weight.value <= 660 // pounds
  if (weightValid) completed++
  
  // Activity level
  if (formData.activity) completed++
  
  // Goal type
  if (formData.goalType) completed++
  
  // Goal-specific requirements
  if (formData.goalType === 'maintain') {
    completed++ // No additional requirements for maintain
  } else if (formData.goalType && formData.plan.targetWeightKg && formData.plan.paceKgPerWeek > 0) {
    completed++ // Need target weight and pace for cut/bulk
  }
  
  return Math.round((completed / total) * 100)
})

const showMetabolicPreview = computed(() => {
  return formData.gender && formData.activity && metricMeasurements.value
})

const isFormComplete = computed(() => {
  const basicValid = formData.ageYears >= 13 && formData.ageYears <= 100 &&
                    formData.gender &&
                    formData.height.value >= 120 && formData.height.value <= 250 &&
                    formData.weight.value >= 30 && formData.weight.value <= 300 &&
                    formData.activity &&
                    formData.goalType
  
  if (!basicValid) return false
  
  // For maintain goal, no target weight needed
  if (formData.goalType === 'maintain') return true
  
  // For cut/bulk, need target weight and pace
  return formData.plan.targetWeightKg && formData.plan.paceKgPerWeek
})

// Methods
function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.ageYears || formData.ageYears < 13 || formData.ageYears > 100) {
    errors.value.age = 'Age must be between 13 and 100'
  }
  
  if (!formData.gender) {
    errors.value.gender = 'Please select your gender'
  }
  
  if (!formData.height.value || formData.height.value < 120 || formData.height.value > 250) {
    errors.value.height = 'Please enter a valid height'
  }
  
  if (!formData.weight.value || formData.weight.value < 30 || formData.weight.value > 300) {
    errors.value.weight = 'Please enter a valid weight'
  }
  
  if (!formData.activity) {
    errors.value.activity = 'Please select your activity level'
  }
  
  if (!formData.goalType) {
    errors.value.goalType = 'Please select your fitness goal'
  }
  
  if (formData.goalType && formData.goalType !== 'maintain') {
    if (!formData.plan.targetWeightKg) {
      errors.value.targetWeight = 'Please enter your target weight'
    }
    
    if (!formData.plan.paceKgPerWeek || formData.plan.paceKgPerWeek <= 0) {
      errors.value.pace = 'Please enter a valid pace'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm() || !isFormComplete.value) return
  
  isLoading.value = true
  statusMessage.value = null
  
  try {
    // Ensure all required data is present
    if (!formData.gender || !metricMeasurements.value || !formData.activity || !formData.goalType) {
      throw new Error('Missing required form data')
    }
    
    // Save physical data to store
    onboardingStore.setPhysical({
      ageYears: formData.ageYears,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight
    })
    
    // Save activity
    onboardingStore.setActivity(formData.activity)
    
    // Save body fat data with proper default
    const bodyFatData = {
      method: formData.bodyFatData.method || 'unknown',
      percent: bodyFatPercent.value || undefined
    } as BodyFatInput
    onboardingStore.setBodyFat(bodyFatData)
    
    // Save goal
    onboardingStore.setGoal(formData.goalType)
    
    // Save plan
    if (formData.goalType === 'maintain') {
      onboardingStore.setPlan({
        targetWeightKg: metricMeasurements.value.weightKg,
        paceKgPerWeek: 0,
        estimatedWeeks: 0
      })
    } else {
      if (!formData.plan.targetWeightKg || !formData.plan.paceKgPerWeek) {
        throw new Error('Missing target weight or pace for goal')
      }
      onboardingStore.setPlan({
        targetWeightKg: formData.plan.targetWeightKg,
        paceKgPerWeek: formData.plan.paceKgPerWeek,
        estimatedWeeks: timeline.value?.estimatedWeeks || Math.abs(
          (formData.plan.targetWeightKg - metricMeasurements.value.weightKg) / formData.plan.paceKgPerWeek
        )
      })
    }
    
    // Wait a tick for store to update
    await nextTick()
    
    // Complete onboarding
    const result = await onboardingStore.saveToFirestore()
    
    if (result.success) {
      statusMessage.value = {
        text: 'Setup completed successfully! Redirecting to dashboard...',
        class: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
        icon: 'i-heroicons-check-circle'
      }
      
      setTimeout(() => {
        navigateTo('/')
      }, 2000)
    } else {
      statusMessage.value = {
        text: result.error || 'Failed to save your plan. Please try again.',
        class: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
        icon: 'i-heroicons-exclamation-circle'
      }
    }
  } catch (error: any) {
    console.error('Onboarding completion error:', error)
    statusMessage.value = {
      text: error.message || 'Failed to save your plan. Please try again.',
      class: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      icon: 'i-heroicons-exclamation-circle'
    }
  } finally {
    isLoading.value = false
  }
}

function saveAndExit() {
  // Save current progress
  if (formData.gender) {
    onboardingStore.setPhysical({
      ageYears: formData.ageYears,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight
    })
  }
  if (formData.activity) onboardingStore.setActivity(formData.activity)
  if (formData.bodyFatData) onboardingStore.setBodyFat(formData.bodyFatData)
  if (formData.goalType) onboardingStore.setGoal(formData.goalType)
  
  navigateTo('/')
}

function resetForm() {
  if (confirm('Are you sure you want to reset the form? This will clear all your progress.')) {
    onboardingStore.reset()
    Object.assign(formData, {
      ageYears: 25,
      gender: null,
      height: { value: 175, unit: 'cm' },
      weight: { value: 70, unit: 'kg' },
      activity: null,
      bodyFatData: { method: 'unknown' },
      goalType: null,
      plan: {
        targetWeightKg: null,
        paceKgPerWeek: 0.5,
        estimatedWeeks: 0
      }
    })
    errors.value = {}
    statusMessage.value = null
  }
}

// Watch for target weight unit changes
watch(weightDisplayUnit, (newUnit) => {
  if (formData.plan.targetWeightKg && newUnit !== 'kg') {
    // Convert to display unit for UI
    if (newUnit === 'lb') {
      // Keep the kg value but show lb in UI
    }
  }
})

// Set page title
useHead({
  title: 'Simplified Onboarding - BeFit'
})
</script>
