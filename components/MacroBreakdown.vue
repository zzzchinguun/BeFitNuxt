<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Your Daily Macro Targets
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Personalized nutrition goals to help you reach your fitness objectives.
      </p>
    </div>
    
    <!-- Calorie target -->
    <div class="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
        {{ macros.kcal }}
      </div>
      <div class="text-sm text-blue-800 dark:text-blue-200">
        Daily Calories
      </div>
      <div v-if="calorieAdjustment" class="text-xs text-blue-600 dark:text-blue-400 mt-1">
        {{ calorieAdjustmentText }}
      </div>
    </div>
    
    <!-- Macro distribution -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Protein -->
      <div class="text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ macros.proteinG }}g
        </div>
        <div class="text-sm text-red-800 dark:text-red-200 mb-1">
          Protein
        </div>
        <div class="text-xs text-red-600 dark:text-red-400">
          {{ proteinPercentage }}% • {{ proteinCalories }} kcal
        </div>
      </div>
      
      <!-- Carbs -->
      <div class="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ macros.carbsG }}g
        </div>
        <div class="text-sm text-green-800 dark:text-green-200 mb-1">
          Carbs
        </div>
        <div class="text-xs text-green-600 dark:text-green-400">
          {{ carbsPercentage }}% • {{ carbsCalories }} kcal
        </div>
      </div>
      
      <!-- Fat -->
      <div class="text-center bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ macros.fatG }}g
        </div>
        <div class="text-sm text-yellow-800 dark:text-yellow-200 mb-1">
          Fat
        </div>
        <div class="text-xs text-yellow-600 dark:text-yellow-400">
          {{ fatPercentage }}% • {{ fatCalories }} kcal
        </div>
      </div>
    </div>
    
    <!-- Visual macro distribution -->
    <div class="space-y-3">
      <h4 class="font-semibold text-gray-900 dark:text-white text-center">
        Macro Distribution
      </h4>
      
      <div class="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="absolute left-0 top-0 h-full bg-red-500 transition-all duration-500"
          :style="{ width: `${proteinPercentage}%` }"
        ></div>
        <div 
          class="absolute top-0 h-full bg-green-500 transition-all duration-500"
          :style="{ 
            left: `${proteinPercentage}%`, 
            width: `${carbsPercentage}%` 
          }"
        ></div>
        <div 
          class="absolute top-0 h-full bg-yellow-500 transition-all duration-500"
          :style="{ 
            left: `${proteinPercentage + carbsPercentage}%`, 
            width: `${fatPercentage}%` 
          }"
        ></div>
      </div>
      
      <div class="flex justify-center space-x-4 text-xs">
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-red-500 rounded"></div>
          <span>Protein</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-green-500 rounded"></div>
          <span>Carbs</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Fat</span>
        </div>
      </div>
    </div>
    
    <!-- Interactive adjustment sliders (if enabled) -->
    <div v-if="allowAdjustments" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="font-semibold text-gray-900 dark:text-white">
          Adjust Macros
        </h4>
        <UButton
          variant="ghost"
          size="sm"
          @click="resetToRecommended"
        >
          Reset
        </UButton>
      </div>
      
      <!-- Protein slider -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <label class="text-gray-700 dark:text-gray-300">
            Protein
          </label>
          <span class="text-gray-600 dark:text-gray-400">
            {{ adjustedMacros.proteinG }}g ({{ adjustedProteinPercentage }}%)
          </span>
        </div>
        <input
          v-model.number="adjustedMacros.proteinG"
          @input="recalculateFromProtein"
          type="range"
          :min="proteinRange.min"
          :max="proteinRange.max"
          :step="5"
          class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <!-- Fat slider -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <label class="text-gray-700 dark:text-gray-300">
            Fat
          </label>
          <span class="text-gray-600 dark:text-gray-400">
            {{ adjustedMacros.fatG }}g ({{ adjustedFatPercentage }}%)
          </span>
        </div>
        <input
          v-model.number="adjustedMacros.fatG"
          @input="recalculateFromFat"
          type="range"
          :min="fatRange.min"
          :max="fatRange.max"
          :step="5"
          class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <!-- Carbs (auto-calculated) -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <label class="text-gray-700 dark:text-gray-300">
            Carbs (Remaining)
          </label>
          <span class="text-gray-600 dark:text-gray-400">
            {{ adjustedMacros.carbsG }}g ({{ adjustedCarbsPercentage }}%)
          </span>
        </div>
        <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <div 
            class="h-full bg-green-500 rounded-lg transition-all duration-300"
            :style="{ width: `${adjustedCarbsPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Additional recommendations -->
    <div class="space-y-3">
      <h4 class="font-semibold text-gray-900 dark:text-white">
        Daily Recommendations
      </h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div class="flex items-center space-x-2 mb-1">
            <UIcon name="i-heroicons-droplet" class="w-4 h-4 text-blue-600" />
            <span class="font-medium text-blue-800 dark:text-blue-200">
              Water Intake
            </span>
          </div>
          <div class="text-blue-700 dark:text-blue-300">
            {{ waterRecommendation }}L per day
          </div>
        </div>
        
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div class="flex items-center space-x-2 mb-1">
            <UIcon name="i-heroicons-leaf" class="w-4 h-4 text-green-600" />
            <span class="font-medium text-green-800 dark:text-green-200">
              Fiber Goal
            </span>
          </div>
          <div class="text-green-700 dark:text-green-300">
            {{ fiberRecommendation }}g minimum
          </div>
        </div>
      </div>
    </div>
    
    <!-- Meal timing suggestions -->
    <div v-if="showMealTiming" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <h5 class="font-medium text-gray-900 dark:text-white mb-3">
        Suggested Meal Distribution
      </h5>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div v-for="meal in mealDistribution" :key="meal.name" class="text-center">
          <div class="font-medium text-gray-900 dark:text-white">{{ meal.name }}</div>
          <div class="text-gray-600 dark:text-gray-400">{{ meal.calories }} kcal</div>
          <div class="text-gray-500 dark:text-gray-500">
            {{ meal.protein }}p / {{ meal.carbs }}c / {{ meal.fat }}f
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MacroGoals } from '~/types'

