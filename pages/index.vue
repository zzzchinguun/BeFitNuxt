<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-green-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <!-- Welcome Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Сайн байна уу{{ authStore.user?.displayName ? `, ${authStore.user.displayName}` : '' }}!
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          {{ formatInMongolian(new Date()) }}
        </p>
      </div>

      <!-- Today's Progress - Simplified -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Өнөөдрийн явц
          </h2>
          <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Icon name="i-heroicons-calendar-days" class="w-4 h-4" />
            <span>Өнөөдөр</span>
          </div>
        </div>
        
        <!-- Main Progress Circle -->
        <div class="flex flex-col items-center mb-8">
          <div class="relative">
            <MacroProgressRing
              :percentage="dailyMacros.percentages.kcal"
              :size="160"
              :stroke-width="12"
              color="#007AFF"
            >
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ Math.round(dailyMacros.percentages.kcal) }}%
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  өдрийн зорилго
                </div>
              </div>
            </MacroProgressRing>
          </div>
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ dailyMacros.consumed.kcal }} / {{ dailyMacros.goals.kcal }} ккал
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ dailyMacros.goals.kcal - dailyMacros.consumed.kcal }} ккал үлдсэн
            </p>
          </div>
        </div>

        <!-- Macro Cards - Simplified -->
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl p-4 border border-red-200/50 dark:border-red-700/50">
            <div class="text-center">
              <Icon name="i-heroicons-bolt" class="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p class="text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wide">Уураг</p>
              <p class="text-lg font-bold text-red-900 dark:text-red-200">
                {{ dailyMacros.consumed.protein }}г
              </p>
              <p class="text-xs text-red-600 dark:text-red-400">
                / {{ dailyMacros.goals.protein }}г
              </p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50">
            <div class="text-center">
              <Icon name="i-heroicons-sparkles" class="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p class="text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wide">Нүүрс ус</p>
              <p class="text-lg font-bold text-green-900 dark:text-green-200">
                {{ dailyMacros.consumed.carbs }}г
              </p>
              <p class="text-xs text-green-600 dark:text-green-400">
                / {{ dailyMacros.goals.carbs }}г
              </p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-700/50">
            <div class="text-center">
              <Icon name="i-heroicons-fire" class="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p class="text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wide">Өөх тос</p>
              <p class="text-lg font-bold text-amber-900 dark:text-amber-200">
                {{ dailyMacros.consumed.fat }}г
              </p>
              <p class="text-xs text-amber-600 dark:text-amber-400">
                / {{ dailyMacros.goals.fat }}г
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions - Redesigned -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Хурдан үйлдлүүд
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Generate Meal Plan - Most prominent -->
          <button
            @click="generateMealPlan"
            :disabled="isGeneratingMeals"
            class="group bg-gradient-to-br from-orange-500/10 to-orange-600/20 hover:from-orange-500/20 hover:to-orange-600/30 rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="text-center">
              <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon v-if="!isGeneratingMeals" name="i-heroicons-sparkles" class="w-6 h-6 text-white" />
                <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ isGeneratingMeals ? 'Үүсгэж байна...' : 'Хоолны төлөвлөгөө үүсгэх' }}
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ isGeneratingMeals ? generationStatus : 'AI-ээр хооллолт' }}
              </p>
            </div>
          </button>

          <button
            @click="navigateTo('/meals')"
            class="group bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/20 hover:from-[#007AFF]/20 hover:to-[#007AFF]/30 rounded-2xl p-6 border border-[#007AFF]/20 hover:border-[#007AFF]/30 transition-all duration-300 hover:scale-105"
          >
            <div class="text-center">
              <div class="w-12 h-12 bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon name="i-heroicons-squares-plus" class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Хоол бүртгэх</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">Өнөөдрийн хооллолт</p>
            </div>
          </button>
          
          <button
            @click="navigateTo('/exercises')"
            class="group bg-gradient-to-br from-green-500/10 to-green-600/20 hover:from-green-500/20 hover:to-green-600/30 rounded-2xl p-6 border border-green-500/20 hover:border-green-500/30 transition-all duration-300 hover:scale-105"
          >
            <div class="text-center">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon name="i-heroicons-heart" class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Дасгал бүртгэх</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">Биеийн тамир</p>
            </div>
          </button>
          
          <button
            @click="openWeightModal = true"
            class="group bg-gradient-to-br from-purple-500/10 to-purple-600/20 hover:from-purple-500/20 hover:to-purple-600/30 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 hover:scale-105"
          >
            <div class="text-center">
              <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon name="i-heroicons-scale" class="w-6 h-6 text-white" />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Жин бүртгэх</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">Жинийн өөрчлөлт</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Current Meal Plan Preview -->
      <div v-if="currentMealPlan" class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                Таны хоолны төлөвлөгөө
              </h2>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ currentMealPlan.macroAccuracy }}% нарийвчлал • {{ currentMealPlan.meals.length }} хоол
              </p>
            </div>
          </div>
          <UButton
            @click="navigateTo('/meal-generation/preview')"
            size="sm"
            variant="ghost"
            class="text-orange-500 hover:text-orange-600"
          >
            Бүгдийг харах
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </div>
        
        <!-- Mini Meal Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="meal in currentMealPlan.meals.slice(0, 3)" 
            :key="meal.id"
            class="bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all cursor-pointer group"
            @click="navigateTo('/meal-generation/preview')"
          >
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-gray-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ meal.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ meal.macros.kcal }} ккал • {{ categoryLabels[meal.category] }}
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-2 mt-4">
          <UButton
            @click="navigateTo('/meal-generation/preview')"
            size="xs"
            variant="soft"
            class="rounded-lg"
          >
            <UIcon name="i-heroicons-eye" class="w-3 h-3 mr-1" />
            Дэлгэрэнгүй
          </UButton>
          <UButton
            @click="navigateTo('/meal-generation/shopping-list')"
            size="xs"
            variant="soft"
            color="green"
            class="rounded-lg"
          >
            <UIcon name="i-heroicons-shopping-cart" class="w-3 h-3 mr-1" />
            Дэлгүүр
          </UButton>
          <UButton
            @click="generateMealPlan"
            size="xs"
            variant="soft"
            color="orange"
            class="rounded-lg"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-3 h-3 mr-1" />
            Шинээр үүсгэх
          </UButton>
        </div>
      </div>

      <!-- Today's Meals - Simplified -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Өнөөдрийн хоол
          </h2>
          <UButton
            size="sm"
            variant="ghost"
            @click="navigateTo('/meals')"
            class="text-[#007AFF] hover:text-[#007AFF]/80"
          >
            Бүгдийг харах
          </UButton>
        </div>
        
        <div v-if="mealsStore.todaysMeals.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="i-heroicons-squares-plus" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Өнөөдөр хоол бүртгээгүй байна</p>
          <UButton
            @click="navigateTo('/meals/add')"
            class="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-xl"
          >
            <Icon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
            Эхний хоолоо бүртгэх
          </UButton>
        </div>
        
        <div v-else class="space-y-3">
          <MealSummaryCard
            v-for="meal in recentMeals"
            :key="meal.id"
            :meal="meal"
            @click="navigateTo(`/meals/${meal.id}`)"
            class="hover:scale-[1.02] transition-transform cursor-pointer"
          />
          
          <div v-if="mealsStore.todaysMeals.length > 3" class="text-center pt-4">
            <UButton
              variant="ghost"
              size="sm"
              @click="navigateTo('/meals')"
              class="text-[#007AFF] hover:text-[#007AFF]/80"
            >
              Дахин {{ mealsStore.todaysMeals.length - 3 }} хоол харах
              <Icon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
          </div>
        </div>
      </div>

      <!-- Weight Log Modal -->
      <WeightLogModal v-model="openWeightModal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  title: 'Хянах самбар'
})

