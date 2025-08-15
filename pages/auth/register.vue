<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="text-center text-3xl font-bold text-gray-900 dark:text-white">
          BeFit
        </h1>
        <h2 class="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Create Account
        </h2>
      </div>
      
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-4">
          <UFormGroup label="Display Name" name="displayName">
            <UInput
              v-model="form.displayName"
              type="text"
              placeholder="Your name"
              icon="i-heroicons-user"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Email" name="email">
            <UInput
              v-model="form.email"
              type="email"
              required
              placeholder="Email"
              icon="i-heroicons-envelope"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput
              v-model="form.password"
              type="password"
              required
              placeholder="Password"
              icon="i-heroicons-lock-closed"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Confirm Password" name="confirmPassword">
            <UInput
              v-model="form.confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              icon="i-heroicons-lock-closed"
              size="lg"
            />
          </UFormGroup>
        </div>

        <UButton
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
          size="lg"
          block
          class="justify-center"
        >
          Create Account
        </UButton>

        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <NuxtLink
              to="/auth/login"
              class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Login
            </NuxtLink>
          </p>
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

const { $toast } = useNuxtApp()
const authStore = useAuthStore()

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const isFormValid = computed(() => {
  return form.email && 
         form.password && 
         form.confirmPassword &&
         form.password === form.confirmPassword &&
         form.password.length >= 6
})

async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    $toast.error('Passwords do not match')
    return
  }

  loading.value = true
  
  try {
    const result = await authStore.register(
      form.email, 
      form.password, 
      form.displayName || undefined
    )
    
    if (result.success) {
      $toast.success('Account created successfully!')
      await navigateTo('/onboarding/step-1')
    } else {
      $toast.error(result.error || 'Registration failed')
    }
  } catch (error: any) {
    $toast.error(error.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>