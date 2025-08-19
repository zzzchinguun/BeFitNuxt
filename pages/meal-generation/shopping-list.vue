<template>
  <div class="min-h-screen"
    style="background: linear-gradient(135deg, var(--color-bg) 0%, rgba(5, 132, 255, 0.05) 100%);">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="text-center mb-8 reveal">
        <div
          class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-shopping-cart" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Дэлгүүрийн жагсаалт
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Таны хоолны төлөвлөгөөний бүх орцнууд
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap justify-center gap-4 mb-8 reveal">
        <UButton @click="printList" variant="outline" class="rounded-xl px-6">
          <UIcon name="i-heroicons-printer" class="w-4 h-4 mr-2" />
          Хэвлэх
        </UButton>

        <UButton @click="shareList" variant="outline" class="rounded-xl px-6">
          <UIcon name="i-heroicons-share" class="w-4 h-4 mr-2" />
          Хуваалцах
        </UButton>

        <UButton @click="toggleAllItems" variant="soft" class="rounded-xl px-6">
          <UIcon name="i-heroicons-check" class="w-4 h-4 mr-2" />
          {{ allChecked ? 'Бүгдийг цэвэрлэх' : 'Бүгдийг тэмдэглэх' }}
        </UButton>
      </div>

      <!-- Shopping List by Category -->
      <div class="space-y-6 mb-8">
        <div v-for="category in categorizedItems" :key="category.name"
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 reveal">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <UIcon :name="category.icon" :class="['w-6 h-6 mr-3', category.color]" />
              {{ category.label }}
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ category.items.length }} зүйл
            </span>
          </div>

          <div class="space-y-3">
            <div v-for="item in category.items" :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
              @click="toggleItem(item.id)">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <input type="checkbox" :checked="item.checked"
                    class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div class="flex-1" :class="{ 'line-through text-gray-500': item.checked }">
                  <p class="font-medium text-gray-900 dark:text-white">{{ item.name }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ item.amount }} {{ item.unit }}
                    <span v-if="item.notes" class="text-gray-500">• {{ item.notes }}</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <div v-if="item.price" class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.price.toLocaleString() }}₮
                </div>
                <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 flex-shrink-0">
                  <NuxtImg v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" width="48" height="48"
                    class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div
        class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-8 reveal">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalItems }}</p>
            <p class="text-sm text-blue-800 dark:text-blue-300">Нийт зүйл</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ checkedItems }}</p>
            <p class="text-sm text-green-800 dark:text-green-300">Худалдаж авсан</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ remainingItems }}</p>
            <p class="text-sm text-orange-800 dark:text-orange-300">Үлдсэн</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ estimatedTotal }}₮</p>
            <p class="text-sm text-purple-800 dark:text-purple-300">Тооцоолсон үнэ</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 reveal">
        <UButton @click="goBack" variant="outline" size="lg" class="rounded-2xl px-8">
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-3" />
          Төлөвлөгөөлүү буцах
        </UButton>

        <UButton @click="finishShopping" size="lg"
          class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl px-8">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5 mr-3" />
          Дэлгүүр хийж дууслаа
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem } from '~/types'

definePageMeta({
  layout: 'meal-generation',
  title: 'Дэлгүүрийн жагсаалт'
})

const router = useRouter()
const mealGenerationStore = useMealGenerationStore()

// Get shopping list from store or generate if needed
const shoppingList = ref<ShoppingListItem[]>([])

onMounted(async () => {
  if (mealGenerationStore.currentShoppingList) {
    shoppingList.value = mealGenerationStore.currentShoppingList.items
  } else if (mealGenerationStore.currentMealPlan) {
    // Generate shopping list if not already generated
    const generatedList = await mealGenerationStore.generateShoppingList(mealGenerationStore.currentMealPlan)
    mealGenerationStore.currentShoppingList = generatedList
    shoppingList.value = generatedList.items
  } else {
    // Fallback: redirect to meal generation if no meal plan
    router.push('/meal-generation')
  }
})

// Category configuration
const categoryConfig = {
  protein: {
    label: 'Уураг',
    icon: 'i-heroicons-bolt',
    color: 'text-red-500'
  },
  vegetables: {
    label: 'Ногоо, жимс',
    icon: 'i-heroicons-sparkles',
    color: 'text-green-500'
  },
  carbs: {
    label: 'Нүүрс ус',
    icon: 'i-heroicons-fire',
    color: 'text-amber-500'
  },
  dairy: {
    label: 'Цагаан идээ',
    icon: 'i-heroicons-heart',
    color: 'text-blue-500'
  },
  fats: {
    label: 'Өөх тос',
    icon: 'i-heroicons-squares-2x2',
    color: 'text-purple-500'
  },
  other: {
    label: 'Бусад',
    icon: 'i-heroicons-ellipsis-horizontal',
    color: 'text-gray-500'
  }
}

// Computed properties
const categorizedItems = computed(() => {
  const categories = Object.keys(categoryConfig)
  return categories.map(categoryKey => {
    const items = shoppingList.value.filter(item => item.category === categoryKey)
    if (items.length === 0) return null

    return {
      name: categoryKey,
      ...categoryConfig[categoryKey as keyof typeof categoryConfig],
      items
    }
  }).filter((category): category is NonNullable<typeof category> => category !== null)
})

const totalItems = computed(() => shoppingList.value.length)
const checkedItems = computed(() => shoppingList.value.filter(item => item.checked).length)
const remainingItems = computed(() => totalItems.value - checkedItems.value)
const allChecked = computed(() => checkedItems.value === totalItems.value && totalItems.value > 0)

const estimatedTotal = computed(() => {
  return shoppingList.value
    .reduce((total, item) => total + (item.price || 0), 0)
    .toLocaleString()
})

// Actions
function toggleItem(itemId: string) {
  const item = shoppingList.value.find(item => item.id === itemId)
  if (item) {
    item.checked = !item.checked
  }
}

function toggleAllItems() {
  const targetState = !allChecked.value
  shoppingList.value.forEach(item => {
    item.checked = targetState
  })
}

function printList() {
  window.print()
}

function shareList() {
  const text = shoppingList.value
    .map(item => `${item.checked ? '✓' : '□'} ${item.name} - ${item.amount} ${item.unit}`)
    .join('\n')

  if (navigator.share) {
    navigator.share({
      title: 'Дэлгүүрийн жагсаалт',
      text: text
    })
  } else {
    navigator.clipboard.writeText(text)
    // TODO: Show toast notification
  }
}

function goBack() {
  router.push('/meal-generation/preview')
}

async function finishShopping() {
  // TODO: Save shopping list completion
  // Mark meal plan as completed and redirect to main app
  const authStore = useAuthStore()
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
      }, index * 100)
    })
  })
})

// Page meta
useHead({
  title: 'Дэлгүүрийн жагсаалт - BeFit',
  meta: [
    { name: 'description', content: 'Хоолны төлөвлөгөөний дэлгүүрийн жагсаалт' }
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

@media print {
  .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>