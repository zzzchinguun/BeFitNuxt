<template>
  <header
    class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Title -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-white">
            BeFit
          </NuxtLink>
        </div>

        <!-- User menu -->
        <div class="flex items-center space-x-3">
          <!-- Color mode switcher -->
          <ColorModeSwitcher :show-tooltip="false" />
          
          <!-- User dropdown -->
          <UDropdown :items="userMenuItems">
            <UButton variant="ghost" :icon="authStore.user?.photoURL ? undefined : 'i-heroicons-user-circle'"
              class="relative">
              <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL"
                :alt="authStore.user.displayName || 'User'" class="w-6 h-6 rounded-full" />
            </UButton>
          </UDropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { $toast } = useNuxtApp()
const authStore = useAuthStore()

const userMenuItems = computed(() => [
  [{
    label: authStore.user?.displayName || authStore.user?.email || 'User',
    slot: 'account',
    disabled: true
  }],
  ...(authStore.user?.role === 'admin' ? [[{
    label: 'Admin Panel',
    icon: 'i-heroicons-shield-check',
    click: () => navigateTo('/admin/verification')
  }]] : []),
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: handleLogout
  }]
])

async function handleLogout() {
  const result = await authStore.logout()
  if (result.success) {
    $toast.success('Successfully logged out')
    await navigateTo('/auth/login')
  } else {
    $toast.error('Logout failed')
  }
}
</script>