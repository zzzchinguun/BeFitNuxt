<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader title="Exercises" />
    
    <!-- Date Navigation -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <button @click="previousDay" class="p-2 text-gray-600 hover:text-gray-900">
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>
        <h2 class="font-semibold text-gray-900">{{ formatDate(selectedDate) }}</h2>
        <button @click="nextDay" class="p-2 text-gray-600 hover:text-gray-900" :disabled="!canGoToNextDay">
          <Icon name="heroicons:chevron-right" class="w-5 h-5" :class="{ 'opacity-50': !canGoToNextDay }" />
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ dailyStats.exercises }}</div>
          <div class="text-sm text-gray-600">Exercises</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ dailyStats.volume }}kg</div>
          <div class="text-sm text-gray-600">Volume</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ dailyStats.duration }}min</div>
          <div class="text-sm text-gray-600">Duration</div>
        </div>
      </div>
    </div>

    <!-- Exercise Categories -->
    <div class="p-4">
      <div class="flex space-x-2 mb-4 overflow-x-auto">
        <button
          v-for="category in exerciseCategories"
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="[
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium',
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Exercise List -->
      <div class="space-y-3">
        <ExerciseCard
          v-for="exercise in filteredExercises"
          :key="exercise.id"
          :exercise="exercise"
          :recent-logs="getRecentLogs(exercise.id)"
          @log-workout="openWorkoutLogger(exercise)"
        />
      </div>

      <!-- Add Custom Exercise Button -->
      <button
        @click="showAddExerciseModal = true"
        class="w-full mt-6 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        <span>Add Custom Exercise</span>
      </button>
    </div>

    <!-- Workout Logger Modal -->
    <WorkoutLoggerModal
      v-if="showWorkoutLogger"
      :exercise="selectedExercise"
      :date="selectedDate"
      @close="closeWorkoutLogger"
      @workout-logged="onWorkoutLogged"
    />

    <!-- Add Exercise Modal -->
    <AddExerciseModal
      v-if="showAddExerciseModal"
      @close="showAddExerciseModal = false"
      @exercise-added="onExerciseAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { format, addDays, subDays, isToday, isFuture } from 'date-fns'
import type { Exercise, WorkoutLog } from '~/types'

definePageMeta({
  middleware: 'auth'
})

// Sample exercise data (in real app, this would come from a store)
const exerciseCategories = [
  { id: 'all', name: 'All' },
  { id: 'compound', name: 'Compound' },
  { id: 'lowerBody', name: 'Lower Body' },
  { id: 'upperBodyPush', name: 'Push' },
  { id: 'upperBodyPull', name: 'Pull' },
  { id: 'core', name: 'Core' },
  { id: 'custom', name: 'Custom' }
]

const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Deadlift',
    category: 'compound',
    isCustom: false,
    createdBy: null,
    mongolianName: 'Үндсэн таталт'
  },
  {
    id: '2',
    name: 'Back Squat',
    category: 'compound',
    isCustom: false,
    createdBy: null,
    mongolianName: 'Үндсэн суулт'
  },
  {
    id: '3',
    name: 'Bench Press',
    category: 'compound',
    isCustom: false,
    createdBy: null,
    mongolianName: 'Цээж шахах'
  },
  {
    id: '4',
    name: 'Pull-Up',
    category: 'upperBodyPull',
    isCustom: false,
    createdBy: null,
    mongolianName: 'Суниах'
  },
  {
    id: '5',
    name: 'Overhead Press',
    category: 'upperBodyPush',
    isCustom: false,
    createdBy: null,
    mongolianName: 'Штанг дээшээ түлхэх'
  }
]

// State
const selectedDate = ref(new Date())
const selectedCategory = ref('all')
const showWorkoutLogger = ref(false)
const showAddExerciseModal = ref(false)
const selectedExercise = ref<Exercise | null>(null)
const customExercises = ref<Exercise[]>([])
const workoutLogs = ref<WorkoutLog[]>([])

// Computed
const canGoToNextDay = computed(() => !isFuture(addDays(selectedDate.value, 1)))

const allExercises = computed(() => [...defaultExercises, ...customExercises.value])

const filteredExercises = computed(() => {
  if (selectedCategory.value === 'all') {
    return allExercises.value
  }
  return allExercises.value.filter(exercise => exercise.category === selectedCategory.value)
})

const dailyStats = computed(() => {
  const dateStr = format(selectedDate.value, 'yyyy-MM-dd')
  const todaysLogs = workoutLogs.value.filter(log => log.date === dateStr)
  
  return {
    exercises: todaysLogs.length,
    volume: Math.round(todaysLogs.reduce((sum, log) => sum + log.totalVolume, 0)),
    duration: Math.round(todaysLogs.reduce((sum, log) => sum + (log.durationMin || 0), 0))
  }
})

// Methods
function formatDate(date: Date) {
  if (isToday(date)) return 'Today'
  return format(date, 'EEEE, MMM d')
}

function previousDay() {
  selectedDate.value = subDays(selectedDate.value, 1)
}

function nextDay() {
  if (!canGoToNextDay.value) return
  selectedDate.value = addDays(selectedDate.value, 1)
}

function getRecentLogs(exerciseId: string) {
  return workoutLogs.value
    .filter(log => log.exerciseId === exerciseId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
}

function openWorkoutLogger(exercise: Exercise) {
  selectedExercise.value = exercise
  showWorkoutLogger.value = true
}

function closeWorkoutLogger() {
  showWorkoutLogger.value = false
  selectedExercise.value = null
}

function onWorkoutLogged(workoutLog: WorkoutLog) {
  workoutLogs.value.push(workoutLog)
  closeWorkoutLogger()
}

function onExerciseAdded(exercise: Exercise) {
  customExercises.value.push(exercise)
  showAddExerciseModal.value = false
}

// SEO
useHead({
  title: 'Exercises - BeFit'
})
</script>