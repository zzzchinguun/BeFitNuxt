<template>
  <UModal v-model="isOpen">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Log Weight
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Weight" name="weight">
          <div class="relative">
            <UInput
              v-model="form.weight"
              type="number"
              step="0.1"
              min="0"
              max="500"
              :placeholder="authStore.user?.units.weight === 'kg' ? '70.5' : '155.3'"
              size="lg"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ authStore.user?.units.weight || 'kg' }}
              </span>
            </div>
          </div>
        </UFormGroup>

        <UFormGroup label="Date" name="date">
          <UInput
            v-model="form.date"
            type="date"
            :max="today"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Note (Optional)" name="note">
          <UTextarea
            v-model="form.note"
            :rows="3"
            placeholder="Any notes about your weight measurement..."
            size="lg"
          />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            color="gray"
            variant="outline"
            @click="isOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            :loading="loading"
            :disabled="!form.weight || !form.date"
            @click="handleSubmit"
          >
            Log Weight
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $toast } = useNuxtApp()
const authStore = useAuthStore()
const { db } = useFirebase()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const today = format(new Date(), 'yyyy-MM-dd')

const form = reactive({
  weight: '',
  date: today,
  note: ''
})

const loading = ref(false)

async function handleSubmit() {
  if (!authStore.user || !form.weight || !form.date) return

  loading.value = true

  try {
    // Import Firebase functions
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    
    const weightEntry = {
      userId: authStore.user.uid,
      date: form.date,
      weight: parseFloat(form.weight),
      note: form.note || undefined,
      createdAt: serverTimestamp()
    }

    const weightsRef = collection(db, `weights/${authStore.user.uid}/logs`)
    await addDoc(weightsRef, weightEntry)

    $toast.success('Weight logged successfully!')
    
    // Reset form
    form.weight = ''
    form.date = today
    form.note = ''
    
    isOpen.value = false
  } catch (error: any) {
    console.error('Error logging weight:', error)
    $toast.error(error.message || 'Failed to log weight')
  } finally {
    loading.value = false
  }
}

// Reset form when modal closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    form.weight = ''
    form.date = today
    form.note = ''
  }
})
</script>