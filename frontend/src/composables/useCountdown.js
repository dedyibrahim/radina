import { ref, computed, onMounted, onUnmounted, toValue } from 'vue'
export function useCountdown(date) {
  const now = ref(Date.now())
  let interval
  const remaining = computed(() =>
    Math.max(0, (new Date(toValue(date)).getTime() || 0) - now.value),
  )
  const parts = computed(() => [
    { value: Math.floor(remaining.value / 86400000), label: 'Days' },
    { value: Math.floor(remaining.value / 3600000) % 24, label: 'Hours' },
    { value: Math.floor(remaining.value / 60000) % 60, label: 'Minutes' },
    { value: Math.floor(remaining.value / 1000) % 60, label: 'Seconds' },
  ])
  onMounted(() => {
    interval = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })
  onUnmounted(() => clearInterval(interval))
  return { parts, remaining }
}
