<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button @click="$emit('back')" class="text-gray-600 hover:text-gray-900">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </button>
        <h3 class="text-lg font-semibold text-gray-900">Review {{ timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1) }}</h3>
      </div>
      <div class="text-sm text-gray-600">
        {{ formatDate(date) }}
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="bg-white border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
            <p v-if="item.brand" class="text-sm text-gray-500">{{ item.brand }}</p>
            
            <!-- Quantity Input -->
            <div class="mt-2 flex items-center space-x-2">
              <label class="text-sm text-gray-700">Quantity:</label>
              <input
                :value="item.quantityGrams"
                @input="updateQuantity(index, $event)"
                type="number"
                min="1"
                class="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <span class="text-sm text-gray-600">g</span>
            </div>

            <!-- Nutrition Info -->
            <div class="mt-2 text-sm text-gray-600">
              {{ item.kcal }} kcal • P: {{ item.protein }}g • C: {{ item.carbs }}g • F: {{ item.fat }}g
            </div>
          </div>

          <!-- Remove Button -->
          <button
            @click="$emit('removeItem', index)"
            class="ml-4 p-1 text-gray-400 hover:text-red-600"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Total Nutrition -->
    <div class="bg-blue-50 rounded-lg p-4">
      <h4 class="font-medium text-gray-900 mb-3">Total Nutrition</h4>
      <div class="grid grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ totals.kcal }}</div>
          <div class="text-sm text-gray-600">Calories</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ totals.protein }}g</div>
          <div class="text-sm text-gray-600">Protein</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ totals.carbs }}g</div>
          <div class="text-sm text-gray-600">Carbs</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-yellow-600">{{ totals.fat }}g</div>
          <div class="text-sm text-gray-600">Fat</div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-3">
      <button
        @click="$emit('back')"
        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Add More Items
      </button>
      <button
        @click="saveMeal"
        :disabled="items.length === 0 || saving"
        class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <div v-if="saving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span>{{ saving ? 'Saving...' : 'Save Meal' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { MealItem, MealEntry } from '~/types'

interface Props {
  items: MealItem[]
  timeOfDay: MealEntry['timeOfDay']
  date: Date
  saving?: boolean
}

interface Emits {
  removeItem: [index: number]
  updateQuantity: [index: number, quantity: number]
  saveMeal: [items: MealItem[]]
  back: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const totals = computed(() => {
  return props.items.reduce(
    (sum, item) => ({
      kcal: sum.kcal + item.kcal,
      protein: sum.protein + item.protein,
      carbs: sum.carbs + item.carbs,
      fat: sum.fat + item.fat
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  )
})

// Methods
function formatDate(date: Date) {
  return format(date, 'EEEE, MMM d, yyyy')
}

function updateQuantity(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const quantity = parseInt(target.value) || 0
  if (quantity > 0) {
    emit('updateQuantity', index, quantity)
  }
}

function saveMeal() {
  if (props.items.length > 0) {
    emit('saveMeal', props.items)
  }
}
</script>