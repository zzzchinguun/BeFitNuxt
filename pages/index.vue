<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Welcome Header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back{{ authStore.user?.displayName ? `, ${authStore.user.displayName}` : '' }}!
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ format(new Date(), 'EEEE, MMMM d, yyyy') }}
      </p>
    </div>

    <!-- Today's Progress -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Today's Progress
      </h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MacroCard
          label="Calories"
          :consumed="dailyMacros.consumed.kcal"
          :goal="dailyMacros.goals.kcal"
          :percentage="dailyMacros.percentages.kcal"
          color="blue"
          unit="kcal"
        />
        <MacroCard
          label="Protein"
          :consumed="dailyMacros.consumed.protein"
          :goal="dailyMacros.goals.protein"
          :percentage="dailyMacros.percentages.protein"
          color="red"
          unit="g"
        />
        <MacroCard
          label="Carbs"
          :consumed="dailyMacros.consumed.carbs"
          :goal="dailyMacros.goals.carbs"
          :percentage="dailyMacros.percentages.carbs"
          color="green"
          unit="g"
        />
        <MacroCard
          label="Fat"
          :consumed="dailyMacros.consumed.fat"
          :goal="dailyMacros.goals.fat"
          :percentage="dailyMacros.percentages.fat"
          color="yellow"
          unit="g"
        />
      </div>

      <!-- Macro Progress Ring -->
      <div class="flex justify-center">
        <MacroProgressRing
          :percentage="dailyMacros.percentages.kcal"
          :size="120"
          :stroke-width="8"
          color="blue"
        >
          <div class="text-center">
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ Math.round(dailyMacros.percentages.kcal) }}%
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              of daily goal
            </div>
          </div>
        </MacroProgressRing>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UButton
          size="lg"
          variant="outline"
          block
          @click="navigateTo('/meals')"
        >
          Log Meal
        </UButton>
        
        <UButton
          size="lg"
          variant="outline"
          block
          @click="navigateTo('/exercises')"
        >
          Log Workout
        </UButton>
        
        <UButton
          size="lg"
          variant="outline"
          block
          @click="openWeightModal = true"
        >
          Log Weight
        </UButton>
      </div>
    </div>

    <!-- Today's Meals Summary -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Meals
        </h2>
        <UButton
          size="sm"
          variant="ghost"
          @click="navigateTo('/meals')"
        >
          View All
        </UButton>
      </div>
      
      <div v-if="mealsStore.todaysMeals.length === 0" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">No meals logged today</p>
        <UButton
          size="sm"
          class="mt-2"
          @click="navigateTo('/meals/add')"
        >
          Log your first meal
        </UButton>
      </div>
      
      <div v-else class="space-y-3">
        <MealSummaryCard
          v-for="meal in recentMeals"
          :key="meal.id"
          :meal="meal"
          @click="navigateTo(`/meals/${meal.id}`)"
        />
      </div>
    </div>

    <!-- Weight Log Modal -->
    <WeightLogModal v-model="openWeightModal" />
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  title: 'Dashboard'
})

const authStore = useAuthStore()
const mealsStore = useMealsStore()

const openWeightModal = ref(false)

// Load today's meals on mount
onMounted(async () => {
  await mealsStore.loadTodaysMeals()
})

// Computed properties
const dailyMacros = computed(() => mealsStore.dailyMacros)

const recentMeals = computed(() => {
  return mealsStore.todaysMeals.slice(-3) // Show last 3 meals
})
</script>