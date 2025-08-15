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
    
    <div class="grid gap-4">
      <button
        v-for="goal in goalOptions"
        :key="goal.value"
        @click="$emit('update:modelValue', goal.value)"
        class="p-6 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-lg"
        :class="{
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105': modelValue === goal.value,
          'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500': modelValue !== goal.value
        }"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="{
                'bg-blue-100 dark:bg-blue-800': modelValue === goal.value,
                'bg-gray-100 dark:bg-gray-600': modelValue !== goal.value
              }"
            >
              <UIcon
                :name="goal.icon"
                class="w-6 h-6"
                :class="{
                  'text-blue-600 dark:text-blue-400': modelValue === goal.value,
                  'text-gray-500 dark:text-gray-400': modelValue !== goal.value
                }"
              />
            </div>
          </div>
          
          <div class="flex-1">
            <h4 class="text-lg font-semibold mb-2"
              :class="{
                'text-blue-900 dark:text-blue-100': modelValue === goal.value,
                'text-gray-900 dark:text-white': modelValue !== goal.value
              }"
            >
              {{ goal.label }}
            </h4>
            
            <p class="text-sm mb-3"
              :class="{
                'text-blue-700 dark:text-blue-300': modelValue === goal.value,
                'text-gray-600 dark:text-gray-400': modelValue !== goal.value
              }"
            >
              {{ goal.description }}
            </p>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-target" class="w-4 h-4" />
                <span>{{ goal.purpose }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                <span>{{ goal.timeline }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-scale" class="w-4 h-4" />
                <span>{{ goal.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
    
    <!-- Additional info for selected goal -->
    <div v-if="selectedGoalInfo" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h5 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
        Your Goal Details
      </h5>
      
      <div class="space-y-2 text-sm text-blue-800 dark:text-blue-200">
        <div class="flex items-start space-x-2">
          <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 mt-0.5" />
          <div>
            <strong>Strategy:</strong> {{ selectedGoalInfo.strategy }}
          </div>
        </div>
        
        <div class="flex items-start space-x-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 mt-0.5" />
          <div>
            <strong>Considerations:</strong> {{ selectedGoalInfo.considerations }}
          </div>
        </div>
        
        <div class="flex items-start space-x-2">
          <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 mt-0.5" />
          <div>
            <strong>Expectations:</strong> {{ selectedGoalInfo.expectations }}
          </div>
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

interface GoalOption {
  value: GoalType
  label: string
  description: string
  purpose: string
  timeline: string
  difficulty: string
  icon: string
  strategy: string
  considerations: string
  expectations: string
}

interface Props {
  modelValue: GoalType | null
  label?: string
  description?: string
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: GoalType): void
}

const { modelValue } = defineProps<Props>()
defineEmits<Emits>()


const goalOptions: GoalOption[] = [
  {
    value: 'cut',
    label: 'Lose Weight (Cut)',
    description: 'Reduce body fat while preserving muscle mass',
    purpose: 'Fat Loss',
    timeline: '3-6 months',
    difficulty: 'Moderate',
    icon: 'i-heroicons-arrow-trending-down',
    strategy: 'Create a moderate caloric deficit through diet and exercise',
    considerations: 'May require patience as progress can be non-linear',
    expectations: 'Steady fat loss with muscle preservation when done properly'
  },
  {
    value: 'maintain',
    label: 'Maintain Weight',
    description: 'Stay at your current weight and body composition',
    purpose: 'Maintenance',
    timeline: 'Ongoing',
    difficulty: 'Easy',
    icon: 'i-heroicons-minus',
    strategy: 'Eat at maintenance calories while staying active',
    considerations: 'Focus on consistent habits and lifestyle balance',
    expectations: 'Stable weight with potential body recomposition over time'
  },
  {
    value: 'bulk',
    label: 'Gain Weight (Bulk)',
    description: 'Build muscle mass and increase overall body weight',
    purpose: 'Muscle Growth',
    timeline: '4-8 months',
    difficulty: 'Moderate',
    icon: 'i-heroicons-arrow-trending-up',
    strategy: 'Maintain a controlled caloric surplus with adequate protein',
    considerations: 'Some fat gain is normal and expected during this phase',
    expectations: 'Steady muscle and weight gain with proper training'
  }
]

const selectedGoalInfo = computed(() => {
  return goalOptions.find(goal => goal.value === modelValue)
})
</script>