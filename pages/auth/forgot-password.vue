<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-30">
      <div class="absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 via-transparent to-[#007AFF]/10"></div>
    </div>
    
    <div class="relative flex items-center justify-center min-h-screen px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Card Container -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <!-- Header -->
          <div class="px-8 pt-8 pb-6 text-center">
            <div class="mx-auto mb-6">
              <img 
                src="/images/brand/Light-Logo.svg" 
                alt="BeFit" 
                class="h-12 mx-auto dark:hidden"
              />
              <img 
                src="/images/brand/Dark-Logo.svg" 
                alt="BeFit" 
                class="h-12 mx-auto hidden dark:block"
              />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Нууц үг сэргээх
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              И-мэйл хаягаа оруулна уу. Бид танд нууц үг сэргээх линк илгээх болно.
            </p>
          </div>

          <!-- Form -->
          <div class="px-8 pb-8">
            <form @submit.prevent="handleResetPassword" class="space-y-6">
              <UFormGroup label="И-мэйл хаяг" name="email">
                <UInput
                  v-model="email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  icon="i-heroicons-envelope"
                  size="lg"
                  class="transition-all duration-200 focus:scale-[1.02]"
                  :ui="{ 
                    rounded: 'rounded-xl',
                    color: { white: { outline: 'shadow-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-[#007AFF] dark:focus:border-[#007AFF]' } }
                  }"
                />
              </UFormGroup>

              <UButton
                type="submit"
                :loading="loading"
                :disabled="!email"
                size="lg"
                block
                class="justify-center bg-[#007AFF] hover:bg-[#007AFF]/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] rounded-xl font-semibold text-white"
              >
                <template v-if="!loading">
                  <Icon name="i-heroicons-paper-airplane" class="w-5 h-5 mr-2" />
                  Сэргээх линк илгээх
                </template>
              </UButton>
            </form>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">эсвэл</span>
              </div>
            </div>

            <!-- Back Link -->
            <div class="text-center">
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center font-semibold text-[#007AFF] hover:text-[#007AFF]/80 dark:text-[#007AFF] dark:hover:text-[#007AFF]/80 transition-colors"
              >
                <Icon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
                Нэвтрэх хуудас руу буцах
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            И-мэйл хүлээн авахгүй байна уу? Спам хавтас шалгана уу эсвэл 
            <a href="#" class="underline hover:text-gray-700 dark:hover:text-gray-300">тусламж авна уу</a>
          </p>
        </div>
      </div>
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
      $toast.success('Нууц үг сэргээх линк илгээлээ! И-мэйлээ шалгана уу.')
      await navigateTo('/auth/login')
    } else {
      $toast.error(result.error || 'И-мэйл илгээхэд алдаа гарлаа')
    }
  } catch (error: any) {
    $toast.error(error.message || 'И-мэйл илгээхэд алдаа гарлаа')
  } finally {
    loading.value = false
  }
}
</script>