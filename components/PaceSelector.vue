<template>
  <div class="space-y-6">
    <div v-if="label" class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ label }}
      </h3>
      <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
    
    <!-- Target weight input -->
    <div class="space-y-4">
      <UFormGroup label="Target Weight" name="targetWeight">
        <UInput
          :model-value="targetWeight ?? undefined"
          @update:model-value="updateTargetWeight"
          type="number"
          min="30"
          max="300"
          step="0.1"
          placeholder="Enter your target weight"
          size="lg"
        >
          <template #trailing>
            <span class="text-gray-500 dark:text-gray-400">{{ weightUnit }}</span>
          </template>
        </UInput>
      </UFormGroup>
      
      <div v-if="weightDelta" class="text-sm text-gray-600 dark:text-gray-400">
        {{ weightDeltaText }}
      </div>
    </div>
    
    <!-- Pace selection -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Weight Change Rate
        </label>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ pace }} kg/week
        </div>
      </div>
      
      <!-- Pace slider -->
      <div class="px-2">
        <input
          :value="pace"
          @input="updatePace(Number(($event.target as HTMLInputElement).value))"
          type="range"
          :min="paceRange.min"
          :max="paceRange.max"
          :step="0.125"
          class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Slower</span>
          <span>Faster</span>
        </div>
      </div>
      
      <!-- Preset pace options -->
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="preset in pacePresets"
          :key="preset.value"
          @click="updatePace(preset.value)"
          class="p-3 rounded-lg border text-center transition-all duration-200"
          :class="{
            'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300': Math.abs(pace - preset.value) < 0.01,
            'border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:border-gray-300': Math.abs(pace - preset.value) >= 0.01
          }"
        >
          <div class="text-sm font-medium">{{ preset.label }}</div>
          <div class="text-xs">{{ preset.value }} kg/wk</div>
        </button>
      </div>
    </div>
    
    <!-- Timeline estimation -->
    <div v-if="timeline" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h5 class="font-medium text-gray-900 dark:text-white mb-3">
        Timeline Estimate
      </h5>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-gray-500" />
          <span>{{ timeline.weeks }} weeks</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-flag" class="w-4 h-4 text-gray-500" />
          <span>{{ timeline.finishDate }}</span>
        </div>
      </div>
      
      <div v-if="timeline.monthlyMilestones" class="mt-4">
        <h6 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monthly Milestones
        </h6>
        <div class="space-y-1">
          <div
            v-for="milestone in timeline.monthlyMilestones"
            :key="milestone.month"
            class="flex justify-between text-xs text-gray-600 dark:text-gray-400"
          >
            <span>{{ milestone.month }}</span>
            <span>{{ milestone.weight }}{{ weightUnit }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Safety warnings -->
    <div v-if="safetyWarning" class="p-4 rounded-lg" :class="safetyWarning.class">
      <div class="flex items-start space-x-2">
        <UIcon :name="safetyWarning.icon" class="w-4 h-4 mt-0.5" />
        <div class="text-sm">
          <div class="font-medium">{{ safetyWarning.title }}</div>
          <div class="mt-1">{{ safetyWarning.message }}</div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="text-sm text-red-600 dark:text-red-400 text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GoalType } from '~/types'

interface Props {
  goalType: GoalType
  currentWeightKg: number
  targetWeightKg?: number
  pace?: number
  weightUnit?: 'kg' | 'lb'
  label?: string
  description?: string
  error?: string
}

interface Emits {
  (e: 'update:targetWeight', value: number): void
  (e: 'update:pace', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  pace: 0.5,
  weightUnit: 'kg'
})

const emits = defineEmits<Emits>()


// Convert target weight for display
const targetWeight = computed({
  get: () => {
    if (!props.targetWeightKg) return null
    return props.weightUnit === 'lb' 
      ? Math.round(props.targetWeightKg * 2.20462 * 10) / 10
      : props.targetWeightKg
  },
  set: (value: number | null) => {
    if (!value) return
    const kgValue = props.weightUnit === 'lb' ? value / 2.20462 : value
    emits('update:targetWeight', kgValue)
  }
})

const pace = computed({
  get: () => props.pace || 0,
  set: (value: number) => emits('update:pace', value)
})

// Get pace range based on goal type
const paceRange = computed(() => {
  const { getRecommendedPaceRange } = useOnboardingUtils()
  return getRecommendedPaceRange(props.goalType)
})

// Pace presets based on goal
const pacePresets = computed(() => {
  switch (props.goalType) {
    case 'cut':
      return [
        { label: 'Conservative', value: 0.25 },
        { label: 'Moderate', value: 0.5 },
        { label: 'Aggressive', value: 0.75 }
      ]
    case 'bulk':
      return [
        { label: 'Lean Gains', value: 0.125 },
        { label: 'Moderate', value: 0.25 },
        { label: 'Fast Gains', value: 0.4 }
      ]
    case 'maintain':
      return [
        { label: 'Maintain', value: 0 }
      ]
    default:
      return []
  }
})

// Weight delta calculation
const weightDelta = computed(() => {
  if (!props.targetWeightKg) return null
  return props.targetWeightKg - props.currentWeightKg
})

const weightDeltaText = computed(() => {
  if (!weightDelta.value) return ''
  
  const absChange = Math.abs(weightDelta.value)
  const displayChange = props.weightUnit === 'lb' 
    ? Math.round(absChange * 2.20462 * 10) / 10
    : Math.round(absChange * 10) / 10
  
  const direction = weightDelta.value > 0 
    ? 'Gain'
    : 'Lose'
  
  return `${direction} ${displayChange}${props.weightUnit}`
})

// Timeline calculation
const timeline = computed(() => {
  if (!props.targetWeightKg || !pace.value || pace.value === 0) return null
  
  const weeks = Math.abs(weightDelta.value!) / pace.value
  const finishDate = new Date()
  finishDate.setDate(finishDate.getDate() + (weeks * 7))
  
  // Generate monthly milestones
  const monthlyMilestones = []
  for (let month = 1; month <= Math.min(12, Math.ceil(weeks / 4)); month++) {
    const monthlyChange = pace.value * 4 * month * (weightDelta.value! > 0 ? 1 : -1)
    const milestoneWeight = props.currentWeightKg + monthlyChange
    const displayWeight = props.weightUnit === 'lb'
      ? Math.round(milestoneWeight * 2.20462 * 10) / 10
      : Math.round(milestoneWeight * 10) / 10
    
    monthlyMilestones.push({
      month: `Month ${month}`,
      weight: displayWeight
    })
  }
  
  return {
    weeks: Math.round(weeks),
    finishDate: finishDate.toLocaleDateString(),
    monthlyMilestones
  }
})

// Safety validation
const safetyWarning = computed(() => {
  if (!pace.value) return null
  
  const { validateSafePace } = useOnboardingUtils()
  const validation = validateSafePace(pace.value, props.goalType)
  
  if (!validation.isValid) {
    return {
      title: 'Unsafe Pace',
      message: validation.message,
      icon: 'i-heroicons-exclamation-triangle',
      class: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    }
  }
  
  // Aggressive pace warning
  if (props.goalType === 'cut' && pace.value > 0.75) {
    return {
      title: 'Aggressive Pace',
      message: 'This pace may be challenging to maintain and could lead to muscle loss',
      icon: 'i-heroicons-exclamation-triangle',
      class: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    }
  }
  
  if (props.goalType === 'bulk' && pace.value > 0.35) {
    return {
      title: 'Fast Bulk Warning',
      message: 'This pace may lead to excessive fat gain alongside muscle growth',
      icon: 'i-heroicons-exclamation-triangle',
      class: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    }
  }
  
  return null
})

function updateTargetWeight(value: number | null) {
  if (!value) return
  targetWeight.value = value
}

function updatePace(value: number) {
  pace.value = Math.max(paceRange.value.min, Math.min(paceRange.value.max, value))
}

// Utility composable
function useOnboardingUtils() {
  return {
    getRecommendedPaceRange: (goalType: GoalType) => {
      switch (goalType) {
        case 'cut':
          return { min: 0.25, max: 1.0, default: 0.5 }
        case 'bulk':
          return { min: 0.125, max: 0.5, default: 0.25 }
        case 'maintain':
          return { min: 0, max: 0, default: 0 }
      }
    },
    validateSafePace: (pace: number, goalType: GoalType) => {
      const range = useOnboardingUtils().getRecommendedPaceRange(goalType)
      if (pace < range.min || pace > range.max) {
        return { 
          isValid: false, 
          message: `Safe range: ${range.min}-${range.max} kg/week` 
        }
      }
      return { isValid: true }
    }
  }
}
</script>