<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-2">
      <button @click="$emit('back')" class="text-gray-600 hover:text-gray-900">
        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
      </button>
      <h3 class="text-lg font-semibold text-gray-900">Create Custom Food</h3>
    </div>

    <form @submit.prevent="createFood" class="space-y-4">
      <!-- Food Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Food Name *
        </label>
        <input
          v-model="foodData.name"
          type="text"
          required
          placeholder="e.g., Homemade Chicken Salad"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Brand (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Brand (Optional)
        </label>
        <input
          v-model="foodData.brand"
          type="text"
          placeholder="e.g., Home Recipe"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Serving Size -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Serving Size
          </label>
          <input
            v-model.number="foodData.servingSize"
            type="number"
            min="1"
            placeholder="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            v-model="foodData.servingUnit"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="g">grams (g)</option>
            <option value="ml">milliliters (ml)</option>
            <option value="piece">piece</option>
            <option value="cup">cup</option>
          </select>
        </div>
      </div>

      <!-- Nutrition Per 100g -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-3">Nutrition per 100g</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Calories (kcal) *
            </label>
            <input
              v-model.number="foodData.kcal"
              type="number"
              min="0"
              step="0.1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Protein (g) *
            </label>
            <input
              v-model.number="foodData.protein"
              type="number"
              min="0"
              step="0.1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Carbs (g) *
            </label>
            <input
              v-model.number="foodData.carbs"
              type="number"
              min="0"
              step="0.1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fat (g) *
            </label>
            <input
              v-model.number="foodData.fat"
              type="number"
              min="0"
              step="0.1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Quantity to Add -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Quantity to add to meal
        </label>
        <div class="flex space-x-2">
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span class="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
            {{ foodData.servingUnit }}
          </span>
        </div>
      </div>

      <!-- Nutrition Preview -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">
          Nutrition for {{ quantity }}{{ foodData.servingUnit }}
        </h4>
        <div class="grid grid-cols-4 gap-2 text-sm">
          <div class="text-center">
            <div class="font-semibold">{{ calculatedNutrition.kcal }}</div>
            <div class="text-gray-600">kcal</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">{{ calculatedNutrition.protein }}g</div>
            <div class="text-gray-600">Protein</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">{{ calculatedNutrition.carbs }}g</div>
            <div class="text-gray-600">Carbs</div>
          </div>
          <div class="text-center">
            <div class="font-semibold">{{ calculatedNutrition.fat }}g</div>
            <div class="text-gray-600">Fat</div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex space-x-3">
        <button
          type="button"
          @click="$emit('back')"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!isValid"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Meal
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { MealItem } from '~/types'

interface Emits {
  foodCreated: [item: Partial<MealItem>]
  back: []
}

const emit = defineEmits<Emits>()

// State
const foodData = reactive({
  name: '',
  brand: '',
  servingSize: 100,
  servingUnit: 'g',
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0
})

const quantity = ref(100)

// Computed
const isValid = computed(() => {
  return foodData.name.trim() && 
         foodData.kcal >= 0 && 
         foodData.protein >= 0 && 
         foodData.carbs >= 0 && 
         foodData.fat >= 0
})

const calculatedNutrition = computed(() => {
  const multiplier = quantity.value / 100
  return {
    kcal: Math.round(foodData.kcal * multiplier),
    protein: Math.round(foodData.protein * multiplier * 10) / 10,
    carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
    fat: Math.round(foodData.fat * multiplier * 10) / 10
  }
})

// Methods
function createFood() {
  if (!isValid.value) return

  const mealItem: Partial<MealItem> = {
    refType: 'custom',
    refId: '', // Will be generated on save
    name: foodData.name,
    brand: foodData.brand || undefined,
    quantityGrams: quantity.value,
    servingSize: foodData.servingSize,
    kcal: calculatedNutrition.value.kcal,
    protein: calculatedNutrition.value.protein,
    carbs: calculatedNutrition.value.carbs,
    fat: calculatedNutrition.value.fat
  }

  emit('foodCreated', mealItem)
}
</script>