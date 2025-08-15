<template>
  <div class="p-4 hover:bg-gray-50">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-start space-x-3">
          <!-- Food Image -->
          <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            <img 
              v-if="primaryItem.photoUrl" 
              :src="primaryItem.photoUrl" 
              :alt="primaryItem.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="heroicons:photo" class="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <!-- Primary Item -->
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-medium text-gray-900 truncate">{{ primaryItem.name }}</h4>
                <p v-if="primaryItem.brand" class="text-sm text-gray-500">{{ primaryItem.brand }}</p>
                <p class="text-sm text-gray-600">{{ primaryItem.quantityGrams }}g</p>
              </div>
              <div class="text-right ml-4">
                <div class="font-medium text-gray-900">{{ primaryItem.kcal }} kcal</div>
                <div class="text-xs text-gray-500">
                  P: {{ primaryItem.protein }}g | C: {{ primaryItem.carbs }}g | F: {{ primaryItem.fat }}g
                </div>
              </div>
            </div>

            <!-- Additional Items -->
            <div v-if="meal.items.length > 1" class="mt-2 pl-4 border-l-2 border-gray-100">
              <div 
                v-for="(item, index) in additionalItems" 
                :key="index"
                class="flex justify-between items-center py-1 text-sm"
              >
                <div class="text-gray-600">
                  {{ item.name }} ({{ item.quantityGrams }}g)
                </div>
                <div class="text-gray-500">
                  {{ item.kcal }} kcal
                </div>
              </div>
            </div>

            <!-- Total (if multiple items) -->
            <div v-if="meal.items.length > 1" class="mt-2 pt-2 border-t border-gray-100">
              <div class="flex justify-between items-center font-medium text-gray-900">
                <span>Total ({{ meal.items.length }} items)</span>
                <div class="text-right">
                  <div>{{ meal.totals.kcal }} kcal</div>
                  <div class="text-xs text-gray-500">
                    P: {{ meal.totals.proteinG }}g | C: {{ meal.totals.carbsG }}g | F: {{ meal.totals.fatG }}g
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-2 ml-4">
        <button 
          @click="$emit('edit')"
          class="p-1 text-gray-400 hover:text-blue-600"
        >
          <Icon name="heroicons:pencil" class="w-4 h-4" />
        </button>
        <button 
          @click="$emit('delete')"
          class="p-1 text-gray-400 hover:text-red-600"
        >
          <Icon name="heroicons:trash" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MealEntry, MealItem } from '~/types'

interface Props {
  meal: MealEntry
}

interface Emits {
  edit: []
  delete: []
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Computed
const primaryItem = computed(() => props.meal.items[0] || {})
const additionalItems = computed(() => props.meal.items.slice(1))
</script>