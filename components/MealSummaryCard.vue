<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full" :class="timeOfDayColor"></div>
        <h3 class="font-medium text-gray-900 dark:text-white capitalize">
          {{ meal.timeOfDay }}
        </h3>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ formatTime(meal.createdAt) }}
      </p>
    </div>

    <div v-if="meal.items.length > 0" class="mb-3">
      <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
        {{ meal.items.map(item => `${item.name}${item.brand ? ` (${item.brand})` : ''}`).join(', ') }}
      </p>
    </div>

    <div class="grid grid-cols-4 gap-2 text-center">
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Calories</p>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ Math.round(meal.totals.kcal) }}
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Protein</p>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ Math.round(meal.totals.protein) }}g
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ Math.round(meal.totals.carbs) }}g
        </p>
      </div>
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Fat</p>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ Math.round(meal.totals.fat) }}g
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { MealEntry } from '~/types'

interface Props {
  meal: MealEntry
}

const props = defineProps<Props>()

const timeOfDayColor = computed(() => {
  switch (props.meal.timeOfDay) {
    case 'breakfast':
      return 'bg-yellow-400'
    case 'lunch': 
      return 'bg-orange-400'
    case 'dinner':
      return 'bg-red-400'
    case 'snack':
      return 'bg-green-400'
    default:
      return 'bg-gray-400'
  }
})

const formatTime = (timestamp: any) => {
  if (!timestamp) return ''
  
  try {
    // Handle Firestore Timestamp objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, 'HH:mm')
  } catch (error) {
    return ''
  }
}
</script>