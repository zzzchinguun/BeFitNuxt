<template>
    <section id="how" class="py-16 lg:py-24" style="background-color: var(--color-bg)">
        <div class="max-w-7xl mx-auto px-6 text-center space-y-3 reveal">
            <h2 class="text-3xl lg:text-5xl font-extrabold dark:text-white tracking-tight">Зорилгоо 1-2-3 алхмаар</h2>
            <p class="text-lg text-gray-600 dark:text-white">Илүү хурдан бүртгэж, илүү ухаалаг хянаарай</p>
        </div>
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6 mt-10">
            <div class="card-step reveal bg-surface">
                <div class="step-index">1</div>
                <h3 class="step-title text-[var(--color-text)]">Хоол, макрог бүртгэх</h3>
                <p class="step-text">Хоол хайх, баркод скан, дуу хоолойгоор бүртгэх.</p>
            </div>
            <div class="card-step reveal bg-surface">
                <div class="step-index">2</div>
                <h3 class="step-title text-[var(--color-text)]">Ахиц дэвшлээ дагах</h3>
                <p class="step-text">Өдөр, долоо хоногийн тойм болон трендүүд.</p>
            </div>
            <div class="card-step reveal bg-surface">
                <div class="step-index">3</div>
                <h3 class="step-title text-[var(--color-text)]">Илүү сайн идэх</h3>
                <p class="step-text">Тохируулсан макро, зөвлөмжтэйгээр зорилгодоо хүр.</p>
            </div>
        </div>
    </section>
</template>

<style scoped>
.card-step {
    @apply rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center hover:shadow-lg transition;
}

.step-index {
    @apply w-10 h-10 rounded-full text-white grid place-items-center mx-auto font-bold mb-3;
    background-color: var(--color-accent);
}

.step-title {
    @apply font-semibold text-lg;
}

.step-text {
    @apply text-gray-600 dark:text-gray-300;
}
</style>
