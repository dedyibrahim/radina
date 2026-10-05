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
      ([entry]) => {
        visible.value = entry.isIntersecting
      },
      { rootMargin: '60px' },
    )
    observer.observe(root.value)
  })
  onUnmounted(() => observer?.disconnect())
  return visible
}
