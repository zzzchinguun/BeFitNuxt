<template>
    <section id="testimonials" class="py-16 lg:py-24 bg-[var(--color-bg)]"
        style="background-color: var(--color-bg) !important;">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center space-y-3 reveal">
                <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight text-[var(--color-text)]">Хэрэглэгчдийн
                    сэтгэгдэл</h2>
                <p class="text-lg text-gray-300">Манай хэрэглэгчид юу гэж хэлж байна</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                <div v-for="(t, index) in items" :key="index"
                    class="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition reveal bg-surface">
                    <div class="flex items-center mb-3">
                        <div class="w-11 h-11 rounded-full bg-accent text-white grid place-items-center mr-3 font-bold">
                            {{ t.name.charAt(0) }}
                        </div>
                        <div>
                            <div class="font-semibold text-[var(--color-text)]">{{ t.name }}</div>
                        </div>
                    </div>
                    <p class="text-gray-300">“{{ t.text }}”</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    items: { type: Array, default: () => [] }
})
</script>
