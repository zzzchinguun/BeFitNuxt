<template>
  <div class="space-y-6 text-center">
    <div class="flex items-center space-x-2">
      <Icon name="heroicons:qr-code" class="w-8 h-8 text-gray-400" />
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Barcode Scanner</h3>
        <p class="text-sm text-gray-600">Scan product barcodes to find nutrition info</p>
      </div>
    </div>

    <!-- Scanner Placeholder -->
    <div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12">
      <Icon name="heroicons:camera" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h4 class="text-lg font-medium text-gray-900 mb-2">Barcode Scanner</h4>
      <p class="text-gray-600 mb-4">This feature is coming soon!</p>
      <p class="text-sm text-gray-500">
        Camera access will be implemented to scan product barcodes and automatically populate nutrition information.
      </p>
    </div>

    <!-- Manual Barcode Input -->
    <div class="text-left">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Or enter barcode manually:
      </label>
      <div class="flex space-x-2">
        <input
          v-model="manualBarcode"
          type="text"
          placeholder="e.g., 1234567890123"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          @click="searchBarcode"
          :disabled="!manualBarcode.trim() || searching"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div v-if="searching" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span v-else>Search</span>
        </button>
      </div>
    </div>

    <!-- Search Result -->
    <div v-if="searchResult" class="text-left">
      <h4 class="font-medium text-gray-900 mb-2">Found Product:</h4>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h5 class="font-medium text-gray-900">{{ searchResult.name }}</h5>
        <p v-if="searchResult.brand" class="text-sm text-gray-500">{{ searchResult.brand }}</p>
        <div class="mt-2 text-sm text-gray-600">
          Per 100g: {{ searchResult.per100g.kcal }} kcal • P: {{ searchResult.per100g.proteinG }}g • C: {{ searchResult.per100g.carbsG }}g • F: {{ searchResult.per100g.fatG }}g
        </div>
        <button
          @click="selectProduct"
          class="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add to Meal
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="searchAttempted && !searching" class="text-left">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-start">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
          <div>
            <h4 class="font-medium text-yellow-800">Product not found</h4>
            <p class="text-sm text-yellow-700 mt-1">
              We couldn't find this barcode in our database. You can create a custom food item instead.
            </p>
            <button
              @click="$emit('foodNotFound')"
              class="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              Create Custom Food
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alternative Actions -->
    <div class="border-t border-gray-200 pt-6">
      <p class="text-sm text-gray-600 mb-4">Can't find what you're looking for?</p>
      <div class="flex space-x-3">
        <button
          @click="$emit('foodNotFound')"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Create Custom Food
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VerifiedMeal, MealItem } from '~/types'

interface Emits {
  foodFound: [item: Partial<MealItem>]
  foodNotFound: []
}

const emit = defineEmits<Emits>()
const mealsStore = useMealsStore()

// State
const manualBarcode = ref('')
const searching = ref(false)
const searchAttempted = ref(false)
const searchResult = ref<VerifiedMeal | null>(null)

// Methods
async function searchBarcode() {
  if (!manualBarcode.value.trim()) return

  searching.value = true
  searchAttempted.value = true
  searchResult.value = null

  try {
    const result = await mealsStore.getMealByBarcode(manualBarcode.value.trim())
    searchResult.value = result
    
    if (!result) {
      // Product not found, user can create custom food
      console.log('Product not found for barcode:', manualBarcode.value)
    }
  } catch (error) {
    console.error('Error searching barcode:', error)
  } finally {
    searching.value = false
  }
}

function selectProduct() {
  if (!searchResult.value) return
  
  const mealItem = mealsStore.calculateMacrosForQuantity(searchResult.value, 100)
  emit('foodFound', mealItem)
}
</script>