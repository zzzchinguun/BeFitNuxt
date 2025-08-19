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
              Тавтай морилно уу
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Эрүүл амьдралын аялалаа үргэлжлүүлцгээе
            </p>
          </div>

          <!-- Form -->
          <div class="px-8 pb-8">
            <form @submit.prevent="handleLogin" class="space-y-6">
              <div class="space-y-4">
                <UFormGroup label="И-мэйл хаяг" name="email">
                  <UInput 
                    v-model="form.email" 
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

                <UFormGroup label="Нууц үг" name="password">
                  <UInput 
                    v-model="form.password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    icon="i-heroicons-lock-closed" 
                    size="lg"
                    class="transition-all duration-200 focus:scale-[1.02]"
                    :ui="{ 
                      rounded: 'rounded-xl',
                      color: { white: { outline: 'shadow-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-[#007AFF] dark:focus:border-[#007AFF]' } }
                    }"
                  />
                </UFormGroup>
              </div>

              <div class="flex items-center justify-end">
                <NuxtLink 
                  to="/auth/forgot-password" 
                  class="text-sm font-medium text-[#007AFF] hover:text-[#007AFF]/80 dark:text-[#007AFF] dark:hover:text-[#007AFF]/80 transition-colors"
                >
                  Нууц үгээ мартсан уу?
                </NuxtLink>
              </div>

              <UButton 
                type="submit" 
                :loading="loading" 
                :disabled="!form.email || !form.password" 
                size="lg" 
                block
                class="justify-center bg-[#007AFF] hover:bg-[#007AFF]/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] rounded-xl font-semibold text-white"
              >
                <template v-if="!loading">
                  <Icon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
                  Нэвтрэх
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

            <!-- Sign Up Link -->
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Бүртгэл байхгүй юу?
                <NuxtLink 
                  to="/auth/register" 
                  class="font-semibold text-[#007AFF] hover:text-[#007AFF]/80 dark:text-[#007AFF] dark:hover:text-[#007AFF]/80 transition-colors"
                >
                  Шинэ бүртгэл үүсгэх
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            BeFit ашигласнаар та манай 
            <a href="#" class="underline hover:text-gray-700 dark:hover:text-gray-300">үйлчилгээний нөхцөл</a>
            болон 
            <a href="#" class="underline hover:text-gray-700 dark:hover:text-gray-300">нууцлалын бодлогыг</a> 
            зөвшөөрч байна
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
      $toast.success('Амжилттай нэвтэрлээ!')
      await navigateTo('/')
    } else {
      $toast.error(result.error || 'Нэвтрэхэд алдаа гарлаа')
    }
  } catch (error: any) {
    $toast.error(error.message || 'Нэвтрэхэд алдаа гарлаа')
  } finally {
    loading.value = false
  }
}
</script>