interface Props {
  macros: MacroGoals
  tdee?: number
  goalType?: 'cut' | 'bulk' | 'maintain'
  weightKg?: number
  allowAdjustments?: boolean
  showMealTiming?: boolean
}

interface Emits {
  (e: 'update:macros', value: MacroGoals): void
}

const props = withDefaults(defineProps<Props>(), {
  allowAdjustments: true,
  showMealTiming: false
})

const emits = defineEmits<Emits>()


// Create reactive copy for adjustments
const adjustedMacros = ref<MacroGoals>({ ...props.macros })

// Computed values for original macros
const proteinCalories = computed(() => props.macros.proteinG * 4)
const carbsCalories = computed(() => props.macros.carbsG * 4)
const fatCalories = computed(() => props.macros.fatG * 9)
const totalCalories = computed(() => proteinCalories.value + carbsCalories.value + fatCalories.value)

const proteinPercentage = computed(() => Math.round((proteinCalories.value / props.macros.kcal) * 100))
const carbsPercentage = computed(() => Math.round((carbsCalories.value / props.macros.kcal) * 100))
const fatPercentage = computed(() => Math.round((fatCalories.value / props.macros.kcal) * 100))

// Computed values for adjusted macros
const adjustedProteinCalories = computed(() => adjustedMacros.value.proteinG * 4)
const adjustedFatCalories = computed(() => adjustedMacros.value.fatG * 9)
const adjustedCarbsCalories = computed(() => props.macros.kcal - adjustedProteinCalories.value - adjustedFatCalories.value)

const adjustedProteinPercentage = computed(() => Math.round((adjustedProteinCalories.value / props.macros.kcal) * 100))
const adjustedFatPercentage = computed(() => Math.round((adjustedFatCalories.value / props.macros.kcal) * 100))
const adjustedCarbsPercentage = computed(() => Math.round((adjustedCarbsCalories.value / props.macros.kcal) * 100))

