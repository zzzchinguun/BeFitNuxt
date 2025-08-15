<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ exercise.name }}</h2>
            <p class="text-sm text-gray-600">{{ formatDate(date) }}</p>
          </div>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <!-- Sets -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-900">Sets</h3>
            
            <div class="space-y-3">
              <div
                v-for="(set, index) in sets"
                :key="index"
                class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {{ index + 1 }}
                </div>
                
                <div class="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      v-model.number="set.weight"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                    <input
                      v-model.number="set.reps"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div class="flex-shrink-0 flex items-center space-x-2">
                  <button
                    @click="set.isCompleted = !set.isCompleted"
                    :class="[
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      set.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    ]"
                  >
                    <Icon v-if="set.isCompleted" name="heroicons:check" class="w-3 h-3" />
                  </button>
                  
                  <button
                    v-if="sets.length > 1"
                    @click="removeSet(index)"
                    class="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Set Button -->
            <button
              @click="addSet"
              class="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2"
            >
              <Icon name="heroicons:plus" class="w-4 h-4" />
              <span>Add Set</span>
            </button>
          </div>

          <!-- Notes -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              v-model="notes"
              rows="3"
              placeholder="How did this workout feel? Any observations?"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Workout Summary -->
          <div v-if="completedSets.length > 0" class="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Workout Summary</h4>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-lg font-bold text-gray-900">{{ completedSets.length }}</div>
                <div class="text-xs text-gray-600">Sets</div>
              </div>
              <div>
                <div class="text-lg font-bold text-blue-600">{{ totalVolume }}kg</div>
                <div class="text-xs text-gray-600">Volume</div>
              </div>
              <div>
                <div class="text-lg font-bold text-green-600">{{ totalReps }}</div>
                <div class="text-xs text-gray-600">Reps</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            @click="$emit('close')"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveWorkout"
            :disabled="completedSets.length === 0 || saving"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <div v-if="saving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>{{ saving ? 'Saving...' : 'Save Workout' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { Exercise, WorkoutLog, WorkoutSet } from '~/types'

interface Props {
  exercise: Exercise
  date: Date
}

interface Emits {
  close: []
  workoutLogged: [workoutLog: WorkoutLog]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const sets = ref<WorkoutSet[]>([
  { reps: 0, weight: 0, isCompleted: false }
])
const notes = ref('')
const saving = ref(false)

// Computed
const completedSets = computed(() => sets.value.filter(set => set.isCompleted))

const totalVolume = computed(() => {
  return Math.round(completedSets.value.reduce((sum, set) => sum + (set.reps * set.weight), 0))
})

const totalReps = computed(() => {
  return completedSets.value.reduce((sum, set) => sum + set.reps, 0)
})

// Methods
function formatDate(date: Date) {
  return format(date, 'EEEE, MMM d, yyyy')
}

function addSet() {
  // Copy weight from previous set if available
  const lastSet = sets.value[sets.value.length - 1]
  sets.value.push({
    reps: 0,
    weight: lastSet?.weight || 0,
    isCompleted: false
  })
}

function removeSet(index: number) {
  if (sets.value.length > 1) {
    sets.value.splice(index, 1)
  }
}

async function saveWorkout() {
  if (completedSets.value.length === 0) return

  saving.value = true
  
  try {
    const workoutLog: WorkoutLog = {
      id: Date.now().toString(), // In real app, this would be generated by Firestore
      userId: 'current-user-id', // Would come from auth store
      exerciseId: props.exercise.id,
      exerciseName: props.exercise.name,
      date: format(props.date, 'yyyy-MM-dd'),
      sets: completedSets.value,
      notes: notes.value || undefined,
      totalVolume: totalVolume.value,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('workoutLogged', workoutLog)
  } catch (error) {
    console.error('Error saving workout:', error)
  } finally {
    saving.value = false
  }
}
</script>