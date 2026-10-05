import { onMounted, onUnmounted, watch } from 'vue'
// One passive scroll listener per experience. Only decoration is translated;
// the page root and fixed navigation/audio controls are never transformed.
export function useParallax(root, enabled, intensity) {
  let observer,
    mutations,
    frame = 0
  const layers = new Set(),
    visible = new Set()
  function reset() {
    cancelAnimationFrame(frame)
    frame = 0
    for (const layer of layers) {
      layer.style.removeProperty('--parallax-y')
      layer.style.removeProperty('--pointer-x')
      layer.style.removeProperty('--pointer-y')
    }
  }
  function discover() {
    for (const layer of layers)
      if (!root.value?.contains(layer)) {
        observer?.unobserve(layer)
        layers.delete(layer)
        visible.delete(layer)
      }
    for (const layer of root.value?.querySelectorAll('[data-parallax]') || []) {
      if (layers.has(layer)) continue
      layers.add(layer)
      if (observer) observer.observe(layer)
      else visible.add(layer)
    }
    update()
  }
  function update() {
    if (!enabled.value || frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      for (const layer of visible) {
        const rect = layer
          .closest('.visual-atmosphere')
          ?.getBoundingClientRect()
        if (!rect) continue
        const progress =
          (window.innerHeight / 2 - rect.top - rect.height / 2) /
          Math.max(window.innerHeight, rect.height)
        const speed = Number(layer.dataset.parallax) || 0
        layer.style.setProperty(
          '--parallax-y',
          `${Math.max(-18, Math.min(18, progress * speed * 60 * intensity.value))}px`,
        )
      }
    })
  }
  function pointer(event) {
    if (!enabled.value || event.pointerType !== 'mouse') return
    const scene = event.target.closest?.('.opening-stage, .section-frame')
    if (!scene || !root.value?.contains(scene)) return
    const rect = scene.getBoundingClientRect()
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
    )
    const y = Math.max(
      -1,
      Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
    )
    for (const layer of scene.querySelectorAll('[data-parallax]')) {
      const amount = Math.min(6, Math.abs(Number(layer.dataset.parallax)) * 5)
      layer.style.setProperty('--pointer-x', `${x * amount}px`)
      layer.style.setProperty('--pointer-y', `${y * amount}px`)
    }
  }
  watch(enabled, (value) => (value ? update() : reset()))
  onMounted(() => {
    if ('IntersectionObserver' in window)
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target)
            else visible.delete(entry.target)
          }
          update()
        },
        { rootMargin: '100px' },
      )
    discover()
    mutations = new MutationObserver(discover)
    mutations.observe(root.value, { childList: true, subtree: true })
    window.addEventListener('scroll', update, {
      passive: true,
      capture: true,
    })
    window.addEventListener('resize', update, { passive: true })
    root.value.addEventListener('pointermove', pointer, { passive: true })
    root.value.addEventListener('pointerleave', reset)
  })
  onUnmounted(() => {
    reset()
    observer?.disconnect()
    mutations?.disconnect()
    window.removeEventListener('scroll', update, true)
    window.removeEventListener('resize', update)
    root.value?.removeEventListener('pointermove', pointer)
    root.value?.removeEventListener('pointerleave', reset)
    layers.clear()
    visible.clear()
  })
}
