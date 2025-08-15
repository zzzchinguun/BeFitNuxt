<template>
  <div class="relative inline-flex items-center justify-center">
    <svg
      :width="size"
      :height="size"
      class="transform -rotate-90"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        stroke="currentColor"
        fill="transparent"
        class="text-gray-200 dark:text-gray-700"
      />
      
      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        stroke="currentColor"
        fill="transparent"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :class="strokeColorClass"
        class="transition-all duration-300 ease-in-out"
        stroke-linecap="round"
      />
    </svg>
    
    <!-- Content slot -->
    <div class="absolute inset-0 flex items-center justify-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: 'blue' | 'red' | 'green' | 'yellow'
}

const props = withDefaults(defineProps<Props>(), {
  size: 120,
  strokeWidth: 8,
  color: 'blue'
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const strokeDashoffset = computed(() => {
  const progress = Math.min(Math.max(props.percentage, 0), 100)
  return circumference.value - (progress / 100) * circumference.value
})

const strokeColorClass = computed(() => {
  const colorMap = {
    blue: 'text-blue-500',
    red: 'text-red-500',
    green: 'text-green-500', 
    yellow: 'text-yellow-500'
  }
  return colorMap[props.color]
})
</script>