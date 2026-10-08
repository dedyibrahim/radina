import { onMounted, onUnmounted, nextTick, inject, watch } from 'vue'
export function useScrollAnimation() {
  const visual = inject('weddingVisual', null)
  let observer, mutations, stopWatch
  const tracked = new Set()
  function discover() {
    const root = visual?.root.value
    if (!root) return
    const lite =
      visual.performance.quality.value === 'lite' ||
      !visual.motion.value ||
      visual.intensity?.value !== 'cinematic'
    for (const element of root.querySelectorAll('[data-reveal]')) {
      if (lite) {
        element.classList.remove('reveal-ready')
        element.classList.add('is-visible')
        observer?.unobserve(element)
        continue
      }
      if (tracked.has(element)) continue
      tracked.add(element)
      const section = element.closest('.section-frame'),
        order = [...root.querySelectorAll('.section-frame')].indexOf(section)
      const group = [...(section?.querySelectorAll('[data-reveal]') || [])],
        index = group.indexOf(element)
      const styles = visual.config.value.animations
      element.dataset.revealStyle = styles[Math.max(0, order) % styles.length]
      element.style.setProperty(
        '--reveal-delay',
        `${Math.min(3, Math.max(0, index)) * 65}ms`,
      )
      element.classList.add('reveal-ready')
      if (observer) observer.observe(element)
      else element.classList.add('is-visible')
    }
    for (const element of tracked)
      if (!root.contains(element)) {
        tracked.delete(element)
        observer?.unobserve(element)
      }
  }
  onMounted(async () => {
    await nextTick()
    if ('IntersectionObserver' in window)
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
        },
        { threshold: 0.08 },
      )
    discover()
    if (visual?.root.value) {
      mutations = new MutationObserver(discover)
      mutations.observe(visual.root.value, {
        childList: true,
        subtree: true,
      })
      stopWatch = watch(
        [visual.performance.quality, visual.motion, visual.intensity],
        discover,
      )
    }
  })
  onUnmounted(() => {
    observer?.disconnect()
    mutations?.disconnect()
    stopWatch?.()
    tracked.clear()
  })
}
