<template>
  <div class="space-y-6">
    <div v-if="label" class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ label }}
      </h3>
      <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
    
    <!-- Method selection tabs -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        v-for="method in methods"
        :key="method.value"
        @click="selectMethod(method.value as 'visual' | 'tape' | 'known' | 'unknown')"
        class="p-3 rounded-lg border text-center transition-all duration-200"
        :class="{
          'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300': modelValue.method === method.value,
          'border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:border-gray-300': modelValue.method !== method.value
        }"
      >
        <UIcon :name="method.icon" class="w-5 h-5 mx-auto mb-1" />
        <div class="text-sm font-medium">{{ method.label }}</div>
      </button>
    </div>
    
    <!-- Method-specific content -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <!-- Known percentage input -->
      <div v-if="modelValue.method === 'known'" class="space-y-4">
        <UFormGroup label="Body Fat Percentage" name="bodyFatPercent">
          <UInput
            :model-value="modelValue.percent"
            @update:model-value="updatePercent"
            type="number"
            :min="genderLimits.min"
            :max="genderLimits.max"
            step="0.5"
            placeholder="15.0"
            size="lg"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">%</span>
            </template>
          </UInput>
        </UFormGroup>
        
        <div class="text-xs text-gray-600 dark:text-gray-400">
          Typical range: {{ genderLimits.min }}% - {{ genderLimits.max }}%
        </div>
      </div>
      
      <!-- Tape measurement inputs -->
      <div v-else-if="modelValue.method === 'tape'" class="space-y-4">
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Take measurements at the widest point of each body part using a tape measure.
        </div>
        
        <UFormGroup label="Waist circumference" name="waist">
          <UInput
            :model-value="modelValue.measurements?.waist"
            @update:model-value="updateMeasurement('waist', $event)"
            type="number"
            min="50"
            max="200"
            step="0.5"
            placeholder="85"
            size="lg"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">cm</span>
            </template>
          </UInput>
        </UFormGroup>
        
        <UFormGroup label="Neck circumference" name="neck">
          <UInput
            :model-value="modelValue.measurements?.neck"
            @update:model-value="updateMeasurement('neck', $event)"
            type="number"
            min="25"
            max="60"
            step="0.5"
            placeholder="38"
            size="lg"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">cm</span>
            </template>
          </UInput>
        </UFormGroup>
        
        <UFormGroup
          v-if="gender === 'female'"
          label="Hip circumference"
          name="hip"
        >
          <UInput
            :model-value="modelValue.measurements?.hip"
            @update:model-value="updateMeasurement('hip', $event)"
            type="number"
            min="70"
            max="200"
            step="0.5"
            placeholder="95"
            size="lg"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">cm</span>
            </template>
          </UInput>
        </UFormGroup>
        
        <div v-if="estimatedFromTape" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="text-sm text-blue-800 dark:text-blue-200">
            Estimated body fat: <strong>{{ estimatedFromTape }}%</strong>
          </div>
        </div>
      </div>
      
      <!-- Visual selection -->
      <div v-else-if="modelValue.method === 'visual'" class="space-y-4">
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Compare your physique to these visual references to estimate your body fat percentage.
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            v-for="(level, index) in visualLevels"
            :key="index"
            @click="selectVisualLevel(index)"
            class="p-3 rounded-lg border-2 text-center transition-all duration-200"
            :class="{
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20': visualSelection === index,
              'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-gray-300': visualSelection !== index
            }"
          >
            <div class="text-lg mb-1">{{ level.emoji }}</div>
            <div class="text-sm font-medium">{{ level.range }}</div>
            <div class="text-xs text-gray-500">{{ level.description }}</div>
          </button>
        </div>
      </div>
      
      <!-- Unknown method -->
      <div v-else-if="modelValue.method === 'unknown'" class="text-center space-y-3">
        <UIcon name="i-heroicons-question-mark-circle" class="w-12 h-12 mx-auto text-gray-400" />
        <div class="text-sm text-gray-600 dark:text-gray-400">
          We'll estimate your body fat percentage based on your height, weight, and gender.
        </div>
        <div v-if="estimatedFromBMI" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div class="text-sm text-yellow-800 dark:text-yellow-200">
            BMI-based estimate: <strong>{{ estimatedFromBMI }}%</strong>
          </div>
          <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            This is a rough estimate and may not be accurate for all body types.
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="text-sm text-red-600 dark:text-red-400 text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BodyFatInput } from '~/types'

interface Props {
  modelValue: BodyFatInput
  gender: 'male' | 'female'
  heightCm?: number
  weightKg?: number
  label?: string
  description?: string
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: BodyFatInput): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()


