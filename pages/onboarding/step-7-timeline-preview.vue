<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-4xl w-full space-y-8">
      <!-- Progress indicator -->
      <OnboardingProgress 
        :current-step="7" 
        :total-steps="8"
        @save-and-exit="saveAndExit"
      />
      
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Timeline Preview
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Here's what your journey could look like
        </p>
      </div>

      <!-- Timeline Card -->
      <TimelineCard
        v-if="timeline && plan"
        :timeline="timeline"
        :current-weight="currentWeight"
        :target-weight="plan.targetWeightKg"
        :weight-unit="weightUnit"
        :goal-type="goalType!"
      />

      <!-- Calorie preview -->
      <div v-if="caloriePreview" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white text-center mb-6">
          Daily Calorie Plan
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <!-- Current TDEE -->
          <div class="text-center">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-3">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ caloriePreview.tdee }}
              </div>
            </div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              Maintenance
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              Current TDEE
            </div>
          </div>
          
          <!-- Arrow -->
          <div class="flex items-center justify-center">
            <UIcon 
              name="i-heroicons-arrow-right" 
              class="w-8 h-8 text-gray-400 dark:text-gray-500"
            />
          </div>
          
          <!-- Target calories -->
          <div class="text-center">
            <div class="rounded-lg p-4 mb-3"
              :class="{
                'bg-red-50 dark:bg-red-900/20': goalType === 'cut',
                'bg-green-50 dark:bg-green-900/20': goalType === 'bulk',
                'bg-gray-50 dark:bg-gray-700': goalType === 'maintain'
              }"
            >
              <div class="text-2xl font-bold"
                :class="{
                  'text-red-600 dark:text-red-400': goalType === 'cut',
                  'text-green-600 dark:text-green-400': goalType === 'bulk',
                  'text-gray-600 dark:text-gray-400': goalType === 'maintain'
                }"
              >
                {{ caloriePreview.target }}
              </div>
            </div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ caloriePreview.targetLabel }}
            </div>
            <div class="text-xs"
              :class="{
                'text-red-600 dark:text-red-400': goalType === 'cut',
                'text-green-600 dark:text-green-400': goalType === 'bulk',
                'text-gray-600 dark:text-gray-400': goalType === 'maintain'
              }"
            >
              {{ caloriePreview.adjustment }}
            </div>
          </div>
        </div>
      </div>

      <!-- Key milestones -->
      <div v-if="keyMilestones.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white text-center mb-6">
          Key Milestones
        </h3>
        
        <div class="space-y-4">
          <div
            v-for="milestone in keyMilestones"
            :key="milestone.week"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {{ milestone.week }}
                </span>
              </div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ milestone.label }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ milestone.date }}
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ formatWeight(milestone.weight) }}
              </div>
              <div v-if="milestone.change" class="text-sm"
                :class="{
                  'text-red-600 dark:text-red-400': milestone.change < 0,
                  'text-green-600 dark:text-green-400': milestone.change > 0,
                  'text-gray-600 dark:text-gray-400': milestone.change === 0
                }"
              >
                {{ milestone.change > 0 ? '+' : '' }}{{ formatWeight(Math.abs(milestone.change)) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expectations and tips -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6">
        <div class="flex items-start space-x-3">
          <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1" />
          <div class="flex-1">
            <h4 class="font-semibold text-amber-900 dark:text-amber-100 mb-3">
              What to Expect
            </h4>
            <div class="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>• {{ expectationsList[0] }}</p>
              <p>• {{ expectationsList[1] }}</p>
              <p>• {{ expectationsList[2] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between pt-4">
        <UButton
          type="button"
          variant="ghost"
          @click="handlePrevious"
        >
          Previous
        </UButton>
        
        <UButton
          @click="handleNext"
          size="lg"
        >
          Next
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: []
})

const onboardingStore = useOnboardingStore()
const { t } = useI18n()

// Get data from store
const goalType = computed(() => onboardingStore.goalType)
const plan = computed(() => onboardingStore.plan)
const timeline = computed(() => onboardingStore.timeline)
const tdee = computed(() => onboardingStore.tdee)
const calorieTarget = computed(() => onboardingStore.calorieTarget)
const weightUnit = computed(() => onboardingStore.physical.weight?.unit || 'kg')

const currentWeight = computed(() => {
  if (!onboardingStore.metricPhysical) return 70
  return onboardingStore.metricPhysical.weightKg
})

// Load existing data
onMounted(() => {
  onboardingStore.loadExistingOnboarding()
})

// Calorie preview
const caloriePreview = computed(() => {
  if (!tdee.value || !calorieTarget.value || !goalType.value) return null
  
  const difference = calorieTarget.value - tdee.value
  const abseDifference = Math.abs(difference)
  
  let targetLabel = ''
  let adjustment = ''
  
  switch (goalType.value) {
    case 'cut':
      targetLabel = 'Cutting'
      adjustment = `-${abseDifference} calorie deficit`
      break
    case 'bulk':
      targetLabel = 'Bulking'
      adjustment = `+${abseDifference} calorie surplus`
      break
    case 'maintain':
      targetLabel = 'Maintaining'
      adjustment = 'No change from maintenance'
      break
  }
  
  return {
    tdee: tdee.value.toLocaleString(),
    target: calorieTarget.value.toLocaleString(),
    targetLabel,
    adjustment
  }
})

// Key milestones
const keyMilestones = computed(() => {
  if (!timeline.value || !plan.value) return []
  
  const milestones = []
  const totalWeeks = timeline.value.estimatedWeeks
  const weightChange = plan.value.targetWeightKg - currentWeight.value
  
  // Add milestones at 25%, 50%, 75%, and 100%
  const percentages = [0.25, 0.5, 0.75, 1.0]
  
  percentages.forEach((percentage, index) => {
    const weeks = Math.round(totalWeeks * percentage)
    const weight = currentWeight.value + (weightChange * percentage)
    const changeFromStart = weight - currentWeight.value
    
    const date = new Date()
    date.setDate(date.getDate() + (weeks * 7))
    
    let label = ''
    if (percentage === 1.0) {
      label = 'Goal Reached'
    } else {
      label = `Week ${weeks}`
    }
    
    milestones.push({
      week: weeks,
      label,
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight,
      change: changeFromStart
    })
  })
  
  return milestones
})

// Expectations based on goal
const expectationsList = computed(() => {
  if (!goalType.value) return []
  
  switch (goalType.value) {
    case 'cut':
      return [
        'Initial weight loss may be faster due to water weight',
        'Progress may slow down as you get leaner - this is normal',
        'Focus on strength training to preserve muscle mass'
      ]
    case 'bulk':
      return [
        'Initial gains may include water weight and muscle glycogen',
        'Muscle growth takes time - be patient and consistent',
        'Some fat gain is normal during a controlled bulk'
      ]
    case 'maintain':
      return [
        'Weight may fluctuate within 2-3 lbs due to normal factors',
        'Focus on body composition rather than just the scale',
        'Consistency is key for long-term maintenance'
      ]
    default:
      return []
  }
})

function formatWeight(weightKg: number): string {
  if (weightUnit.value === 'lb') {
    return `${Math.round(weightKg * 2.20462 * 10) / 10}lb`
  }
  return `${Math.round(weightKg * 10) / 10}kg`
}

function handleNext() {
  onboardingStore.nextStep()
  navigateTo('/onboarding/step-8-macros')
}

function handlePrevious() {
  onboardingStore.previousStep()
  
  // Go back to appropriate step based on goal
  if (goalType.value === 'maintain') {
    navigateTo('/onboarding/step-5-goal')
  } else {
    navigateTo('/onboarding/step-6-goal-weight-and-pace')
  }
}

function saveAndExit() {
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Timeline Preview - BeFit Onboarding'
})
</script>