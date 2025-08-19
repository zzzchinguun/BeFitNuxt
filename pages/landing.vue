<template>
    <div>
        <LandingHero :mock-stats="mockStats" @get-started="handleGetStarted" />
        <LandingPoweredBy />
        <LandingIngredientMarquee />
        <LandingHowItWorks />
        <LandingFeatures :features="detailedFeatures" />
        <LandingTestimonials :items="testimonials" />
        <section class="relative overflow-hidden" style="background-color: var(--color-bg)">
            <div class="cta-bg" aria-hidden="true"></div>
            <div class="max-w-7xl mx-auto px-6 py-16 lg:py-24 text-center">
                <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight dark:text-white reveal">Өнөөдрөөс эхлээрэй
                </h2>
                <p class="text-lg text-gray-700 dark:text-gray-300 mt-3 reveal">Эрүүл амьдралын аялал тань эндээс</p>
                <div class="mt-8 reveal">
                    <UButton size="xl"
                        class="px-10 py-4 rounded-2xl bg-accent text-white hover:brightness-110 transition"
                        @click="handleGetStarted">
                        <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 mr-2" /> Үнэгүй эхлэх
                    </UButton>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingHowItWorks from '~/components/landing/LandingHowItWorks.vue'
import LandingFeatures from '~/components/landing/LandingFeatures.vue'
import LandingIngredientMarquee from '~/components/landing/LandingIngredientMarquee.vue'
import LandingPoweredBy from '~/components/landing/LandingPoweredBy.vue'
import LandingTestimonials from '~/components/landing/LandingTestimonials.vue'

definePageMeta({
    layout: 'landing'
})

useHead({
    title: 'BeFit - Хоол, фитнессийн ухаалаг хяналт',
    meta: [
        { name: 'description', content: 'Илчлэг, макро, дасгал — нэг дор. Хялбар бүртгэл, ойлгомжтой ахицын тойм, зорилгын уян тохиргоо.' },
        { property: 'og:title', content: 'BeFit - Nutrition tracking for your real life' },
        { property: 'og:description', content: 'Хялбар бүртгэл, ойлгомжтой ахицын тойм, зорилгын уян тохиргоо.' },
        { property: 'og:type', content: 'website' }
    ]
})

const authStore = useAuthStore()
const isAuthenticated = computed(() => {
  try {
    return authStore.isAuthenticated
  } catch (error) {
    // Firebase not available, treat as unauthenticated
    return false
  }
})

const mockStats = [
    { value: '1,572', label: 'Илчлэг', color: 'text-blue-600 dark:text-blue-400' },
    { value: '160г', label: 'Уураг', color: 'text-cyan-600 dark:text-cyan-400' },
    { value: '8,000', label: 'Алхалт', color: 'text-emerald-600 dark:text-emerald-400' },
    { value: '7.5', label: 'Унтлага', color: 'text-indigo-600 dark:text-indigo-400' }
]

const detailedFeatures = [
    { icon: 'i-heroicons-chart-pie', title: 'Макро хяналт', description: 'Өдөр бүрийн уураг, нүүрс ус, өөх тосны зорилгоо дагана.' },
    { icon: 'i-heroicons-fire', title: 'Илчлэгийн зорилго', description: 'Таны зорилгод тохирсон өдөр тутмын илчлэгийн зорилго.' },
    { icon: 'i-heroicons-sparkles', title: 'Хоолны төлөвлөгөө генераци', description: 'Хувийн тохиргоо, зорилгод тань нийцсэн хоолны цэсийг автоматаар үүсгэнэ.' },
    { icon: 'i-heroicons-shopping-cart', title: 'Автомат хүнс захиалга', description: 'Таны сонголт ба зорилгод нийцүүлэн дэлгүүрийн захиалгыг бэлтгэж өгнө.' },
    { icon: 'i-heroicons-chart-bar', title: 'Ахицын тойм', description: 'Өдөр, 7 хоногийн явцыг ойлгомжтой графикаар.' },
    { icon: 'i-heroicons-heart', title: 'Эрүүл зан үйл', description: 'Өдөр тутмын сайн зуршлаа тогтмолжуулахад тусална.' }
]

const testimonials = [
    { name: 'Болд', text: 'BeFit ашигласнаар миний хооллолт, дасгал улам зохион байгуулалттай болсон.' },
    { name: 'Сайнбаяр', text: 'Зорилгоо бодитоор тавьж, алхам алхмаар биелүүлэхэд тусалдаг.' },
    { name: 'Өлзийбаяр', text: 'Хурдан бүртгэж, өдөр бүр ахицаа харах амархан болсон.' }
]

function handleGetStarted() {
    try {
        if (isAuthenticated.value) navigateTo('/')
        else navigateTo('/auth/register')
    } catch (error) {
        // Firebase not available, redirect to register
        navigateTo('/auth/register')
    }
}
</script>

<style scoped>
.cta-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12));
}

/* Reveal on scroll */
.reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .6s ease, transform .6s ease;
}

.reveal-visible {
    opacity: 1;
    transform: translateY(0);
}
</style>
