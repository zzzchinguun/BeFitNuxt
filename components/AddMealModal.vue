<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Add {{ timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1) }} Meal
          </h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <Icon :name="tab.icon" class="w-5 h-5 inline mr-2" />
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto" style="max-height: calc(90vh - 180px);">
          <!-- Search Food -->
          <div v-if="activeTab === 'search'" class="p-6">
            <SearchFoodTab 
              @food-selected="onFoodSelected"
              @custom-food="activeTab = 'custom'"
            />
          </div>

          <!-- Custom Food -->
          <div v-else-if="activeTab === 'custom'" class="p-6">
            <CustomFoodTab 
              @food-created="onFoodSelected"
              @back="activeTab = 'search'"
            />
          </div>

          <!-- Barcode Scanner -->
          <div v-else-if="activeTab === 'barcode'" class="p-6">
            <BarcodeScannerTab 
              @food-found="onFoodSelected"
              @food-not-found="activeTab = 'custom'"
            />
          </div>

          <!-- Selected Items -->
          <div v-else-if="activeTab === 'review'" class="p-6">
            <ReviewMealTab 
              :items="selectedItems"
              :time-of-day="timeOfDay"
              :date="date"
              @remove-item="removeItem"
              @update-quantity="updateQuantity"
              @save-meal="saveMeal"
              @back="activeTab = 'search'"
              :saving="saving"
            />
          </div>
        </div>

        <!-- Footer -->
        <div v-if="selectedItems.length > 0 && activeTab !== 'review'" class="p-4 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-600">
              {{ selectedItems.length }} item{{ selectedItems.length > 1 ? 's' : '' }} selected
            </div>
            <button
              @click="activeTab = 'review'"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Review & Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealItem } from '~/types'

interface Props {
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: Date
}

interface Emits {
  close: []
  mealAdded: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()


// State
const activeTab = ref('search')
const selectedItems = ref<MealItem[]>([])
const saving = ref(false)

// Computed
const tabs = computed(() => [
  { id: 'search', label: 'Search Food', icon: 'heroicons:magnifying-glass' },
  { id: 'custom', label: 'Custom Food', icon: 'heroicons:plus-circle' },
  { id: 'barcode', label: 'Scan Barcode', icon: 'heroicons:qr-code' },
  { id: 'review', label: 'Review', icon: 'heroicons:clipboard-document-list' }
])

// Methods
function onFoodSelected(item: Partial<MealItem>) {
  const mealItem: MealItem = {
    refType: item.refType || 'custom',
    refId: item.refId || '',
    name: item.name || '',
    brand: item.brand,
    quantityGrams: item.quantityGrams || 100,
    servingSize: item.servingSize,
    kcal: item.kcal || 0,
    protein: item.protein || 0,
    carbs: item.carbs || 0,
    fat: item.fat || 0,
    photoUrl: item.photoUrl
  }
  
  selectedItems.value.push(mealItem)
  
  // Auto-navigate to review if this is the first item
  if (selectedItems.value.length === 1) {
    activeTab.value = 'review'
  }
}

function removeItem(index: number) {
  selectedItems.value.splice(index, 1)
  if (selectedItems.value.length === 0) {
    activeTab.value = 'search'
  }
}

function updateQuantity(index: number, quantity: number) {
  const item = selectedItems.value[index]
  if (!item) return
  
  const ratio = quantity / item.quantityGrams
  item.quantityGrams = quantity
  item.kcal = Math.round(item.kcal * ratio)
  item.protein = Math.round(item.protein * ratio * 10) / 10
  item.carbs = Math.round(item.carbs * ratio * 10) / 10
  item.fat = Math.round(item.fat * ratio * 10) / 10
}

async function saveMeal(items: MealItem[]) {
  saving.value = true
  try {
    const mealsStore = useMealsStore()
    await mealsStore.addMeal({
      date: props.date,
      timeOfDay: props.timeOfDay,
      items
    })
    emit('mealAdded')
  } catch (error) {
    console.error('Error saving meal:', error)
  } finally {
    saving.value = false
  }
}

// Reset when modal opens
watch(() => props.timeOfDay, () => {
  activeTab.value = 'search'
  selectedItems.value = []
})
</script>