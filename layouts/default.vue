<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader v-if="authStore.isAuthenticated && !isOnboardingPage" />

    <main :class="{
      'pt-16': authStore.isAuthenticated && !isOnboardingPage,
      'pb-20': authStore.isAuthenticated && !isOnboardingPage
    }">
      <slot />
    </main>

    <AppBottomNavigation v-if="authStore.isAuthenticated && !isOnboardingPage" />
    <UpdatePrompt />
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const route = useRoute()

const isOnboardingPage = computed(() =>
  route.path.startsWith('/onboarding') ||
  route.path.startsWith('/auth')
)

</script>
