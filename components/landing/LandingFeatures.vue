<template>
    <section id="features" class="py-16 lg:py-24" style="background-color: var(--color-bg)">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center space-y-3 reveal">
                <h2 class="text-3xl lg:text-5xl font-extrabold dark:text-white tracking-tight">Хүчирхэг боломжууд</h2>
                <p class="text-lg text-gray-600 dark:text-gray-300">Монголын хамгийн том нутриент дата сантай, дотоодын
                    хүнсний бүтээгдэхүүнээр баялаг</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                <div v-for="(feature, index) in features" :key="index"
                    class="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition reveal bg-surface">
                    <div class="w-12 h-12 rounded-xl bg-accent text-white grid place-items-center mb-4">
                        <UIcon :name="feature.icon" class="w-6 h-6" />
                    </div>
                    <h3 class="font-semibold text-xl mb-2 text-[var(--color-text)]">{{ feature.title }}</h3>
                    <p class="text-gray-300">{{ feature.description }}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    features: { type: Array, default: () => [] }
})
</script>
