export function useReveal() {
  if (process.server) return

  try {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry && entry.target && entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    // Use nextTick to ensure DOM is ready
    nextTick(() => {
      const revealElements = document.querySelectorAll('.reveal, .reveal-delay')
      if (revealElements && revealElements.length > 0) {
        revealElements.forEach((el) => {
          if (el && observer) {
            observer.observe(el)
          }
        })
      }
    })

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  } catch (error) {
    console.warn('Reveal observer error:', error)
    return () => {}
  }
}


