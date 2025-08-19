<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="closeModal">
        <!-- Animated backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animated-backdrop"></div>

        <!-- Modal content -->
        <Transition enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 scale-75 translate-y-8" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-90 translate-y-4">
          <div v-if="isVisible"
            class="relative max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden modal-content">
            <!-- Animated background pattern -->
            <div class="absolute inset-0 opacity-10">
              <div class="floating-particle particle-1"></div>
              <div class="floating-particle particle-2"></div>
              <div class="floating-particle particle-3"></div>
              <div class="floating-particle particle-4"></div>
            </div>

            <!-- Content -->
            <div class="relative p-8 text-center">
              <!-- Close button -->
              <button @click="closeModal"
                class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close welcome message">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
              </button>

              <!-- Google logo and branding -->
              <div class="flex justify-center mb-6">
                <div class="relative">
                  <!-- Google-style colorful logo -->
                  <div
                    class="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 logo-bounce shadow-lg border-2 border-gray-100">
                    <div class="text-2xl font-bold">
                      <span class="text-blue-500">G</span><span class="text-red-500">o</span><span
                        class="text-yellow-500">o</span><span class="text-blue-500">g</span><span
                        class="text-green-500">l</span><span class="text-red-500">e</span>
                    </div>
                  </div>
                  <!-- Animated rings with Google colors -->
                  <div class="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>
                  <div class="absolute inset-2 rounded-full border-2 border-red-300 animate-ping animation-delay-1000">
                  </div>
                  <div
                    class="absolute inset-4 rounded-full border-2 border-yellow-300 animate-ping animation-delay-2000">
                  </div>
                </div>
              </div>

              <!-- Welcome text with typing animation -->
              <div class="space-y-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white typing-text">
                  Тавтай морилно уу! 🎉
                </h2>

                <div class="text-lg font-semibold mb-3">
                  <span
                    class="bg-gradient-to-r from-blue-600 via-red-500 via-yellow-500 via-green-500 to-red-600 bg-clip-text text-transparent">
                    Grow with Google
                  </span>
                  <span class="text-gray-700 dark:text-gray-300"> оролцогчид</span>
                </div>

                <p class="text-gray-600 dark:text-gray-300 leading-relaxed fade-in-text">
                  Grow with Google хөтөлбөрийн хүрээнд бид танд <strong>BeFit</strong>-г танилцуулж байна.
                  Google-ийн дэмжлэгтэй state of the art Gemini models болоод бүрэн firebase firestore датабааз дээр
                  суурилан ажилладаг эрүүл амьдралын туслах!
                </p>

                <div
                  class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center mb-2">
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Powered
                      by NexMind</div>
                  </div>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    🤖 Хиймэл оюун ухаанаар дэмжигдсэн хувийн хоолны төлөвлөгөө<br>
                    📊 Ухаалаг макро тооцоо ба шинжилгээ<br>
                    📱 Хялбар дасгал хяналт ба ахиц хянах
                  </p>
                </div>

                <!-- Color Mode Selector -->
                <div
                  class="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between mb-3">
                    <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      🎨 Харагдах байдлаа сонгоорой
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <button @click="setColorMode('light')" :class="[
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200',
                      colorMode.value === 'light'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    ]">
                      <UIcon name="i-heroicons-sun" class="w-6 h-6 text-yellow-500 mb-1" />
                      <span class="text-xs font-medium text-gray-700">Цагаан</span>
                    </button>

                    <button @click="setColorMode('dark')" :class="[
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200',
                      colorMode.value === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ]">
                      <UIcon name="i-heroicons-moon" class="w-6 h-6 text-blue-400 mb-1" />
                      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Хар</span>
                    </button>

                    <button @click="setColorMode('system')" :class="[
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200',
                      colorMode.value === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ]">
                      <UIcon name="i-heroicons-computer-desktop" class="w-6 h-6 text-gray-500 mb-1" />
                      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Авто</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col sm:flex-row gap-3 mt-8">
                <UButton @click="startJourney" size="lg"
                  class="flex-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 hover:from-blue-600 hover:via-green-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 mr-2" />
                  Google-тэй эхлээрэй
                </UButton>

                <UButton @click="closeModal" variant="outline" size="lg"
                  class="flex-1 rounded-2xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Дараа үзнэ
                </UButton>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'

const isVisible = ref(false)
const hasSeenWelcome = ref(false)

// Color mode functionality
const colorMode = useColorMode()

function setColorMode(mode: 'light' | 'dark' | 'system') {
  colorMode.preference = mode
}

onMounted(async () => {
  // Check if user has seen the welcome before
  const seen = localStorage.getItem('grow-with-google-welcome-seen')
  if (seen) {
    hasSeenWelcome.value = true
    return
  }

  // Show modal after a short delay for better UX
  await nextTick()
  setTimeout(() => {
    isVisible.value = true
  }, 1500)
})

function closeModal() {
  isVisible.value = false
  // Mark as seen so it doesn't show again
  localStorage.setItem('grow-with-google-welcome-seen', 'true')
  hasSeenWelcome.value = true
}

function startJourney() {
  closeModal()
  // Navigate to registration
  navigateTo('/auth/register')
}

// Prevent body scroll when modal is open
watch(isVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Animated backdrop effect */
.animated-backdrop {
  background: linear-gradient(45deg, rgba(139, 69, 19, 0.1), rgba(255, 20, 147, 0.1), rgba(138, 43, 226, 0.1));
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* Floating particles */
.floating-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #a855f7, #ec4899);
  border-radius: 50%;
  opacity: 0.7;
  animation: float 6s ease-in-out infinite;
}

.particle-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.particle-2 {
  top: 80%;
  right: 20%;
  animation-delay: 2s;
}

.particle-3 {
  top: 40%;
  right: 30%;
  animation-delay: 4s;
}

.particle-4 {
  bottom: 30%;
  left: 30%;
  animation-delay: 1s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.7;
  }

  25% {
    transform: translateY(-10px) translateX(5px) scale(1.1);
    opacity: 1;
  }

  50% {
    transform: translateY(-5px) translateX(-5px) scale(0.9);
    opacity: 0.8;
  }

  75% {
    transform: translateY(-15px) translateX(10px) scale(1.2);
    opacity: 0.9;
  }
}

/* Logo bounce animation */
.logo-bounce {
  animation: logoBounce 2s ease-in-out infinite;
}

@keyframes logoBounce {

  0%,
  100% {
    transform: translateY(0px) scale(1);
  }

  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

/* Typing text animation */
.typing-text {
  overflow: hidden;
  border-right: 2px solid #a855f7;
  white-space: nowrap;
  animation: typing 2s steps(20, end), blink 1s infinite step-end 2s;
}

@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

@keyframes blink {

  0%,
  50% {
    border-color: transparent;
  }

  51%,
  100% {
    border-color: #a855f7;
  }
}

/* Fade in text animation */
.fade-in-text {
  animation: fadeInUp 1s ease-out 1s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal content animations */
.modal-content {
  animation: modalGlow 3s ease-in-out infinite;
}

@keyframes modalGlow {

  0%,
  100% {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
  }

  50% {
    box-shadow: 0 0 50px rgba(236, 72, 153, 0.4);
  }
}

/* Animation delay utilities */
.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

/* Accessibility: Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {

  .floating-particle,
  .logo-bounce,
  .typing-text,
  .fade-in-text,
  .modal-content,
  .animated-backdrop {
    animation: none;
  }

  .typing-text {
    border-right: none;
    white-space: normal;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
