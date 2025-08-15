<template>
  <UModal v-model="showUpdatePrompt" :ui="{ width: 'sm:max-w-md' }" prevent-close>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Update Available
          </h3>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex items-center space-x-3">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-600" />
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              A new version of BeFit is available!
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Version {{ latestVersion }} is ready to install
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400">
          Please refresh your browser to get the latest features and improvements.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            v-if="!forceUpdate"
            variant="ghost"
            @click="dismissUpdate"
          >
            Later
          </UButton>
          <UButton
            @click="refreshApp"
          >
            Refresh Now
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'

const { db } = useFirebase()
const config = useRuntimeConfig()

const showUpdatePrompt = ref(false)
const latestVersion = ref('')
const forceUpdate = ref(false)

async function checkForUpdates() {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'app'))
    
    if (configDoc.exists()) {
      const data = configDoc.data()
      const currentVersion = config.public.appVersion
      
      latestVersion.value = data.latestVersion
      forceUpdate.value = data.forceUpdate || false
      
      if (data.latestVersion !== currentVersion) {
        showUpdatePrompt.value = true
      }
    }
  } catch (error) {
    console.error('Error checking for updates:', error)
  }
}

function refreshApp() {
  window.location.reload()
}

function dismissUpdate() {
  if (!forceUpdate.value) {
    showUpdatePrompt.value = false
    // Check again in 24 hours
    setTimeout(checkForUpdates, 24 * 60 * 60 * 1000)
  }
}

onMounted(() => {
  // Check for updates when component mounts
  checkForUpdates()
  
  // Check periodically (every hour)
  setInterval(checkForUpdates, 60 * 60 * 1000)
})
</script>