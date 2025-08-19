<template>
  <div class="min-h-screen" style="background-color: var(--color-bg);">
    <!-- Clean, minimal layout inspired by landing page -->
    <main class="w-full">
      <slot />
    </main>
    
    <!-- Optional loading overlay for generation process -->
    <div 
      v-if="isGenerating" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center">
        <div class="w-16 h-16 mx-auto mb-4 relative">
          <div class="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-600"></div>
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Хоолны төлөвлөгөө үүсгэж байна...
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Таны макро зорилгод тохирсон амттай хоолнууд сонгож байна
        </p>
        <div class="mt-4 flex justify-center space-x-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Global state for meal generation process
const isGenerating = useState('mealGeneration.isGenerating', () => false)

// Set page characteristics
useHead({
  bodyAttrs: {
    class: 'meal-generation-mode'
  }
})
</script>

<style scoped>
/* Use the same color palette as landing page */
:deep(.reveal) {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

:deep(.reveal-visible) {
  opacity: 1;
  transform: translateY(0);
}

/* Custom animations for meal generation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(5, 132, 255, 0.3); }
  50% { box-shadow: 0 0 30px rgba(5, 132, 255, 0.6); }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>