// Adjustment ranges
const proteinRange = computed(() => {
  const minProtein = props.weightKg ? props.weightKg * 1.6 : props.macros.proteinG * 0.8
  const maxProtein = props.weightKg ? props.weightKg * 2.6 : props.macros.proteinG * 1.3
  return {
    min: Math.round(minProtein / 5) * 5,
    max: Math.round(maxProtein / 5) * 5
  }
})

const fatRange = computed(() => {
  const minFat = Math.max((props.macros.kcal * 0.15) / 9, props.weightKg ? props.weightKg * 0.6 : 50)
  const maxFat = Math.min((props.macros.kcal * 0.4) / 9, props.weightKg ? props.weightKg * 1.2 : 120)
  return {
    min: Math.round(minFat / 5) * 5,
    max: Math.round(maxFat / 5) * 5
  }
})

// Additional recommendations
const waterRecommendation = computed(() => {
  if (!props.weightKg) return '2.5'
  return ((props.weightKg * 35) / 1000).toFixed(1)
})

const fiberRecommendation = computed(() => {
  return Math.round((props.macros.kcal / 1000) * 14)
})

// Calorie adjustment info
const calorieAdjustment = computed(() => {
  if (!props.tdee || !props.goalType) return null
  
  const difference = props.macros.kcal - props.tdee
  return {
    amount: Math.abs(difference),
    type: difference > 0 ? 'surplus' : difference < 0 ? 'deficit' : 'maintenance'
  }
})

const calorieAdjustmentText = computed(() => {
  if (!calorieAdjustment.value || calorieAdjustment.value.type === 'maintenance') return ''
  
  const { amount, type } = calorieAdjustment.value
  return type === 'surplus' 
    ? `+${amount} calories above maintenance`
    : `-${amount} calories below maintenance`
})

// Meal distribution (simplified)
const mealDistribution = computed(() => {
  const breakfast = Math.round(props.macros.kcal * 0.25)
  const lunch = Math.round(props.macros.kcal * 0.35)
  const dinner = Math.round(props.macros.kcal * 0.3)
  const snacks = props.macros.kcal - breakfast - lunch - dinner
  
  return [
    {
      name: 'Breakfast',
      calories: breakfast,
      protein: Math.round(props.macros.proteinG * 0.25),
      carbs: Math.round(props.macros.carbsG * 0.3),
      fat: Math.round(props.macros.fatG * 0.2)
    },
    {
      name: 'Lunch',
      calories: lunch,
      protein: Math.round(props.macros.proteinG * 0.35),
      carbs: Math.round(props.macros.carbsG * 0.4),
      fat: Math.round(props.macros.fatG * 0.35)
    },
    {
      name: 'Dinner',
      calories: dinner,
      protein: Math.round(props.macros.proteinG * 0.3),
      carbs: Math.round(props.macros.carbsG * 0.25),
      fat: Math.round(props.macros.fatG * 0.35)
    },
    {
      name: 'Snacks',
      calories: snacks,
      protein: Math.round(props.macros.proteinG * 0.1),
      carbs: Math.round(props.macros.carbsG * 0.05),
      fat: Math.round(props.macros.fatG * 0.1)
    }
  ]
})

// Functions for adjustments
function recalculateFromProtein() {
  const remainingCalories = props.macros.kcal - (adjustedMacros.value.proteinG * 4) - (adjustedMacros.value.fatG * 9)
  adjustedMacros.value.carbsG = Math.max(0, Math.round(remainingCalories / 4 / 5) * 5)
  emitAdjustedMacros()
}

function recalculateFromFat() {
  const remainingCalories = props.macros.kcal - (adjustedMacros.value.proteinG * 4) - (adjustedMacros.value.fatG * 9)
  adjustedMacros.value.carbsG = Math.max(0, Math.round(remainingCalories / 4 / 5) * 5)
  emitAdjustedMacros()
}

function resetToRecommended() {
  adjustedMacros.value = { ...props.macros }
  emitAdjustedMacros()
}

function emitAdjustedMacros() {
  emits('update:macros', { ...adjustedMacros.value })
}

// Watch for prop changes
watch(() => props.macros, (newMacros) => {
  adjustedMacros.value = { ...newMacros }
}, { deep: true })
</script>