<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="text-center text-3xl font-bold text-gray-900 dark:text-white">
          BeFit
        </h1>
        <h2 class="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">
          Login
        </h2>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <UFormGroup label="Email" name="email">
            <UInput v-model="form.email" type="email" required placeholder="Email"
              icon="i-heroicons-envelope" size="lg" />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput v-model="form.password" type="password" required placeholder="Password"
              icon="i-heroicons-lock-closed" size="lg" />
          </UFormGroup>
        </div>

        <div class="flex items-center justify-between">
          <NuxtLink to="/auth/forgot-password" class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Forgot Password?
          </NuxtLink>
        </div>

        <UButton type="submit" :loading="loading" :disabled="!form.email || !form.password" size="lg" block
          class="justify-center">
          Login
        </UButton>

        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Create Account
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
  email: '',
  password: ''
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true

  try {
    const result = await authStore.login(form.email, form.password)

    if (result.success) {
      $toast.success('Successfully logged in!')
      await navigateTo('/')
    } else {
      $toast.error(result.error || 'Login failed')
    }
  } catch (error: any) {
    $toast.error(error.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>