// Mongolian date formatting
function formatInMongolian(date: Date): string {
  const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']
  const months = [
    'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар',
    'Тавдугаар сар', 'Зургадугаар сар', 'Долдугаар сар', 'Наймдугаар сар',
    'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'
  ]
  
  const dayName = days[date.getDay()]
  const monthName = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  
  return `${dayName}, ${year} оны ${monthName} ${day}`
}

// Skip Firebase operations during static generation or prerendering
const isStaticGeneration = process.server && (!process.env.NUXT_PUBLIC_FIREBASE_API_KEY || process.prerender)

const authStore = useAuthStore()
const mealsStore = useMealsStore()
const mealGenerationStore = useMealGenerationStore()
const { quickGenerate } = useMealGenerator()

const openWeightModal = ref(false)
const isGeneratingMeals = ref(false)
const generationStatus = ref('Хоолны мэдээлэл уншиж байна...')

// Category labels for meal plan preview
const categoryLabels = {
  'breakfast': 'Өглөө',
  'lunch': 'Үдэш', 
  'dinner': 'Орой',
  'snack': 'Үдийн хоол'
}

// Load today's meals on mount with error handling
onMounted(async () => {
  if (isStaticGeneration) return
  
  try {
    if (authStore.isAuthenticated) {
      await mealsStore.loadTodaysMeals()
    }
  } catch (error) {
    console.error('Error loading meals:', error)
  }
})

// Computed properties with fallbacks
const dailyMacros = computed(() => {
  if (isStaticGeneration) {
    return {
      consumed: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      goals: { kcal: 2000, protein: 100, carbs: 250, fat: 67 },
      percentages: { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    }
  }
  
  try {
    return mealsStore.dailyMacros
  } catch (error) {
    console.error('Error computing daily macros:', error)
    return {
      consumed: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      goals: { kcal: 2000, protein: 100, carbs: 250, fat: 67 },
      percentages: { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    }
  }
})

const recentMeals = computed(() => {
  if (isStaticGeneration) return []
  
  try {
    return mealsStore.todaysMeals.slice(-3) // Show last 3 meals
  } catch (error) {
    console.error('Error computing recent meals:', error)
    return []
  }
})

// Current meal plan for preview
const currentMealPlan = computed(() => {
  if (isStaticGeneration) return null
  
  try {
    return mealGenerationStore.currentMealPlan
  } catch (error) {
    console.error('Error getting current meal plan:', error)
    return null
  }
})

// Meal generation function
async function generateMealPlan() {
  if (isGeneratingMeals.value) return
  
  isGeneratingMeals.value = true
  
  try {
    // Simulate realistic generation steps
    const steps = [
      'Хоолны мэдээлэл уншиж байна...',
      'Таны макро зорилгод тохирох хоолнуудыг сонгож байна...',
      'Хооллолтын төлөвлөгөө зохиож байна...',
      'Орц найрлагын жагсаалт бэлтгэж байна...',
      'Эцсийн шалгалт хийж байна...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      generationStatus.value = steps[i]
      // Realistic timing for each step
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))
    }
    
    // Generate meal plan using the store
    const result = await quickGenerate()
    
    if (result.success) {
      // Mark user as having generated meal plan
      await authStore.updateUserProfile({ mealPlanGenerated: true })
      
      // Navigate to generated meals preview
      await navigateTo('/meal-generation/preview')
    } else {
      console.error('Meal generation failed:', result.errors)
      // TODO: Show error message to user
    }
    
  } catch (error) {
    console.error('Meal generation failed:', error)
    // TODO: Show error message
  } finally {
    isGeneratingMeals.value = false
  }
}
</script>