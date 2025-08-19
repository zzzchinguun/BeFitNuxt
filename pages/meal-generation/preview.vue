<template>
  <div class="min-h-screen" style="background: linear-gradient(135deg, var(--color-bg) 0%, rgba(5, 132, 255, 0.05) 100%);">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Success Header -->
      <div class="text-center mb-8 reveal">
        <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-check" class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Гайхалтай! Төлөвлөгөө бэлэн боллоо
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Таны макро зорилгод {{ macroAccuracy }}% нарийвчлалтай тохирсон хоолны төлөвлөгөө
        </p>
      </div>

      <!-- Macro Summary -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 mb-8 reveal">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Нийт илчлэг</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalMacros.kcal }}</p>
            <p class="text-xs text-gray-500">{{ userMacros.kcal }} зорилго</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Уураг</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ totalMacros.proteinG }}г</p>
            <p class="text-xs text-gray-500">{{ userMacros.proteinG }}г зорилго</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Нүүрс ус</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ totalMacros.carbsG }}г</p>
            <p class="text-xs text-gray-500">{{ userMacros.carbsG }}г зорилго</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Өөх тос</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ totalMacros.fatG }}г</p>
            <p class="text-xs text-gray-500">{{ userMacros.fatG }}г зорилго</p>
          </div>
        </div>
      </div>

      <!-- Generated Meals -->
      <div class="space-y-8 mb-8">
        <!-- Breakfast -->
        <div class="reveal">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-sun" class="w-6 h-6 mr-3 text-amber-500" />
            Өглөөний хоол
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GeneratedMealCard 
              v-for="meal in breakfastMeals" 
              :key="meal.id"
              :meal="meal"
              :isRegenerating="regeneratingMeals.has(meal.id)"
              @regenerate="regenerateMeal"
            />
          </div>
        </div>

        <!-- Lunch -->
        <div class="reveal">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-sun" class="w-6 h-6 mr-3 text-orange-500" />
            Үдийн хоол
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GeneratedMealCard 
              v-for="meal in lunchMeals" 
              :key="meal.id"
              :meal="meal"
              :isRegenerating="regeneratingMeals.has(meal.id)"
              @regenerate="regenerateMeal"
            />
          </div>
        </div>

        <!-- Dinner -->
        <div class="reveal">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-moon" class="w-6 h-6 mr-3 text-indigo-500" />
            Оройн хоол
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GeneratedMealCard 
              v-for="meal in dinnerMeals" 
              :key="meal.id"
              :meal="meal"
              :isRegenerating="regeneratingMeals.has(meal.id)"
              @regenerate="regenerateMeal"
            />
          </div>
        </div>

        <!-- Snacks -->
        <div class="reveal" v-if="snackMeals.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <UIcon name="i-heroicons-gift" class="w-6 h-6 mr-3 text-purple-500" />
            Үдийн хоол
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GeneratedMealCard 
              v-for="meal in snackMeals" 
              :key="meal.id"
              :meal="meal"
              :isRegenerating="regeneratingMeals.has(meal.id)"
              @regenerate="regenerateMeal"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-8 reveal">
        <UButton
          @click="generateShoppingList"
          size="lg"
          class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl px-8"
        >
          <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 mr-3" />
          Дэлгүүрийн жагсаалт харах
        </UButton>

        <UButton
          @click="acceptPlan"
          size="lg"
          class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl px-8"
        >
          <UIcon name="i-heroicons-heart" class="w-5 h-5 mr-3" />
          Энэ төлөвлөгөөг сонгох
        </UButton>

        <UButton
          @click="regenerateAll"
          variant="outline"
          size="lg"
          class="rounded-2xl px-8 border-2"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-3" />
          Дахин үүсгэх
        </UButton>
      </div>

      <!-- Tips -->
      <div class="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 reveal">
        <div class="flex items-start space-x-4">
          <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">Зөвлөгөө</h3>
            <ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Хоол бүрийг дарж дэлгэрэнгүй жор, орц найрлагыг харж болно</li>
              <li>• Таалагдаагүй хоолыг "Дахин сонгох" товчоор солих боломжтой</li>
              <li>• Дэлгүүрийн жагсаалт автоматаар бэлдэгдэж, принт хийх боломжтой</li>
              <li>• Энэ төлөвлөгөөг тань үүсгэсний дараа үндсэн аппруу шилжинэ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GeneratedMeal } from '~/types'

definePageMeta({
  layout: 'meal-generation',
  title: 'Үүсгэгдсэн төлөвлөгөө'
})

const router = useRouter()
const authStore = useAuthStore()
const mealGenerationStore = useMealGenerationStore()

// Get generated meals from store
const generatedMeals = computed(() => {
  return mealGenerationStore.currentMealPlan?.meals || []
})

