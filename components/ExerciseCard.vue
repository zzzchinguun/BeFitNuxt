<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900">{{ exercise.name }}</h3>
        <p v-if="exercise.mongolianName" class="text-sm text-gray-500">{{ exercise.mongolianName }}</p>
        <div class="mt-1 flex items-center space-x-2">
          <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
            {{ exercise.category.replace(/([A-Z])/g, ' $1').trim() }}
          </span>
          <span v-if="exercise.isCustom" class="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
            Custom
          </span>
        </div>

        <!-- Recent Performance -->
        <div v-if="recentLogs.length > 0" class="mt-3">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Recent Performance</h4>
          <div class="space-y-1">
            <div 
              v-for="(log, index) in recentLogs.slice(0, 2)" 
              :key="log.id"
              class="text-xs text-gray-600"
            >
              <span class="font-medium">{{ formatDate(log.date) }}</span>: 
              {{ log.sets.length }} sets, {{ Math.round(log.totalVolume) }}kg volume
            </div>
          </div>
        </div>

        <!-- No logs message -->
        <div v-else class="mt-3 text-sm text-gray-500">
          No recent workouts
        </div>
      </div>

      <!-- Action Button -->
      <button
        @click="$emit('logWorkout')"
        class="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
      >
        Log Workout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, isToday, isYesterday } from 'date-fns'
import type { Exercise, WorkoutLog } from '~/types'

interface Props {
  exercise: Exercise
  recentLogs: WorkoutLog[]
}

interface Emits {
  logWorkout: []
}

defineProps<Props>()
defineEmits<Emits>()

function formatDate(dateString: string) {
  const date = new Date(dateString)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d')
}
</script>