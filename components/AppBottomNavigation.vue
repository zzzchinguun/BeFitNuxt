<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
    <div class="grid grid-cols-5 h-16">
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center space-y-1 text-xs transition-colors duration-200"
        :class="[
          $route.path === item.to || ($route.path.startsWith(item.to) && item.to !== '/')
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        ]"
      >
        <span class="w-6 h-6"></span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const navigationItems = [
  {
    to: '/',
    icon: '',
    label: 'Home'
  },
  {
    to: '/meals',
    icon: '',
    label: 'Meals'
  },
  {
    to: '/exercises',
    icon: '',
    label: 'Exercise'
  },
  {
    to: '/profile/weight',
    icon: '',
    label: 'Weight'
  },
  {
    to: '/profile',
    icon: '',
    label: 'Profile'
  }
]
</script>