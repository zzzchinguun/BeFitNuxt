<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer" @click="showQuantityModal = true">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h4 class="font-medium text-gray-900">{{ food.name }}</h4>
        <p v-if="food.brand" class="text-sm text-gray-500">{{ food.brand }}</p>
        <div class="mt-2 text-sm text-gray-600">
          Per 100g: {{ food.per100g.kcal }} kcal • P: {{ food.per100g.proteinG }}g • C: {{ food.per100g.carbsG }}g • F: {{ food.per100g.fatG }}g
        </div>
        <div class="mt-1 flex space-x-2">
          <span v-for="category in food.categories.slice(0, 2)" :key="category" 
                class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {{ category }}
          </span>
        </div>
      </div>
      <div class="ml-4 flex-shrink-0">
        <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
          Add
        </button>
      </div>
    </div>

    <!-- Quantity Modal -->
    <div v-if="showQuantityModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="showQuantityModal = false">
      <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add {{ food.name }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              v-model.number="selectedQuantity"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="selectWithQuantity"
            />
          </div>

          <!-- Nutrition Preview -->
          <div class="bg-gray-50 rounded-lg p-3">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Nutrition ({{ selectedQuantity }}g)</h4>
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
        </div>

        <div class="flex space-x-3 mt-6">
          <button
            @click="showQuantityModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="selectWithQuantity"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add to Meal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VerifiedMeal } from '~/types'

interface Props {
  food: VerifiedMeal
}

interface Emits {
  select: [food: VerifiedMeal, quantity: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const showQuantityModal = ref(false)
const selectedQuantity = ref(100)

// Computed
const calculatedNutrition = computed(() => {
  const multiplier = selectedQuantity.value / 100
  return {
    kcal: Math.round(props.food.per100g.kcal * multiplier),
    protein: Math.round(props.food.per100g.proteinG * multiplier * 10) / 10,
    carbs: Math.round(props.food.per100g.carbsG * multiplier * 10) / 10,
    fat: Math.round(props.food.per100g.fatG * multiplier * 10) / 10
  }
})

// Methods
function selectWithQuantity() {
  emit('select', props.food, selectedQuantity.value)
  showQuantityModal.value = false
}
</script>