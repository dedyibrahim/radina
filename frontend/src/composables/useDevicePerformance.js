import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useReducedMotion } from './useReducedMotion'
export function performanceMode({
  reduced = false,
  width = 1024,
  cores = 4,
  memory = 4,
  saveData = false,
} = {}) {
  if (reduced || saveData || cores <= 2 || memory <= 2) return 'lite'
  return width >= 1000 && cores >= 4 && memory >= 4 ? 'high' : 'standard'
}
export function useDevicePerformance() {
  const reduced = useReducedMotion(),
    width = ref(typeof window === 'undefined' ? 390 : window.innerWidth)
  const active = ref(typeof document === 'undefined' || !document.hidden)
  const coarse = ref(true)
  let pointer
  const resize = () => {
    width.value = window.innerWidth
  }
  const visibility = () => {
    active.value = !document.hidden
  }
  const input = () => {
    coarse.value = pointer.matches
  }
  const quality = computed(() =>
    performanceMode({
      reduced: reduced.value,
      width: width.value,
      cores:
        typeof navigator === 'undefined'
          ? 4
          : (navigator.hardwareConcurrency ?? 4),
      memory:
        typeof navigator === 'undefined' ? 4 : (navigator.deviceMemory ?? 4),
      saveData:
        typeof navigator !== 'undefined' &&
        navigator.connection?.saveData === true,
    }),
  )
  onMounted(() => {
    pointer = matchMedia('(hover: none), (pointer: coarse)')
    input()
    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', visibility)
    pointer.addEventListener('change', input)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', visibility)
    pointer?.removeEventListener('change', input)
  })
  return { quality, reduced, active, coarse, width }
}
