<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Your Journey Timeline
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Estimated timeline to reach your goal based on your selected pace.
      </p>
    </div>
    
    <!-- Summary stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ Math.round(timeline.estimatedWeeks) }}
        </div>
        <div class="text-sm text-blue-800 dark:text-blue-200">
          Weeks
        </div>
      </div>
      
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ formatWeight(Math.abs(weightChange)) }}
        </div>
        <div class="text-sm text-green-800 dark:text-green-200">
          {{ weightChangeDirection }}
        </div>
      </div>
      
      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ formatDate(timeline.finishDate) }}
        </div>
        <div class="text-sm text-purple-800 dark:text-purple-200">
          Target Date
        </div>
      </div>
    </div>
    
    <!-- Visual timeline -->
    <div class="space-y-4">
      <h4 class="font-semibold text-gray-900 dark:text-white">
        Progress Visualization
      </h4>
      
      <div class="relative">
        <!-- Timeline line -->
        <div class="absolute top-6 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
        
        <!-- Milestone markers -->
        <div class="flex justify-between items-start relative">
          <div
            v-for="(milestone, index) in displayMilestones"
            :key="index"
            class="flex flex-col items-center"
          >
            <!-- Marker dot -->
            <div 
              class="w-3 h-3 rounded-full border-2 bg-white dark:bg-gray-800 z-10"
              :class="{
                'border-blue-500': index === 0,
                'border-green-500': index === displayMilestones.length - 1,
                'border-gray-300 dark:border-gray-600': index > 0 && index < displayMilestones.length - 1
              }"
            ></div>
            
            <!-- Milestone info -->
            <div class="mt-2 text-center">
              <div class="text-xs font-medium text-gray-900 dark:text-white">
                {{ milestone.label }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ formatWeight(milestone.weight) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500">
                {{ milestone.date }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Monthly breakdown -->
    <div v-if="monthlyBreakdown.length > 0" class="space-y-3">
      <h4 class="font-semibold text-gray-900 dark:text-white">
        Monthly Breakdown
      </h4>
      
      <div class="space-y-2">
        <div
          v-for="month in monthlyBreakdown"
          :key="month.month"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ month.label }}
            </span>
          </div>
          
          <div class="text-right">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatWeight(month.targetWeight) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ month.change > 0 ? '+' : '' }}{{ formatWeight(month.change) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Important notes -->
    <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
      <div class="flex items-start space-x-2">
        <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div class="text-sm text-amber-800 dark:text-amber-200">
          <div class="font-medium mb-1">Important Notes</div>
          <ul class="space-y-1 text-xs">
            <li>• This is an estimate - actual results may vary</li>
            <li>• Weight loss/gain is rarely linear and may include plateaus</li>
            <li>• Consistency with diet and exercise is key to success</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  timeline: {
    estimatedWeeks: number
    finishDate: Date
  }
  currentWeight: number
  targetWeight: number
  weightUnit: 'kg' | 'lb'
  goalType: 'cut' | 'bulk' | 'maintain'
}

const props = defineProps<Props>()


const weightChange = computed(() => props.targetWeight - props.currentWeight)

const weightChangeDirection = computed(() => {
  if (Math.abs(weightChange.value) < 0.1) {
    return 'Weight to maintain'
  }
  return weightChange.value > 0 
    ? 'Weight to gain'
    : 'Weight to lose'
})

// Generate milestone markers for visualization
const displayMilestones = computed(() => {
  const milestones = []
  const totalWeeks = props.timeline.estimatedWeeks
  const intervals = Math.min(5, Math.max(3, Math.ceil(totalWeeks / 4))) // 3-5 markers
  
  for (let i = 0; i <= intervals - 1; i++) {
    const progress = i / (intervals - 1)
    const weeks = progress * totalWeeks
    const weight = props.currentWeight + (weightChange.value * progress)
    const date = new Date()
    date.setDate(date.getDate() + (weeks * 7))
    
    let label: string
    if (i === 0) {
      label = 'Start'
    } else if (i === intervals - 1) {
      label = 'Goal'
    } else {
      label = `${Math.round(weeks)}w`
    }
    
    milestones.push({
      label,
      weight,
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      progress
    })
  }
  
  return milestones
})

// Generate monthly breakdown
const monthlyBreakdown = computed(() => {
  const months = []
  const totalWeeks = props.timeline.estimatedWeeks
  const monthsToShow = Math.min(6, Math.ceil(totalWeeks / 4))
  
  for (let month = 1; month <= monthsToShow; month++) {
    const weeks = month * 4
    const progress = Math.min(1, weeks / totalWeeks)
    const targetWeight = props.currentWeight + (weightChange.value * progress)
    const monthChange = month === 1 
      ? targetWeight - props.currentWeight
      : targetWeight - (props.currentWeight + (weightChange.value * ((month - 1) * 4 / totalWeeks)))
    
    const date = new Date()
    date.setMonth(date.getMonth() + month)
    
    months.push({
      month,
      label: date.toLocaleDateString(undefined, { month: 'long' }),
      targetWeight,
      change: monthChange
    })
  }
  
  return months
})

function formatWeight(weight: number): string {
  const rounded = Math.round(weight * 10) / 10
  return `${rounded}${props.weightUnit}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}
</script>