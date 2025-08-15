<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader title="Meals" />
    
    <!-- Date Navigation -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <button @click="previousDay" class="p-2 text-gray-600 hover:text-gray-900">
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>
        <h2 class="font-semibold text-gray-900">{{ formatDate(selectedDate) }}</h2>
        <button @click="nextDay" class="p-2 text-gray-600 hover:text-gray-900" :disabled="!canGoToNextDay">
          <Icon name="heroicons:chevron-right" class="w-5 h-5" :class="{ 'opacity-50': !canGoToNextDay }" />
        </button>
      </div>
    </div>

    <!-- Daily Summary -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ dailyTotals.kcal }}</div>
          <div class="text-sm text-gray-600">Calories</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ dailyTotals.proteinG }}g</div>
          <div class="text-sm text-gray-600">Protein</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ dailyTotals.carbsG }}g</div>
          <div class="text-sm text-gray-600">Carbs</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-yellow-600">{{ dailyTotals.fatG }}g</div>
          <div class="text-sm text-gray-600">Fat</div>
        </div>
      </div>
    </div>

    <!-- Meal Sections -->
    <div class="space-y-4 p-4">
      <MealSection
        v-for="timeOfDay in mealTimes"
        :key="timeOfDay"
        :time-of-day="timeOfDay"
        :meals="getMealsForTime(timeOfDay)"
        :loading="loading"
        @add-meal="openAddMeal(timeOfDay)"
        @edit-meal="editMeal"
        @delete-meal="deleteMeal"
      />
    </div>

    <!-- Add Meal Modal -->
    <AddMealModal
      v-if="showAddModal"
      :time-of-day="selectedTimeOfDay"
      :date="selectedDate"
      @close="closeAddMeal"
      @meal-added="onMealAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { format, addDays, subDays, isToday, isFuture } from 'date-fns'
import type { MealEntry } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const mealsStore = useMealsStore()

// State
const selectedDate = ref(new Date())
const showAddModal = ref(false)
const selectedTimeOfDay = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
const loading = ref(false)

// Computed
const dailyTotals = computed(() => mealsStore.getDailyTotals(format(selectedDate.value, 'yyyy-MM-dd')))
const canGoToNextDay = computed(() => !isFuture(addDays(selectedDate.value, 1)))

const mealTimes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack']

// Methods
function formatDate(date: Date) {
  if (isToday(date)) return 'Today'
  return format(date, 'EEEE, MMM d')
}

function previousDay() {
  selectedDate.value = subDays(selectedDate.value, 1)
}

function nextDay() {
  if (!canGoToNextDay.value) return
  selectedDate.value = addDays(selectedDate.value, 1)
}

function getMealsForTime(timeOfDay: string) {
  const dateStr = format(selectedDate.value, 'yyyy-MM-dd')
  return mealsStore.getMealsForDate(dateStr).filter(meal => meal.timeOfDay === timeOfDay)
}

function openAddMeal(timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
  selectedTimeOfDay.value = timeOfDay
  showAddModal.value = true
}

function closeAddMeal() {
  showAddModal.value = false
}

function onMealAdded() {
  showAddModal.value = false
  // Refresh meals for the selected date
  loadMealsForDate()
}

function editMeal(meal: MealEntry) {
  // Navigate to edit meal page
  navigateTo(`/meals/edit/${meal.id}`)
}

async function deleteMeal(meal: MealEntry) {
  if (confirm('Are you sure you want to delete this meal?')) {
    try {
      await mealsStore.deleteMeal(meal.id)
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  }
}

async function loadMealsForDate() {
  loading.value = true
  try {
    const dateStr = format(selectedDate.value, 'yyyy-MM-dd')
    await mealsStore.loadMealsForDate(dateStr)
  } catch (error) {
    console.error('Error loading meals:', error)
  } finally {
    loading.value = false
  }
}

// Watch date changes to load meals
watch(selectedDate, loadMealsForDate, { immediate: true })

// SEO
useHead({
  title: 'Meals - BeFit'
})
</script>