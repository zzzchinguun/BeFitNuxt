<template>
    <section class="relative" style="background-color: var(--color-bg);">
        <div class="max-w-7xl mx-auto px-6 pt-10 pb-12 lg:pt-16 lg:pb-16 grid lg:grid-cols-2 gap-10 items-center">
            <div class="space-y-6">
                <div
                    class="inline-flex items-center px-3 py-1 rounded-full bg-accent/15 text-[var(--color-text)] text-sm font-medium reveal">
                    <UIcon name="i-heroicons-sparkles" class="w-4 h-4 mr-2" /> Хоол, фитнессийн ухаалаг хяналт
                </div>
                <h1
                    class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-text)] reveal">
                    Эрүүл амьдрал — энгийнээр
                </h1>
                <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl reveal">
                    Илчлэг, макро, дасгал — нэг дор. Хялбар бүртгэл, ойлгомжтой ахицын тойм, зорилгын уян тохиргоо.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 pt-2 reveal">
                    <UButton size="xl"
                        class="px-8 py-4 rounded-2xl bg-accent text-white hover:brightness-110 transition"
                        @click="handleGetStarted">
                        <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 mr-2" /> Эхлэх
                    </UButton>
                    <UButton size="xl" variant="outline"
                        class="px-8 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        @click="scrollTo('#how')">
                        <UIcon name="i-heroicons-play" class="w-5 h-5 mr-2" /> Танилцах
                    </UButton>
                </div>
                <div class="flex items-center gap-6 pt-2 reveal">
                    <div class="text-sm text-gray-600 dark:text-gray-300">Хялбар бүртгэл</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">Ойлгомжтой тойм</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">Зорилгын уян тохиргоо</div>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-300 reveal">
                    Монголын дотоодын хүнсний бүтээгдэхүүний хамгийн том нутриент дата сантай. Хоолны төлөвлөгөөг
                    автоматаар үүсгэж, таны тохиргоо ба зорилгод нийцүүлэн хүнсийг тань захиална.
                </p>
            </div>

            <div class="relative mx-auto w-[320px] h-[560px] reveal">
                <div
                    class="absolute inset-0 rounded-[2.5rem] bg-black shadow-[0_30px_80px_-30px_rgba(5,132,255,0.35)] border border-white/10">
                </div>
                <div class="absolute inset-2 rounded-[2rem] bg-white dark:bg-[#0b0b0b] overflow-hidden">
                    <UCarousel class="h-full" :items="screens" :ui="{ item: 'w-full h-full' }" arrows
                        :autoplay="{ delay: 3500 }" loop>
                        <template #default="{ item }">
                            <NuxtImg :src="item.src" alt="App preview" class="w-full h-full object-cover" />
                        </template>
                    </UCarousel>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const emit = defineEmits(['get-started'])
const props = defineProps({
    mockStats: { type: Array, default: () => [] }
})

const screens = [
    { src: '/images/landing/Frame-813.jpg' },
    { src: '/images/landing/Frame-814.jpg' },
    { src: '/images/landing/Frame-815.jpg' },
    { src: '/images/landing/Frame-816.jpg' },
    { src: '/images/landing/Frame-817.jpg' },
    { src: '/images/landing/Frame-818.jpg' },
    { src: '/images/landing/Frame-819.jpg' },
    { src: '/images/landing/Frame-820.jpg' },
]

function handleGetStarted() {
    emit('get-started')
}

function scrollTo(selector) {
    const el = document.querySelector(selector)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped></style>
