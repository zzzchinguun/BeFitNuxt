<template>
  <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden group hover:scale-105 transition-all duration-300 relative" :class="{ 'opacity-60': isRegenerating }">
    <!-- Meal Image -->
    <div class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
      <img 
        v-if="meal.imageUrl"
        :src="meal.imageUrl" 
        :alt="meal.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center">
          <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Зураг удахгүй</p>
        </div>
      </div>
      
      <!-- Category badge -->
      <div class="absolute top-3 left-3">
        <span class="px-3 py-1 rounded-full text-xs font-medium" :class="categoryBadgeClass">
          {{ categoryLabel }}
        </span>
      </div>
      
      <!-- Difficulty & Time -->
      <div class="absolute top-3 right-3 flex space-x-2">
        <span v-if="meal.estimatedTime" class="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
          {{ meal.estimatedTime }}мин
        </span>
        <span v-if="meal.difficulty" class="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
          {{ difficultyLabel }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Meal Name -->
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
        {{ meal.name }}
      </h3>
      
      <!-- Macros -->
      <div class="grid grid-cols-4 gap-3 mb-4">
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Илчлэг</p>
          <p class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ meal.macros.kcal }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Уураг</p>
          <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ meal.macros.proteinG }}г</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Нүүрс</p>
          <p class="text-sm font-bold text-green-600 dark:text-green-400">{{ meal.macros.carbsG }}г</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Өөх</p>
          <p class="text-sm font-bold text-amber-600 dark:text-amber-400">{{ meal.macros.fatG }}г</p>
        </div>
      </div>
      
      <!-- Key Ingredients Preview -->
      <div class="mb-4">
        <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Гол орцнууд:</p>
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="ingredient in keyIngredients" 
            :key="ingredient.id"
            class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300"
          >
            {{ ingredient.name }}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex space-x-2">
        <UButton
          @click="viewDetails"
          size="sm"
          variant="outline"
          class="flex-1 rounded-lg"
        >
          <UIcon name="i-heroicons-eye" class="w-4 h-4 mr-2" />
          Дэлгэрэнгүй
        </UButton>
        
        <UButton
          @click="regenerate"
          :disabled="isRegenerating"
          size="sm"
          variant="soft"
          color="gray"
          class="rounded-lg"
          title="Өөр хоол сонгох"
        >
          <div v-if="isRegenerating" class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <UIcon v-else name="i-heroicons-arrow-path" class="w-4 h-4" />
        </UButton>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isRegenerating" class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
      <div class="text-center">
        <div class="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Шинэ хоол сонгож байна...</p>
      </div>
    </div>

    <!-- Meal Details Modal -->
    <UModal v-model="showDetails">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ meal.name }}</h2>
          <UButton
            @click="showDetails = false"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
          />
        </div>

        <!-- Meal Image in Modal -->
        <div class="mb-6">
          <div class="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden">
            <img 
              v-if="meal.imageUrl"
              :src="meal.imageUrl" 
              :alt="meal.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex items-center justify-center h-full">
              <div class="text-center">
                <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-500 dark:text-gray-400">Зураг удахгүй нэмэгдэнэ</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Орц найрлага</h3>
          <div class="space-y-2">
            <div 
              v-for="ingredient in meal.ingredients" 
              :key="ingredient.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-gray-500" />
                </div>
                <span class="font-medium text-gray-900 dark:text-white">{{ ingredient.name }}</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ ingredient.amount }} {{ ingredient.unit }}
              </span>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Хийх арга</h3>
          <ol class="space-y-3">
            <li 
              v-for="(instruction, index) in meal.instructions" 
              :key="index"
              class="flex space-x-3"
            >
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                {{ index + 1 }}
              </span>
              <p class="text-gray-700 dark:text-gray-300">{{ instruction }}</p>
            </li>
          </ol>
        </div>

        <!-- Nutrition Info -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 class="font-semibold text-blue-900 dark:text-blue-200 mb-3">Тэжээллэг мэдээлэл</h4>
          <div class="grid grid-cols-4 gap-4 text-center">
            <div>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ meal.macros.kcal }}</p>
              <p class="text-sm text-blue-800 dark:text-blue-300">ккал</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ meal.macros.proteinG }}</p>
              <p class="text-sm text-red-800 dark:text-red-300">г уураг</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ meal.macros.carbsG }}</p>
              <p class="text-sm text-green-800 dark:text-green-300">г нүүрс ус</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ meal.macros.fatG }}</p>
              <p class="text-sm text-amber-800 dark:text-amber-300">г өөх тос</p>
            </div>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { GeneratedMeal } from '~/types'

const props = defineProps<{
  meal: GeneratedMeal
  isRegenerating?: boolean
}>()

const emit = defineEmits<{
  regenerate: [mealId: string]
}>()

const showDetails = ref(false)

// Computed properties
const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    'breakfast': 'Өглөө',
    'lunch': 'Үдэш',
    'dinner': 'Орой',
    'snack': 'Үдийн хоол'
  }
  return labels[props.meal.category] || props.meal.category
})

const categoryBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    'breakfast': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'lunch': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'dinner': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'snack': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  }
  return classes[props.meal.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
})

const difficultyLabel = computed(() => {
  const labels: Record<string, string> = {
    'easy': 'Амархан',
    'medium': 'Дунд',
    'hard': 'Хүнд'
  }
  return labels[props.meal.difficulty as string] || ''
})

const keyIngredients = computed(() => {
  // Show up to 3 essential ingredients
  return props.meal.ingredients
    .filter(ingredient => ingredient.essential)
    .slice(0, 3)
})

// Actions
function viewDetails() {
  showDetails.value = true
}

function regenerate() {
  emit('regenerate', props.meal.id)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>