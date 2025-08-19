<template>
    <section v-if="items.length > 0" class="py-10 md:py-14" style="background-color: var(--color-bg)">
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

const { data, error } = await useFetch<{ count: number; items: IngredientItem[] }>(
  '/api/ingredients',
  { 
    query: { popular: 'true', limit: '60', onlyWithImage: 'true' },
    server: false // Client-side only to avoid SSR issues
  }
)

const items = computed(() => data.value?.items ?? [])

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


