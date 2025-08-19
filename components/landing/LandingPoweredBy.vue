<template>
  <section class="relative py-16 md:py-24 overflow-hidden"
    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <!-- Animated background elements -->
    <div class="absolute inset-0 opacity-10">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <!-- Main content -->
    <div class="relative max-w-7xl mx-auto px-6 text-center">
      <!-- Powered by text -->
      <div class="mb-8 reveal">
        <p class="text-white/80 text-lg md:text-xl font-medium tracking-wide uppercase mb-4">
          Powered by
        </p>

        <!-- NexMind logo/text with glow effect -->
        <div class="nexmind-logo">
          <h2 class="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight">
            <span class="glow-text">Nex</span><span class="glow-text-accent">Mind</span>
          </h2>
        </div>

        <!-- Subtitle -->
        <p class="text-white/70 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          It automation team to GWG competition participants our team is powered by the next generation minds.
        </p>
      </div>

      <!-- Tech badges -->
      <div class="flex flex-wrap justify-center gap-4 mt-12 reveal-delay">
        <div class="tech-badge">
          <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5 mr-2" />
          AI-Powered
        </div>
        <div class="tech-badge">
          <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 mr-2" />
          Smart Analytics
        </div>
        <div class="tech-badge">
          <UIcon name="i-heroicons-sparkles" class="w-5 h-5 mr-2" />
          Personalized
        </div>
        <div class="tech-badge">
          <UIcon name="i-heroicons-lightning-bolt" class="w-5 h-5 mr-2" />
          Real-time
        </div>
      </div>
    </div>

    <!-- Bottom wave -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-12 md:h-16 text-white/10">
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          opacity=".25" fill="currentColor"></path>
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          opacity=".5" fill="currentColor"></path>
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          fill="currentColor"></path>
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
// Animations handled by useReveal composable in layout
</script>

<style scoped>
/* Floating orbs animation */
.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.1;
  }

  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.2;
  }
}

/* NexMind logo styling */
.nexmind-logo {
  position: relative;
  display: inline-block;
}

.glow-text {
  background: linear-gradient(45deg, #ffffff, #f0f9ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
  animation: glow-pulse 3s ease-in-out infinite;
}

.glow-text-accent {
  background: linear-gradient(45deg, #60a5fa, #3b82f6, #1d4ed8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  animation: glow-pulse-accent 3s ease-in-out infinite 1.5s;
}

@keyframes glow-pulse {

  0%,
  100% {
    text-shadow:
      0 0 10px rgba(255, 255, 255, 0.3),
      0 0 20px rgba(255, 255, 255, 0.2),
      0 0 30px rgba(255, 255, 255, 0.1);
  }

  50% {
    text-shadow:
      0 0 20px rgba(255, 255, 255, 0.6),
      0 0 30px rgba(255, 255, 255, 0.4),
      0 0 40px rgba(255, 255, 255, 0.2);
  }
}

@keyframes glow-pulse-accent {

  0%,
  100% {
    text-shadow:
      0 0 10px rgba(59, 130, 246, 0.4),
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 30px rgba(59, 130, 246, 0.2);
  }

  50% {
    text-shadow:
      0 0 20px rgba(59, 130, 246, 0.7),
      0 0 30px rgba(59, 130, 246, 0.5),
      0 0 40px rgba(59, 130, 246, 0.3);
  }
}

/* Tech badges */
.tech-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  animation: badge-float 4s ease-in-out infinite;
}

.tech-badge:nth-child(1) {
  animation-delay: 0s;
}

.tech-badge:nth-child(2) {
  animation-delay: 0.5s;
}

.tech-badge:nth-child(3) {
  animation-delay: 1s;
}

.tech-badge:nth-child(4) {
  animation-delay: 1.5s;
}

.tech-badge:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

@keyframes badge-float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-5px);
  }
}

/* Reveal animations */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-delay {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 768px) {

  .glow-text,
  .glow-text-accent {
    font-size: 3rem;
  }

  .tech-badge {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }

  .floating-orb {
    display: none;
    /* Hide orbs on mobile for performance */
  }
}
</style>
