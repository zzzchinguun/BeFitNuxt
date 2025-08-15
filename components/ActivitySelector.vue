<template>
  <div class="space-y-4">
    <div v-if="label" class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ label }}
      </h3>
      <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
    
    <div class="grid gap-3">
      <button
        v-for="option in activityOptions"
        :key="option.value"
        @click="$emit('update:modelValue', option.value)"
        class="p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md"
        :class="{
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': modelValue === option.value,
          'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500': modelValue !== option.value
        }"
      >
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 mt-1">
            <UIcon
              :name="option.icon"
              class="w-5 h-5"
              :class="{
                'text-blue-600': modelValue === option.value,
                'text-gray-400': modelValue !== option.value
              }"
            />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-medium"
                :class="{
                  'text-blue-900 dark:text-blue-100': modelValue === option.value,
                  'text-gray-900 dark:text-white': modelValue !== option.value
                }"
              >
                {{ option.label }}
              </h4>
              <span class="text-sm font-mono"
                :class="{
                  'text-blue-600 dark:text-blue-400': modelValue === option.value,
                  'text-gray-500 dark:text-gray-400': modelValue !== option.value
                }"
              >
                {{ option.multiplier }}x
              </span>
            </div>
            
            <p class="text-sm mt-1"
              :class="{
                'text-blue-700 dark:text-blue-300': modelValue === option.value,
                'text-gray-600 dark:text-gray-400': modelValue !== option.value
              }"
            >
              {{ option.description }}
            </p>
            
            <p v-if="option.examples" class="text-xs mt-2"
              :class="{
                'text-blue-600 dark:text-blue-400': modelValue === option.value,
                'text-gray-500 dark:text-gray-500': modelValue !== option.value
              }"
            >
              <strong>Examples:</strong> {{ option.examples }}
            </p>
          </div>
        </div>
      </button>
    </div>
    
    <div v-if="error" class="text-sm text-red-600 dark:text-red-400 text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLevel } from '~/types'

interface ActivityOption {
  value: ActivityLevel
  label: string
  description: string
  examples: string
  multiplier: string
  icon: string
}

interface Props {
  modelValue: ActivityLevel | null
  label?: string
  description?: string
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: ActivityLevel): void
}

defineProps<Props>()
defineEmits<Emits>()


const activityOptions: ActivityOption[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise, desk job',
    examples: 'Office work, studying, watching TV',
    multiplier: '1.2',
    icon: 'i-heroicons-tv'
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days per week',
    examples: 'Light jogging, walking, light sports',
    multiplier: '1.375',
    icon: 'i-heroicons-walk'
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days per week',
    examples: 'Regular gym sessions, sports, dancing',
    multiplier: '1.55',
    icon: 'i-heroicons-running'
  },
  {
    value: 'very',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days per week',
    examples: 'Daily workouts, intense sports, physical job',
    multiplier: '1.725',
    icon: 'i-heroicons-bolt'
  },
  {
    value: 'extra',
    label: 'Extremely Active',
    description: 'Very hard exercise, physical job + training',
    examples: 'Athlete training, construction work + gym',
    multiplier: '1.9',
    icon: 'i-heroicons-fire'
  }
]
</script>