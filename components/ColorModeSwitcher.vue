<template>
  <div class="relative">
    <UButton
      :icon="currentIcon"
      variant="ghost"
      :aria-label="`Switch to ${nextMode} mode`"
      @click="toggleColorMode"
      class="color-mode-switcher"
      :class="buttonClass"
    >
      <span class="sr-only">{{ `Switch to ${nextMode} mode` }}</span>
    </UButton>
    
    <!-- Tooltip -->
    <div 
      v-if="showTooltip"
      class="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md whitespace-nowrap z-50"
    >
      {{ tooltipText }}
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  variant?: 'floating' | 'inline'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showTooltip: true,
  variant: 'inline'
})

const colorMode = useColorMode()

const currentIcon = computed(() => {
  switch (colorMode.value) {
    case 'dark':
      return 'i-heroicons-moon'
    case 'light':
      return 'i-heroicons-sun'
    default:
      return 'i-heroicons-computer-desktop'
  }
})

const nextMode = computed(() => {
  switch (colorMode.value) {
    case 'dark':
      return 'light'
    case 'light':
      return 'system'
    default:
      return 'dark'
  }
})

const tooltipText = computed(() => {
  const mode = colorMode.value
  const modeLabels = {
    'light': 'Цагаан загвар',
    'dark': 'Хар загвар', 
    'system': 'Системийн загвар'
  }
  return modeLabels[mode as keyof typeof modeLabels] || 'Toggle theme'
})

const buttonClass = computed(() => {
  const baseClass = 'transition-all duration-200 hover:scale-110'
  
  if (props.variant === 'floating') {
    return `${baseClass} fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-full p-3`
  }
  
  return baseClass
})

function toggleColorMode() {
  const modes = ['light', 'dark', 'system']
  const currentIndex = modes.indexOf(colorMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  colorMode.preference = modes[nextIndex]
}
</script>

<style scoped>
.color-mode-switcher {
  position: relative;
}

.color-mode-switcher:hover + .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Smooth icon transitions */
.color-mode-switcher svg {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.color-mode-switcher:hover svg {
  transform: rotate(180deg);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .color-mode-switcher svg {
    transition: none;
  }
  
  .color-mode-switcher:hover svg {
    transform: none;
  }
}

/* Focus states for keyboard navigation */
.color-mode-switcher:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
