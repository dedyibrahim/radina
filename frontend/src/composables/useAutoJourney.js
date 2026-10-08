import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const sectionHolds = {
  couple: 4000,
  story: 5000,
  event: 4000,
  gallery: Infinity,
  gift: Infinity,
  rsvp: Infinity,
  wishes: Infinity,
}

export function useAutoJourney(root, allowed, reduced, speed) {
  const state = ref('idle')
  const progress = ref(0)
  const canRun = computed(() => allowed.value && !reduced.value)
  let frame = 0
  let last = 0
  let holdUntil = 0
  let currentSection = ''
  let ignoreScroll = false
  let targetY = 0
  const visited = new Set()

  function measure() {
    const maximum = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    )
    progress.value = maximum ? Math.min(1, window.scrollY / maximum) : 1
    return maximum
  }
  function pause() {
    if (state.value !== 'playing') return
    state.value = 'paused'
    cancelAnimationFrame(frame)
    frame = 0
    last = 0
    holdUntil = 0
  }
  function start() {
    if (!canRun.value) return
    if (state.value === 'complete') {
      window.scrollTo({ top: 0, behavior: 'instant' })
      visited.clear()
      currentSection = ''
    }
    state.value = 'playing'
    targetY = window.scrollY
    last = 0
    frame = requestAnimationFrame(tick)
  }
  function tick(time) {
    if (state.value !== 'playing' || !canRun.value || document.hidden) {
      pause()
      return
    }
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
      pause()
      return
    }
    const maximum = measure()
    if (window.scrollY >= maximum - 2) {
      state.value = 'complete'
      progress.value = 1
      frame = 0
      return
    }
    const center = window.innerHeight * 0.42
    const section = [
      ...(root.value?.querySelectorAll('.section-frame') || []),
    ].find((node) => {
      const rect = node.getBoundingClientRect()
      return rect.top <= center && rect.bottom > center
    })
    const key = section?.dataset.section || ''
    if (key && key !== currentSection) {
      currentSection = key
      if (!visited.has(section)) {
        visited.add(section)
        const delay = section.dataset.autoPause
          ? Number(section.dataset.autoPause)
          : sectionHolds[key] || 0
        if (delay === Infinity || delay < 0) {
          pause()
          return
        }
        if (delay > 0) holdUntil = time + Math.min(delay, 15000)
      }
    }
    if (time < holdUntil) {
      last = time
      frame = requestAnimationFrame(tick)
      return
    }
    const delta = last ? Math.min((time - last) / 1000, 0.05) : 0
    last = time
    targetY = Math.min(
      maximum,
      targetY + delta * (speed.value === 'normal' ? 38 : 20),
    )
    ignoreScroll = true
    window.scrollTo({ top: targetY, behavior: 'instant' })
    frame = requestAnimationFrame(tick)
  }
  function manual(event) {
    if (
      event.type === 'pointerdown' &&
      event.target.closest?.('[data-journey-control]')
    )
      return
    if (
      event.type === 'keydown' &&
      ![
        'ArrowDown',
        'ArrowUp',
        'PageDown',
        'PageUp',
        'Home',
        'End',
        ' ',
      ].includes(event.key)
    )
      return
    pause()
  }
  function scroll() {
    measure()
    if (ignoreScroll) {
      ignoreScroll = false
      return
    }
    if (state.value === 'playing') pause()
  }
  watch(canRun, (value) => {
    if (!value) pause()
  })
  onMounted(() => {
    measure()
    window.addEventListener('wheel', manual, { passive: true, capture: true })
    window.addEventListener('touchstart', manual, {
      passive: true,
      capture: true,
    })
    window.addEventListener('pointerdown', manual, {
      passive: true,
      capture: true,
    })
    window.addEventListener('keydown', manual, true)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    document.addEventListener('visibilitychange', pause)
    document.addEventListener('focusin', manual, true)
  })
  onUnmounted(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('wheel', manual, true)
    window.removeEventListener('touchstart', manual, true)
    window.removeEventListener('pointerdown', manual, true)
    window.removeEventListener('keydown', manual, true)
    window.removeEventListener('scroll', scroll)
    window.removeEventListener('resize', measure)
    document.removeEventListener('visibilitychange', pause)
    document.removeEventListener('focusin', manual, true)
  })
  return { state, progress, canRun, start, pause }
}
