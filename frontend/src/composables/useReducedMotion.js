import { ref, onMounted, onUnmounted } from 'vue'
export function useReducedMotion() {
  const reduced = ref(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  let query
  const update = () => {
    reduced.value = query.matches
  }
  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    query.addEventListener('change', update)
  })
  onUnmounted(() => query?.removeEventListener('change', update))
  return reduced
}
