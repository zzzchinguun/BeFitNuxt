<template>
    <header class="sticky top-0 z-40 bg-surface backdrop-blur border-b border-gray-200/60 dark:border-gray-800/60">
        <nav class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img :src="logoSrc" alt="BeFit" class="h-10 md:h-12 w-auto" />
            </div>
            <div class="hidden md:flex items-center space-x-8">
                <button class="nav-link" @click="scrollTo('#how')">Хэрхэн ажилладаг</button>
                <button class="nav-link" @click="scrollTo('#features')">Онцлогууд</button>
                <button class="nav-link" @click="scrollTo('#testimonials')">Сэтгэгдэл</button>
            </div>
            <div v-if="!isAuthenticated" class="flex items-center space-x-3">
                <UButton variant="ghost"
                    class="text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
                    @click="navigateTo('/auth/login')">Нэвтрэх</UButton>
                <UButton class="px-5 py-2 bg-accent text-white rounded-xl hover:brightness-110 transition"
                    @click="navigateTo('/auth/register')">Бүртгүүлэх</UButton>
            </div>
            <div v-else>
                <UButton variant="solid" color="primary" @click="navigateTo('/')">Хяналтын самбар</UButton>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { computed } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

function scrollTo(selector) {
    if (import.meta.client) {
        const el = document.querySelector(selector)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

const colorMode = useColorMode?.() // if @nuxtjs/color-mode exists
const prefersDark = usePreferredDark?.() // from @vueuse/nuxt
const isDark = computed(() => {
    if (!import.meta.client) return false
    
    const byClass = document.documentElement.classList.contains('dark')
    const byColorMode = colorMode && typeof colorMode.value === 'string' ? colorMode.value === 'dark' : false
    const byMedia = prefersDark?.value === true
    return byClass || byColorMode || byMedia
})
const logoSrc = computed(() => isDark.value ? '/images/brand/Dark-Logo.svg' : '/images/brand/Light-Logo.svg')
</script>

<style scoped>
.nav-link {
    color: var(--color-text);
    transition: color .2s ease;
}

.nav-link:hover {
    color: var(--color-accent);
}
</style>
