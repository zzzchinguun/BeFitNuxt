<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for food items..."
        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        @input="debouncedSearch"
      />
      <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
    </div>

    <!-- Quick Actions -->
    <div class="flex space-x-2">
      <button
        @click="$emit('customFood')"
        class="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        <span>Custom Food</span>
      </button>
      <button
        class="flex items-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
        disabled
      >
        <Icon name="heroicons:qr-code" class="w-5 h-5" />
        <span>Scan Barcode</span>
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchLoading" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <div v-else-if="searchResults.length === 0 && hasSearched" class="text-center py-8 text-gray-500">
      <Icon name="heroicons:magnifying-glass" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p>No food items found</p>
      <p class="text-sm">Try different keywords or create a custom food</p>
    </div>

    <div v-else-if="searchResults.length > 0" class="space-y-2">
      <FoodSearchResult
        v-for="food in searchResults"
        :key="food.id"
        :food="food"
        @select="selectFood"
      />
    </div>

    <!-- Popular Foods (when no search) -->
    <div v-else class="space-y-4">
      <h3 class="font-medium text-gray-900">Popular Foods</h3>
      <div class="space-y-2">
        <FoodSearchResult
          v-for="food in popularFoods"
          :key="food.id"
          :food="food"
          @select="selectFood"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'
import type { VerifiedMeal, MealItem } from '~/types'

interface Emits {
  foodSelected: [item: Partial<MealItem>]
  customFood: []
}

const emit = defineEmits<Emits>()
const mealsStore = useMealsStore()

// State
const searchQuery = ref('')
const hasSearched = ref(false)

// Computed
const searchResults = computed(() => mealsStore.searchResults)
const searchLoading = computed(() => mealsStore.searchLoading)

// Sample popular foods (in a real app, this would come from your database)
const popularFoods = ref<VerifiedMeal[]>([
  {
    id: '1',
    name: 'Chicken Breast',
    brand: 'Generic',
    serving: { size: 100, unit: 'g' },
    per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
    categories: ['meat', 'protein'],
    source: 'USDA',
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '2',
    name: 'Brown Rice',
    brand: 'Generic',
    serving: { size: 100, unit: 'g' },
    per100g: { kcal: 123, proteinG: 2.6, carbsG: 23, fatG: 0.9 },
    categories: ['grains', 'carbs'],
    source: 'USDA',
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  },
  {
    id: '3',
    name: 'Banana',
    brand: 'Generic',
    serving: { size: 100, unit: 'g' },
    per100g: { kcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3 },
    categories: ['fruits', 'carbs'],
    source: 'USDA',
    createdAt: new Date() as any,
    updatedAt: new Date() as any
  }
])

// Methods
const debouncedSearch = debounce(async () => {
  if (searchQuery.value.trim().length >= 2) {
    hasSearched.value = true
    await mealsStore.searchVerifiedMeals({
      query: searchQuery.value.trim()
    })
  }
}, 300)

function selectFood(food: VerifiedMeal, quantity: number = 100) {
  const mealItem = mealsStore.calculateMacrosForQuantity(food, quantity)
  emit('foodSelected', mealItem)
}

// Reset search when query is cleared
watch(searchQuery, (newQuery) => {
  if (!newQuery.trim()) {
    hasSearched.value = false
  }
})
</script>