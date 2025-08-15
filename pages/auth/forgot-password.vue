<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="text-center text-3xl font-bold text-gray-900 dark:text-white">
          BeFit
        </h1>
        <h2 class="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Reset Password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <form @submit.prevent="handleResetPassword" class="mt-8 space-y-6">
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="email"
            type="email"
            required
            placeholder="Email"
            icon="i-heroicons-envelope"
            size="lg"
          />
        </UFormGroup>

        <UButton
          type="submit"
          :loading="loading"
          :disabled="!email"
          size="lg"
          block
          class="justify-center"
        >
          Reset Password
        </UButton>

        <div class="text-center">
          <NuxtLink
            to="/auth/login"
            class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Back to Login
          </NuxtLink>
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

const email = ref('')
const loading = ref(false)

async function handleResetPassword() {
  loading.value = true
  
  try {
    const result = await authStore.resetPassword(email.value)
    
    if (result.success) {
      $toast.success('Password reset email sent! Check your inbox.')
      await navigateTo('/auth/login')
    } else {
      $toast.error(result.error || 'Failed to send reset email')
    }
  } catch (error: any) {
    $toast.error(error.message || 'Failed to send reset email')
  } finally {
    loading.value = false
  }
}
</script>