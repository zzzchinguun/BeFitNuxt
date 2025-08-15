<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
        {{ label }}
      </h3>
      <div class="text-xs text-gray-500 dark:text-gray-500">
        {{ Math.round(percentage) }}%
      </div>
    </div>
    
    <div class="mb-3">
      <div class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ Math.round(consumed) }}<span class="text-sm font-normal">{{ unit }}</span>
      </div>
      <div class="text-xs text-gray-600 dark:text-gray-400">
        of {{ Math.round(goal) }}{{ unit }}
      </div>
    </div>
    
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        class="h-2 rounded-full transition-all duration-300"
        :class="progressColorClass"
        :style="{ width: `${Math.min(percentage, 100)}%` }"
      />
    </div>
    
    <div v-if="remaining > 0" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
      {{ Math.round(remaining) }}{{ unit }} remaining
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  consumed: number
  goal: number
  percentage: number
  color: 'blue' | 'red' | 'green' | 'yellow'
  unit: string
}

const props = defineProps<Props>()

const remaining = computed(() => Math.max(0, props.goal - props.consumed))

const progressColorClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-500',
    red: 'bg-red-500', 
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  }
  return colorMap[props.color]
})
</script>