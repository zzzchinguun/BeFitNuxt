<template>
  <div class="w-full">
    <!-- Header with step info and save option -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
          Step {{ currentStep }} of {{ totalSteps }}
        </span>
        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
          {{ Math.round((currentStep / totalSteps) * 100) }}%
        </span>
      </div>
      
      <UButton
        v-if="showSaveExit"
        variant="ghost"
        size="sm"
        @click="$emit('save-and-exit')"
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Save & Exit
      </UButton>
    </div>
    
    <!-- Visual step indicators -->
    <div v-if="showStepIndicators" class="flex items-center justify-between mb-4">
      <div
        v-for="step in totalSteps"
        :key="step"
        class="flex items-center"
        :class="{ 'flex-1': step < totalSteps }"
      >
        <!-- Step circle -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-200"
          :class="{
            'bg-blue-600 border-blue-600 text-white': step <= currentStep,
            'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500': step > currentStep
          }"
        >
          <UIcon
            v-if="step < currentStep"
            name="i-heroicons-check"
            class="w-4 h-4"
          />
          <span v-else>{{ step }}</span>
        </div>
        
        <!-- Connecting line -->
        <div
          v-if="step < totalSteps"
          class="flex-1 h-0.5 mx-2 transition-all duration-200"
          :class="{
            'bg-blue-600': step < currentStep,
            'bg-gray-300 dark:bg-gray-600': step >= currentStep
          }"
        />
      </div>
    </div>
    
    <!-- Progress bar -->
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>
    
    <!-- Step description -->
    <div v-if="stepDescription" class="mt-3 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ stepDescription }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number
  totalSteps: number
  showSaveExit?: boolean
  showStepIndicators?: boolean
  stepDescription?: string
}

interface Emits {
  (e: 'save-and-exit'): void
}

const props = withDefaults(defineProps<Props>(), {
  showSaveExit: true,
  showStepIndicators: true,
  totalSteps: 8
})

defineEmits<Emits>()

const progressPercentage = computed(() => {
  return Math.max(0, Math.min(100, (props.currentStep / props.totalSteps) * 100))
})
</script>