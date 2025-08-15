<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="flex items-center space-x-3">
        <Icon :name="mealIcon" class="w-6 h-6 text-gray-600" />
        <h3 class="font-semibold text-gray-900">{{ timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1) }}</h3>
      </div>
      <button 
        @click="$emit('addMeal')"
        class="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
      >
        <Icon name="heroicons:plus" class="w-4 h-4" />
        <span class="text-sm font-medium">Add Meal</span>
      </button>
    </div>

    <!-- Meal Items -->
    <div class="divide-y divide-gray-100">
      <div v-if="loading" class="p-4 text-center text-gray-500">
        Loading...
      </div>
      
      <div v-else-if="meals.length === 0" class="p-4 text-center text-gray-500">
        <p class="mb-2">No meals logged</p>
        <button 
          @click="$emit('addMeal')"
          class="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Add your first {{ timeOfDay }} meal
        </button>
      </div>

      <MealItem
        v-for="meal in meals"
        :key="meal.id"
        :meal="meal"
        @edit="$emit('editMeal', meal)"
        @delete="$emit('deleteMeal', meal)"
      />
    </div>

    <!-- Summary -->
    <div v-if="meals.length > 0" class="p-4 bg-gray-50 border-t border-gray-100">
      <div class="flex justify-between text-sm">
        <span class="font-medium text-gray-900">{{ timeOfDay }} Total:</span>
        <div class="flex space-x-4 text-gray-600">
          <span>{{ totals.kcal }} kcal</span>
          <span>P: {{ totals.proteinG }}g</span>
          <span>C: {{ totals.carbsG }}g</span>
          <span>F: {{ totals.fatG }}g</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealEntry } from '~/types'

interface Props {
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  meals: MealEntry[]
  loading?: boolean
}

interface Emits {
  addMeal: []
  editMeal: [meal: MealEntry]
  deleteMeal: [meal: MealEntry]
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Computed
const mealIcon = computed(() => {
  const icons = {
    breakfast: 'heroicons:sun',
    lunch: 'heroicons:clock',
    dinner: 'heroicons:moon',
    snack: 'heroicons:heart'
  }
  return icons[props.timeOfDay]
})

const totals = computed(() => {
  return props.meals.reduce((acc, meal) => ({
    kcal: acc.kcal + meal.totals.kcal,
    proteinG: acc.proteinG + meal.totals.proteinG,
    carbsG: acc.carbsG + meal.totals.carbsG,
    fatG: acc.fatG + meal.totals.fatG
  }), { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })
})
</script>