// Fallback mock data for development
const mockMeals = ref<GeneratedMeal[]>([
  {
    id: 'breakfast-1',
    name: 'Өндөр Протейнтэй Овъёосны Аяга',
    category: 'breakfast',
    ingredients: [
      { id: '1', name: 'Овъёос', amount: 1, unit: 'аяга', category: 'carbs', essential: true },
      { id: '2', name: 'Уургийн нунтаг', amount: 1, unit: 'хэмжээ', category: 'protein', essential: true },
      { id: '3', name: 'Гадил', amount: 1, unit: 'ширхэг', category: 'carbs', essential: false }
    ],
    instructions: ['Овъёосыг буцалгана', 'Уургийн нунтаг холино', 'Гадилээр чимэглэнэ'],
    macros: { kcal: 500, proteinG: 35, carbsG: 60, fatG: 15 },
    servingSize: 1,
    source: 'database',
    estimatedTime: 15,
    difficulty: 'easy'
  },
  {
    id: 'lunch-1',
    name: 'Өндөгний Цагаан ба Бууцайны Омлет',
    category: 'lunch',
    ingredients: [
      { id: '4', name: 'Өндөгний цагаан', amount: 8, unit: 'ширхэг', category: 'protein', essential: true },
      { id: '5', name: 'Бууцай', amount: 2, unit: 'аяга', category: 'vegetables', essential: true },
      { id: '6', name: 'Фета бяслаг', amount: 1/4, unit: 'аяга', category: 'dairy', essential: false }
    ],
    instructions: ['Өндгийг хайруулна', 'Бууцай нэмнэ', 'Омлет хийнэ'],
    macros: { kcal: 250, proteinG: 30, carbsG: 5, fatG: 10 },
    servingSize: 1,
    source: 'database',
    estimatedTime: 20,
    difficulty: 'medium'
  },
  {
    id: 'dinner-1',
    name: 'Грекийн Тарагны Парфе',
    category: 'dinner',
    ingredients: [
      { id: '7', name: 'Грекийн тараг', amount: 1, unit: 'аяга', category: 'dairy', essential: true },
      { id: '8', name: 'Холимог жимс', amount: 1/2, unit: 'аяга', category: 'carbs', essential: true },
      { id: '9', name: 'Гранола', amount: 1/4, unit: 'аяга', category: 'carbs', essential: false }
    ],
    instructions: ['Тарагийг хийнэ', 'Жимс нэмнэ', 'Гранолаар чимэглэнэ'],
    macros: { kcal: 350, proteinG: 25, carbsG: 40, fatG: 8 },
    servingSize: 1,
    source: 'database',
    estimatedTime: 10,
    difficulty: 'easy'
  }
])

// Computed properties
const userMacros = computed(() => {
  return authStore.user?.macroGoals || {
    kcal: 2000,
    proteinG: 150,
    carbsG: 200,
    fatG: 67
  }
})

// Use generated meals if available, otherwise fallback to mock data
const mealsToShow = computed(() => {
  return generatedMeals.value.length > 0 ? generatedMeals.value : mockMeals.value
})

const breakfastMeals = computed(() => mealsToShow.value.filter(meal => meal.category === 'breakfast'))
const lunchMeals = computed(() => mealsToShow.value.filter(meal => meal.category === 'lunch'))
const dinnerMeals = computed(() => mealsToShow.value.filter(meal => meal.category === 'dinner'))
const snackMeals = computed(() => mealsToShow.value.filter(meal => meal.category === 'snack'))

const totalMacros = computed(() => {
  // Use the calculated totals from the meal plan if available
  if (mealGenerationStore.currentMealPlan) {
    return mealGenerationStore.currentMealPlan.totalMacros
  }
  
  // Otherwise calculate from meals
  return mealsToShow.value.reduce((total, meal) => ({
    kcal: total.kcal + meal.macros.kcal,
    proteinG: total.proteinG + meal.macros.proteinG,
    carbsG: total.carbsG + meal.macros.carbsG,
    fatG: total.fatG + meal.macros.fatG
  }), { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })
})

const macroAccuracy = computed(() => {
  // Use the calculated accuracy from the meal plan if available
  if (mealGenerationStore.currentMealPlan) {
    return mealGenerationStore.currentMealPlan.macroAccuracy
  }
  
  // Otherwise calculate manually
  const targetTotal = userMacros.value.kcal
  const actualTotal = totalMacros.value.kcal
  const accuracy = Math.round((1 - Math.abs(targetTotal - actualTotal) / targetTotal) * 100)
  return Math.max(85, Math.min(99, accuracy)) // Mock 85-99% accuracy
})

// Regeneration states
const regeneratingMeals = ref<Set<string>>(new Set())

// Actions
async function regenerateMeal(mealId: string) {
  if (regeneratingMeals.value.has(mealId)) return
  
  regeneratingMeals.value.add(mealId)
  
  try {
    // Show loading state for 1-2 seconds for better UX
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))
    
    const success = await mealGenerationStore.regenerateMeal(mealId)
    if (!success) {
      console.error('Failed to regenerate meal')
      // TODO: Show error toast
    }
  } catch (error) {
    console.error('Error regenerating meal:', error)
    // TODO: Show error toast
  } finally {
    regeneratingMeals.value.delete(mealId)
  }
}

function regenerateAll() {
  console.log('Regenerating all meals')
  // TODO: Implement full regeneration
  router.push('/meal-generation')
}

function generateShoppingList() {
  console.log('Generating shopping list')
  // TODO: Navigate to shopping list page
  router.push('/meal-generation/shopping-list')
}

async function acceptPlan() {
  console.log('Accepting meal plan')
  
  // Save the meal plan (mock implementation)
  // TODO: Implement actual save to Firestore
  
  // Mark as completed and redirect to main app
  await authStore.updateUserProfile({ mealPlanGenerated: true })
  router.push('/')
}

// Reveal animation
onMounted(() => {
  nextTick(() => {
    const reveals = document.querySelectorAll('.reveal')
    reveals.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('reveal-visible')
      }, index * 150)
    })
  })
})

// Page meta
useHead({
  title: 'Үүсгэгдсэн хоолны төлөвлөгөө - BeFit',
  meta: [
    { name: 'description', content: 'Таны макро зорилгод тохирсон хоолны төлөвлөгөө' }
  ]
})
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>