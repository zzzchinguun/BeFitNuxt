<template>
  <div class="min-h-screen" style="background: linear-gradient(135deg, var(--color-bg) 0%, rgba(5, 132, 255, 0.05) 100%);">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12 reveal">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 floating">
          <UIcon name="i-heroicons-sparkles" class="w-12 h-12 text-white" />
        </div>
        
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Хоолны төлөвлөгөө үүсгэх
        </h1>
        
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Таны макро зорилгод тохирсон амттай, эрүүл хоолны төлөвлөгөө автоматаар үүсгэнэ
        </p>
      </div>

      <!-- Macro Goals Display -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-8 reveal">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Таны өдрийн макро зорилго
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Онбордингийн үеэр тогтоосон таны хувийн зорилгонууд
          </p>
        </div>

        <!-- Current Progress (0 since new user) -->
        <div class="flex justify-center mb-8">
          <div class="relative">
            <MacroProgressRing
              :percentage="0"
              :size="140"
              :stroke-width="8"
              color="#007AFF"
            >
              <div class="text-center">
                <div class="text-3xl font-bold text-gray-900 dark:text-white">
                  0%
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  хөгжил
                </div>
              </div>
            </MacroProgressRing>
          </div>
        </div>

        <!-- Macro Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Calories -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div class="text-center">
              <UIcon name="i-heroicons-fire" class="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-2">Илчлэг</p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {{ userMacros.kcal }}
              </p>
              <p class="text-xs text-blue-600 dark:text-blue-400">ккал</p>
            </div>
          </div>

          <!-- Protein -->
          <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/50">
            <div class="text-center">
              <UIcon name="i-heroicons-bolt" class="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-red-800 dark:text-red-300 uppercase tracking-wide mb-2">Уураг</p>
              <p class="text-2xl font-bold text-red-900 dark:text-red-200">
                {{ userMacros.proteinG }}
              </p>
              <p class="text-xs text-red-600 dark:text-red-400">грамм</p>
            </div>
          </div>

          <!-- Carbs -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
            <div class="text-center">
              <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-green-800 dark:text-green-300 uppercase tracking-wide mb-2">Нүүрс ус</p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-200">
                {{ userMacros.carbsG }}
              </p>
              <p class="text-xs text-green-600 dark:text-green-400">грамм</p>
            </div>
          </div>

          <!-- Fat -->
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50">
            <div class="text-center">
              <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-2">Өөх тос</p>
              <p class="text-2xl font-bold text-amber-900 dark:text-amber-200">
                {{ userMacros.fatG }}
              </p>
              <p class="text-xs text-amber-600 dark:text-amber-400">грамм</p>
            </div>
          </div>
        </div>

        <!-- Goal Summary -->
        <div class="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
          <p>
            <strong class="text-gray-900 dark:text-white">{{ goalTypeLabel }}</strong> зорилготой таны өдрийн макро хэрэгцээ
          </p>
        </div>
      </div>

      <!-- Generate Button Section -->
      <div class="text-center mb-12 reveal">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Бэлэн үү?
            </h3>
            <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Танд зориулсан амттай, эрүүл хоолны төлөвлөгөөг үүсгэхийн тулд дарна уу
            </p>
          </div>

          <UButton
            @click="generateMeals"
            :loading="isGenerating"
            :disabled="isGenerating"
            size="xl"
            class="px-12 py-4 rounded-2xl text-white font-bold text-lg pulse-glow"
            :class="isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300'"
          >
            <UIcon 
              :name="isGenerating ? 'i-heroicons-arrow-path' : 'i-heroicons-sparkles'" 
              :class="['w-6 h-6 mr-3', isGenerating ? 'animate-spin' : '']" 
            />
            {{ isGenerating ? 'Үүсгэж байна...' : 'Хоолны төлөвлөгөө үүсгэх' }}
          </UButton>

          <div v-if="isGenerating" class="mt-6">
            <div class="flex justify-center space-x-2 mb-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ generationStatus }}
            </p>
          </div>
        </div>
      </div>

      <!-- Features Preview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 reveal">
        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 dark:border-gray-700/30">
          <UIcon name="i-heroicons-chart-pie" class="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Нарийн макро тооцоо</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Таны зорилгод ±5% нарийвчлалтай тохирсон хоолнууд
          </p>
        </div>

        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 dark:border-gray-700/30">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Хурдан бэлтгэл</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Амархан, хурдан хийж болохуйц жорнууд
          </p>
        </div>

        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 dark:border-gray-700/30">
          <UIcon name="i-heroicons-shopping-cart" class="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Дэлгүүрийн жагсаалт</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Автомат захиалгын жагсаалт бэлтгэж өгнө
          </p>
        </div>
      </div>

      <!-- Skip Option -->
      <div class="text-center reveal">
        <UButton
          @click="skipToMainApp"
          variant="ghost"
          size="sm"
          class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 mr-2" />
          Одоохондоо алгасаад үндсэн аппруу очих
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'meal-generation',
  title: 'Хоолны төлөвлөгөө үүсгэх'
})

const authStore = useAuthStore()
const router = useRouter()
const { quickGenerate, isGenerating } = useMealGenerator()

// State
const generationStatus = ref('Хоолны мэдээлэл уншиж байна...')

// Get user's macro goals from onboarding
const userMacros = computed(() => {
  return authStore.user?.macroGoals || {
    kcal: 2000,
    proteinG: 150,
    carbsG: 200,
    fatG: 67
  }
})

// Get goal type label
const goalTypeLabel = computed(() => {
  const goalType = authStore.user?.onboarding?.goalType || authStore.user?.onboarding?.goal
  const labels: Record<string, string> = {
    'cut': 'Жин хасах',
    'bulk': 'Булчингийн масс нэмэх',
    'maintain': 'Жинээ хадгалах'
  }
  return labels[goalType as string] || 'Эрүүл амьдрал'
})

// Generation process
async function generateMeals() {
  try {
    // Simulate meal generation process with status updates
    const steps = [
      'Хоолны мэдээлэл уншиж байна...',
      'Таны макро зорилгод тохирох хоолнуудыг сонгож байна...',
      'Хооллолтын төлөвлөгөө зохиож байна...',
      'Орц найрлагын жагсаалт бэлтгэж байна...',
      'Эцсийн шалгалт хийж байна...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      generationStatus.value = steps[i]
      // Realistic timing for each step
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    }
    
    // Generate meal plan using the store
    const result = await quickGenerate()
    
    if (result.success) {
      // Mark user as having generated first meal plan
      await authStore.updateUserProfile({ mealPlanGenerated: true })
      
      // Navigate to generated meals preview
      await router.push('/meal-generation/preview')
    } else {
      console.error('Meal generation failed:', result.errors)
      // TODO: Show error message to user
    }
    
  } catch (error) {
    console.error('Meal generation failed:', error)
    // TODO: Show error message
  }
}

// Skip to main app
async function skipToMainApp() {
  // Mark as completed so they don't get redirected back
  await authStore.updateUserProfile({ mealPlanGenerated: true })
  await router.push('/')
}

// Reveal animation on mount
onMounted(() => {
  nextTick(() => {
    const reveals = document.querySelectorAll('.reveal')
    reveals.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('reveal-visible')
      }, index * 200)
    })
  })
})

// Page meta
useHead({
  title: 'Хоолны төлөвлөгөө үүсгэх - BeFit',
  meta: [
    { name: 'description', content: 'Таны макро зорилгод тохирсон хувийн хоолны төлөвлөгөө үүсгэх' }
  ]
})
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

.pulse-glow:not(:disabled):not(.bg-gray-400) {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>