import { ref, onMounted, onUnmounted } from 'vue'
export function useIntersectionAnimation(root) {
  const visible = ref(false)
  let observer
  onMounted(() => {
    if (!root.value) return
    if (!('IntersectionObserver' in window)) {
      visible.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        // Fast scrolling can queue several changes for this one observed element.
        // The last entry describes its current visibility.
        const entry = entries[entries.length - 1]
        if (entry) visible.value = entry.isIntersecting
      },
      { rootMargin: '60px' },
    )
    observer.observe(root.value)
  })
  onUnmounted(() => observer?.disconnect())
  return visible
}
