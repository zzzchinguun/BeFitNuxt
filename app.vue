<template>
  <Html lang="en">
    <Head>
      <Title>BeFit - Fitness Tracking App</Title>
      <Meta name="description" content="Track your fitness journey with BeFit - nutrition, exercise, and weight tracking made simple." />
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    
    <Body class="font-sans antialiased">
      <NuxtLoadingIndicator />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script setup>
// Global styles and configurations
useHead({
  htmlAttrs: {
    class: 'h-full'
  },
  bodyAttrs: {
    class: 'h-full bg-gray-50 dark:bg-gray-900'
  }
})
</script>