const methods = [
  {
    value: 'known',
    label: 'Known %',
    icon: 'i-heroicons-calculator'
  },
  {
    value: 'tape',
    label: 'Tape Measure',
    icon: 'i-heroicons-ruler'
  },
  {
    value: 'visual',
    label: 'Visual Guide',
    icon: 'i-heroicons-eye'
  },
  {
    value: 'unknown',
    label: 'Estimate',
    icon: 'i-heroicons-question-mark-circle'
  }
]

const genderLimits = computed(() => {
  return props.gender === 'male' 
    ? { min: 3, max: 50 }
    : { min: 10, max: 60 }
})

const visualLevels = computed(() => {
  if (props.gender === 'male') {
    return [
      { emoji: '💪', range: '6-10%', description: 'Athletic' },
      { emoji: '🏃', range: '11-14%', description: 'Fitness' },
      { emoji: '👤', range: '15-19%', description: 'Average' },
      { emoji: '🍔', range: '20-24%', description: 'Above Average' },
      { emoji: '🛋️', range: '25-29%', description: 'High' },
      { emoji: '⚠️', range: '30%+', description: 'Obese' }
    ]
  } else {
    return [
      { emoji: '💪', range: '14-20%', description: 'Athletic' },
      { emoji: '🏃', range: '21-24%', description: 'Fitness' },
      { emoji: '👤', range: '25-31%', description: 'Average' },
      { emoji: '🍔', range: '32-36%', description: 'Above Average' },
      { emoji: '🛋️', range: '37-41%', description: 'High' },
      { emoji: '⚠️', range: '42%+', description: 'Obese' }
    ]
  }
})

const visualSelection = ref<number | null>(null)

const estimatedFromTape = ref<number | null>(null)

// Watch for changes and calculate tape measurement
watchEffect(async () => {
  if (props.modelValue.method !== 'tape' || !props.modelValue.measurements || !props.heightCm) {
    estimatedFromTape.value = null
    return
  }
  
  const { waist, neck, hip } = props.modelValue.measurements
  if (!waist || !neck || (props.gender === 'female' && !hip)) {
    estimatedFromTape.value = null
    return
  }
  
  try {
    const { estimateBodyFatNavy } = await import('~/utils/onboarding')
    estimatedFromTape.value = estimateBodyFatNavy(waist, neck, props.heightCm, props.gender, hip)
  } catch {
    estimatedFromTape.value = null
  }
})

const estimatedFromBMI = ref<number | null>(null)

// Watch for changes and calculate BMI-based estimate
watchEffect(async () => {
  if (props.modelValue.method !== 'unknown' || !props.heightCm || !props.weightKg) {
    estimatedFromBMI.value = null
    return
  }
  
  try {
    const { estimateBodyFatFromBMI } = await import('~/utils/onboarding')
    estimatedFromBMI.value = estimateBodyFatFromBMI(props.weightKg, props.heightCm, props.gender)
  } catch {
    estimatedFromBMI.value = null
  }
})

function selectMethod(method: 'visual' | 'tape' | 'known' | 'unknown') {
  const newValue: BodyFatInput = {
    method,
    percent: method === 'known' ? props.modelValue.percent : undefined,
    measurements: method === 'tape' ? (props.modelValue.measurements || {}) : undefined
  }
  
  emits('update:modelValue', newValue)
}

function updatePercent(value: number | null) {
  if (value !== null && (value < genderLimits.value.min || value > genderLimits.value.max)) {
    return
  }
  
  emits('update:modelValue', {
    ...props.modelValue,
    percent: value || undefined
  })
}

function updateMeasurement(key: keyof NonNullable<BodyFatInput['measurements']>, value: number | null) {
  const measurements = { ...props.modelValue.measurements }
  if (value) {
    measurements[key] = value
  } else {
    delete measurements[key]
  }
  
  emits('update:modelValue', {
    ...props.modelValue,
    measurements
  })
}

async function selectVisualLevel(index: number) {
  visualSelection.value = index
  
  const { estimateBodyFatFromVisual } = await import('~/utils/onboarding')
  const estimatedPercent = estimateBodyFatFromVisual(index, props.gender)
  
  emits('update:modelValue', {
    ...props.modelValue,
    percent: estimatedPercent
  })
}

// Auto-update model when estimates change
watch(estimatedFromTape, (newValue) => {
  if (props.modelValue.method === 'tape' && newValue) {
    emits('update:modelValue', {
      ...props.modelValue,
      percent: newValue
    })
  }
})

watch(estimatedFromBMI, (newValue) => {
  if (props.modelValue.method === 'unknown' && newValue) {
    emits('update:modelValue', {
      ...props.modelValue,
      percent: newValue
    })
  }
})
</script>