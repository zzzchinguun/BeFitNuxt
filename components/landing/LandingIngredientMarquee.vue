<template>
    <section class="py-10 md:py-14" style="background-color: var(--color-bg)">
        <div class="max-w-7xl mx-auto px-6">
            <h3 class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-6 reveal">
                Танд санал болгох орц, хүнснүүд
            </h3>
        </div>
        <div class="relative overflow-hidden">
            <div class="marquee" aria-hidden="true">
                <ul class="marquee-track" :style="trackStyle">
                    <li v-for="(item, index) in repeatedItems" :key="index" class="marquee-item">
                        <NuxtImg :src="item.imageUrl" :alt="item.name" width="140" height="140" class="rounded-xl shadow-sm object-cover bg-white/40 dark:bg-gray-800/40" />
                    </li>
                </ul>
            </div>
        </div>
    </section>
 </template>

<script setup lang="ts">
import type { IngredientItem } from '~/server/api/ingredients'

// Fallback ingredients for when API fails
const fallbackItems: IngredientItem[] = [
  {
    id: '1', itemCode: null, name: 'Өндөг', type: null, categoryPath: ['Өдөр тутмын шинэ хүнс', 'Өндөг'], 
    price: '5,980₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/46d9ef6a-671a-4b49-ba1d-c9626bac87aa.jpg'
  },
  {
    id: '2', itemCode: null, name: 'Тараг', type: null, categoryPath: ['Өдөр тутмын шинэ хүнс', 'Сүү'], 
    price: '5,330₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/6d85b7eb-6956-4822-885f-a4ab0f282d0b.jpg'
  },
  {
    id: '3', itemCode: null, name: 'Зөөхий', type: null, categoryPath: ['Өдөр тутмын шинэ хүнс', 'Сүү'], 
    price: '10,350₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/360603ba-4aac-40c8-9068-1349decb9e2d.jpg'
  },
  {
    id: '4', itemCode: null, name: 'Талх', type: null, categoryPath: ['Өдөр тутмын шинэ хүнс', 'Талх'], 
    price: '3,400₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/d00518d5-61c8-4cb9-a9f8-3e75d007e5ef.JPG'
  },
  {
    id: '5', itemCode: null, name: 'Цөцгийн тос', type: null, categoryPath: ['Өдөр тутмын шинэ хүнс', 'Сүү'], 
    price: '14,580₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/ba32135c-4b85-48b3-a4e6-35ba1628fdd7.jpg'
  },
  {
    id: '6', itemCode: null, name: 'Шар будаа', type: null, categoryPath: ['Боловсруулсан хүнс', 'Будаа'], 
    price: '6,550₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/c2f9d6a5-b2f0-4136-8998-8073ffd99abd.jpg'
  },
  {
    id: '7', itemCode: null, name: 'Цагаан будаа', type: null, categoryPath: ['Боловсруулсан хүнс', 'Будаа'], 
    price: '7,300₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/9d687db3-8067-4bef-be0b-d65ddcc22ff3.jpg'
  },
  {
    id: '8', itemCode: null, name: 'Арвайн гурил', type: null, categoryPath: ['Боловсруулсан хүнс', 'Гурил'], 
    price: '12,550₮', isPopular: true, imageUrl: 'https://cdn.emartmall.mn/Resource/medium/dd5d34be-70ec-4d39-a7ee-b24b64a7391a.jpg'
  }
]

const { data, error } = await useFetch<{ count: number; items: IngredientItem[] }>(
  '/api/ingredients',
  { 
    query: { popular: 'true', limit: '60', onlyWithImage: 'true' },
    server: false, // Client-side only to avoid SSR issues
    default: () => ({ count: 0, items: [] }),
    lazy: true // Load lazily to prevent SSR issues
  }
)

const items = computed(() => {
  // Use API data if available, otherwise fallback items
  const apiItems = data.value?.items ?? []
  return apiItems.length > 0 ? apiItems : fallbackItems
})

// Duplicate the list to create seamless infinite scroll
const repeatedItems = computed(() => [...items.value, ...items.value])

const trackStyle = computed(() => ({
  '--marquee-items': repeatedItems.value.length.toString()
}))
</script>

<style scoped>
.marquee {
    position: relative;
    width: 100%;
}

.marquee-track {
    display: flex;
    gap: 16px;
    width: max-content;
    animation: marquee-scroll 25s linear infinite;
    will-change: transform;
    padding: 8px 0;
}

.marquee-item {
    flex: 0 0 auto;
    width: 140px;
    height: 140px;
}

@keyframes marquee-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-50%)); }
}

/* Pause on hover for accessibility */
.marquee:hover .marquee-track {
    animation-play-state: paused;
}
</style>


