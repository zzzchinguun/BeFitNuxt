<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="flex items-center space-x-2">
      <UInput
        :model-value="modelValue ?? undefined"
        @update:model-value="$emit('update:modelValue', $event)"
        :type="inputType"
        :min="min"
        :max="max"
        :step="step"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        size="lg"
        class="flex-1"
      />
      
      <USelect
        :model-value="unit"
        @update:model-value="$emit('update:unit', $event)"
        :options="unitOptions"
        :disabled="disabled"
        size="lg"
        class="w-20"
      />
    </div>
    
    <div v-if="showConversion && convertedValue" class="text-xs text-gray-500 dark:text-gray-400">
      {{ convertedValue }}
    </div>
    
    <div v-if="hint" class="text-xs text-gray-600 dark:text-gray-400">
      {{ hint }}
    </div>
    
    <div v-if="error" class="text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number | null
  unit: string
  unitOptions: Array<{ label: string; value: string }>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  inputType?: 'number' | 'text'
  min?: number
  max?: number
  step?: number
  showConversion?: boolean
  hint?: string
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'update:unit', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  inputType: 'number',
  step: 0.1,
  showConversion: true
})

defineEmits<Emits>()

const convertedValue = computed(() => {
  if (!props.modelValue || !props.showConversion) return null
  
  // Height conversion
  if (props.unitOptions.some(opt => opt.value === 'cm' || opt.value === 'in')) {
    if (props.unit === 'cm') {
      const inches = props.modelValue / 2.54
      return `${Math.round(inches * 10) / 10} inches`
    } else if (props.unit === 'in') {
      const cm = props.modelValue * 2.54
      return `${Math.round(cm)} cm`
    }
  }
  
  // Weight conversion
  if (props.unitOptions.some(opt => opt.value === 'kg' || opt.value === 'lb')) {
    if (props.unit === 'kg') {
      const lbs = props.modelValue * 2.20462
      return `${Math.round(lbs * 10) / 10} lbs`
    } else if (props.unit === 'lb') {
      const kg = props.modelValue / 2.20462
      return `${Math.round(kg * 10) / 10} kg`
    }
  }
  
  return null
})
</script>