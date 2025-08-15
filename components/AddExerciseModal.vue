<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Add Custom Exercise</h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Content -->
        <form @submit.prevent="addExercise" class="p-6 space-y-4">
          <!-- Exercise Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Exercise Name *
            </label>
            <input
              v-model="exerciseData.name"
              type="text"
              required
              placeholder="e.g., Bulgarian Split Squat"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Mongolian Name (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mongolian Name (Optional)
            </label>
            <input
              v-model="exerciseData.mongolianName"
              type="text"
              placeholder="e.g., Болгар хувах скуат"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              v-model="exerciseData.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="compound">Compound</option>
              <option value="lowerBody">Lower Body</option>
              <option value="upperBodyPush">Upper Body - Push</option>
              <option value="upperBodyPull">Upper Body - Pull</option>
              <option value="core">Core</option>
            </select>
          </div>

          <!-- Description (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              v-model="exerciseData.description"
              rows="3"
              placeholder="Brief description of the exercise..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Muscle Groups -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Primary Muscle Groups
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="muscle in muscleGroups"
                :key="muscle"
                type="button"
                @click="toggleMuscleGroup(muscle)"
                :class="[
                  'px-3 py-1 rounded-full text-xs border',
                  exerciseData.muscleGroups.includes(muscle)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ muscle }}
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!isValid"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exercise } from '~/types'

interface Emits {
  close: []
  exerciseAdded: [exercise: Exercise]
}

const emit = defineEmits<Emits>()

// Available muscle groups
const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 
  'Core', 'Forearms', 'Traps'
]

// State
const exerciseData = reactive({
  name: '',
  mongolianName: '',
  category: '' as Exercise['category'] | '',
  description: '',
  muscleGroups: [] as string[]
})

// Computed
const isValid = computed(() => {
  return exerciseData.name.trim() && exerciseData.category
})

// Methods
function toggleMuscleGroup(muscle: string) {
  const index = exerciseData.muscleGroups.indexOf(muscle)
  if (index > -1) {
    exerciseData.muscleGroups.splice(index, 1)
  } else {
    exerciseData.muscleGroups.push(muscle)
  }
}

function addExercise() {
  if (!isValid.value) return

  const newExercise: Exercise = {
    id: Date.now().toString(), // In real app, this would be generated by Firestore
    name: exerciseData.name.trim(),
    mongolianName: exerciseData.mongolianName.trim() || undefined,
    category: exerciseData.category as Exercise['category'],
    description: exerciseData.description.trim() || undefined,
    muscleGroups: exerciseData.muscleGroups.length > 0 ? exerciseData.muscleGroups : undefined,
    isCustom: true,
    createdBy: 'current-user-id' // Would come from auth store
  }

  emit('exerciseAdded', newExercise)
}
</script>