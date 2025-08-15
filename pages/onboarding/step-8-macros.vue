<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-4xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="8" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Macro Plan
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Here's your personalized macro breakdown to reach your goals
        </p>
      </div>

      <!-- Macro Breakdown Component -->
      <MacroBreakdown
        v-if="finalMacros"
        :macros="finalMacros"
        :tdee="tdee"
        :goal-type="goalType"
        :weight-kg="currentWeight"
        :allow-adjustments="true"
        :show-meal-timing="showMealTiming"
        @update:macros="updateMacros"
      />

      <!-- Macro explanation -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white text-center mb-6">
          Understanding Your Macros
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Protein -->
          <div class="text-center space-y-3">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto">
              <UIcon name="i-heroicons-fire" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h4 class="font-semibold text-red-900 dark:text-red-100">
              Protein
            </h4>
            <p class="text-sm text-red-800 dark:text-red-200">
              Essential for muscle growth, repair, and maintenance. Helps you feel full.
            </p>
            <div class="text-xs text-red-600 dark:text-red-400">
              <strong>Sources:</strong>
              Chicken, fish, eggs, Greek yogurt, protein powder, tofu
            </div>
          </div>
          
          <!-- Carbs -->
          <div class="text-center space-y-3">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
              <UIcon name="i-heroicons-battery-100" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 class="font-semibold text-green-900 dark:text-green-100">
              Carbohydrates
            </h4>
            <p class="text-sm text-green-800 dark:text-green-200">
              Your body's preferred energy source for workouts and brain function.
            </p>
            <div class="text-xs text-green-600 dark:text-green-400">
              <strong>Sources:</strong>
              Rice, oats, potatoes, fruits, vegetables, whole grains
            </div>
          </div>
          
          <!-- Fat -->
          <div class="text-center space-y-3">
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto">
              <UIcon name="i-heroicons-heart" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h4 class="font-semibold text-yellow-900 dark:text-yellow-100">
              Fats
            </h4>
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              Important for hormone production, nutrient absorption, and satiety.
            </p>
            <div class="text-xs text-yellow-600 dark:text-yellow-400">
              <strong>Sources:</strong>
              Nuts, avocados, olive oil, fish, seeds, nut butters
            </div>
          </div>
        </div>
      </div>

      <!-- Quick tips -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
          <div class="flex-1">
            <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Quick Tips
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div v-for="tip in macroTips" :key="tip" class="flex items-start space-x-2">
                <UIcon name="i-heroicons-check" class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <span>{{ tip }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced options toggle -->
      <div class="text-center">
        <UButton
          variant="ghost"
          @click="toggleAdvancedOptions"
          class="text-sm"
        >
          {{ showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options' }}
          <UIcon 
            :name="showAdvanced ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
            class="w-4 h-4 ml-1" 
          />
        </UButton>
      </div>

      <!-- Advanced options -->
      <div v-if="showAdvanced" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-4">
          Advanced Options
        </h4>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm text-gray-700 dark:text-gray-300">
              Enable meal timing suggestions
            </label>
            <UToggle v-model="showMealTiming" />
          </div>
          
          <div class="text-xs text-gray-600 dark:text-gray-400">
            Get recommendations for when to eat your meals based on your goals
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
          @click="handleNext"
          size="lg"
          class="px-8"
        >
          Finalize My Plan
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MacroGoals } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Local state
const showAdvanced = ref(false)
const showMealTiming = ref(false)
const customMacros = ref<MacroGoals | null>(null)

// Get data from store
const goalType = computed(() => onboardingStore.goalType)
const tdee = computed(() => onboardingStore.tdee)
const finalMacros = computed(() => customMacros.value || onboardingStore.finalMacros)

const currentWeight = computed(() => {
  if (!onboardingStore.metricPhysical) return 70
  return onboardingStore.metricPhysical.weightKg
})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  onboardingStore.computeAll()
})

// Macro tips based on goal
const macroTips = computed(() => {
  const commonTips = [
    'Track your food for the first few weeks to learn portion sizes',
    'Focus on whole foods and adequate hydration'
  ]
  
  if (!goalType.value) return commonTips
  
  switch (goalType.value) {
    case 'cut':
      return [
        ...commonTips,
        'Prioritize protein to maintain muscle during weight loss',
        'Time your carbs around workouts for better energy'
      ]
    case 'bulk':
      return [
        ...commonTips,
        'Don\'t be afraid of carbs - they fuel muscle growth',
        'Spread protein intake throughout the day'
      ]
    case 'maintain':
      return [
        ...commonTips,
        'Flexible approach - 80/20 rule works well for maintenance',
        'Listen to your hunger cues and adjust as needed'
      ]
    default:
      return commonTips
  }
})

function toggleAdvancedOptions() {
  showAdvanced.value = !showAdvanced.value
}

function updateMacros(macros: MacroGoals) {
  customMacros.value = macros
}

function handleNext() {
  // Save final macro configuration
  if (customMacros.value) {
    onboardingStore.updateFormData({
      macros: customMacros.value
    })
  } else {
    onboardingStore.computeAll()
  }

  onboardingStore.nextStep()
  navigateTo('/onboarding/summary')
}

function handlePrevious() {
  onboardingStore.previousStep()
  navigateTo('/onboarding/step-7-timeline-preview')
}

function saveAndExit() {
  if (customMacros.value) {
    onboardingStore.updateFormData({
      macros: customMacros.value
    })
  } else {
    onboardingStore.computeAll()
  }
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Macro Plan - BeFit Onboarding'
})
</script>