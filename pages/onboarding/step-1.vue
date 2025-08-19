<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress :current-step="1" :total-steps="6" />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Basic Information
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Let's start with your basic information
        </p>
      </div>

      <form @submit.prevent="handleNext" class="space-y-6">
        <UFormGroup label="Age" name="age">
          <UInput
            v-model.number="formData.age"
            type="number"
            min="13"
            max="120"
            required
            placeholder="25"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Height" name="height">
          <div class="flex items-center space-x-2">
            <UInput
              v-model.number="formData.height"
              type="number"
              min="120"
              max="250"
              required
              placeholder="175"
              size="lg"
              class="flex-1"
            />
            <USelect
              v-model="heightUnit"
              :options="heightUnits"
              size="lg"
              class="w-20"
            />
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {{ heightUnit === 'cm' ? 'Centimeters' : 'Inches' }}
          </p>
        </UFormGroup>

        <UFormGroup label="Weight" name="weight">
          <div class="flex items-center space-x-2">
            <UInput
              v-model.number="formData.weight"
              type="number"
              min="30"
              max="300"
              step="0.1"
              required
              placeholder="70"
              size="lg"
              class="flex-1"
            />
            <USelect
              v-model="weightUnit"
              :options="weightUnits"
              size="lg"
              class="w-20"
            />
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {{ weightUnit === 'kg' ? 'Kilograms' : 'Pounds' }}
          </p>
        </UFormGroup>

        <div class="flex justify-between pt-4">
          <UButton
            variant="ghost"
            disabled
            class="opacity-50"
          >
            Previous
          </UButton>
          
          <UButton
            type="submit"
            :disabled="!isStepValid"
            size="lg"
          >
            Next
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()

// Form data
const formData = reactive({
  age: null as number | null,
  height: null as number | null,
  weight: null as number | null
})

const heightUnit = ref('cm')
const weightUnit = ref('kg')

const heightUnits = [
  { label: 'cm', value: 'cm' },
  { label: 'in', value: 'in' }
]

const weightUnits = [
  { label: 'kg', value: 'kg' },
  { label: 'lb', value: 'lb' }
]

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
  const existing = onboardingStore.formData
  
  if (existing.age) formData.age = existing.age
  if (existing.height) formData.height = existing.height  
  if (existing.weight) formData.weight = existing.weight
})

const isStepValid = computed(() => {
  return formData.age && formData.height && formData.weight &&
         formData.age > 0 && formData.height > 0 && formData.weight > 0
})

function handleNext() {
  if (!isStepValid.value) return

  // Convert units to metric if needed
  let height = formData.height!
  let weight = formData.weight!

  if (heightUnit.value === 'in') {
    height = height * 2.54 // Convert inches to cm
  }
  
  if (weightUnit.value === 'lb') {
    weight = weight * 0.453592 // Convert pounds to kg
  }

  onboardingStore.updateFormData({
    age: formData.age!,
    height: Math.round(height),
    weight: Math.round(weight * 10) / 10 // Round to 1 decimal place
  })

  onboardingStore.nextStep()
  navigateTo('/onboarding/step-2-age-height-weight')
}
</script>