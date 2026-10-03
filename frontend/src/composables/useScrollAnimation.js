import { onMounted, onUnmounted, nextTick } from 'vue'
export function useScrollAnimation() {
  let observer
  onMounted(async () => {
    await nextTick()
    const elements = document.querySelectorAll('[data-reveal]')
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    elements.forEach((el) => {
      el.classList.add('reveal-ready')
      observer.observe(el)
    })
  })
  onUnmounted(() => observer?.disconnect())
}
