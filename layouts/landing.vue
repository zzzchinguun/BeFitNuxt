<template>
    <div class="min-h-screen" style="background-color: var(--color-bg); color: var(--color-text)">
        <LandingHeader />
        <main>
            <slot />
        </main>
    </div>

</template>

<script setup>
import { onMounted } from 'vue'

// Attach a single IntersectionObserver for reveal animations
import { useReveal } from '~/composables/useReveal'

onMounted(() => {
    useReveal()
})
</script>

<style scoped></style>
