import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

// Individual rotate/translate preserve the original composition's transform/animation.
const surfaces =
  '.design-cover > figure, .design-cover > h1, .cover-title, .cover-invitation, .studio-names, .floral-cover-names, .hero-image-wrap, .person-composition figure, .floral-person figure, .celebration-person > img, .gallery-item, .event-card, .bank-card, .floral-person-photo, .floral-gallery-stage, .floral-hero-photo'
export function useInvitationDepth(root, motionOn, performance) {
  const reduced = ref(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
    visible = ref(true),
    hidden = ref(document.hidden)
  const enabled = computed(
    () =>
      motionOn.value &&
      !reduced.value &&
      visible.value &&
      !hidden.value &&
      performance?.quality.value !== 'lite',
  )
  let query,
    observer,
    mutations,
    frame = 0,
    active = null
  const cards = new Set()
  function reset() {
    cancelAnimationFrame(frame)
    frame = 0
    if (active) {
      for (const key of [
        '--depth-axis-x',
        '--depth-axis-y',
        '--depth-angle',
        '--depth-offset-x',
        '--depth-offset-y',
      ])
        active.style.removeProperty(key)
      active.classList.remove('depth-live')
    }
    active = null
  }
  function discover() {
    for (const card of cards)
      if (!root.value?.contains(card)) {
        observer?.unobserve(card)
        cards.delete(card)
      }
    const candidates = new Set(root.value?.querySelectorAll(surfaces) || [])
    for (const cover of root.value?.querySelectorAll('.design-cover') || []) {
      for (const layer of cover.children) {
        if (layer.getAttribute('aria-hidden') === 'true') continue
        if (
          layer.matches('header, figure, h1, h2') ||
          (layer.matches('div') && layer.textContent.trim())
        )
          candidates.add(layer)
      }
    }
    for (const card of candidates) {
      if (cards.has(card)) continue
      cards.add(card)
      card.classList.add('depth-card')
      if (
        !card.matches(
          'figure, .celebration-person > img, .hero-image-wrap, .floral-person-photo, .floral-hero-photo, .gallery-item, .floral-gallery-stage',
        )
      )
        card.classList.add('depth-typography')
      if (card.querySelector('button, a, input, select, textarea'))
        card.classList.add('depth-controls')
      card.parentElement.classList.add('depth-scene')
      if (getComputedStyle(card).animationName !== 'none')
        card.classList.add('depth-native-motion')
      if (observer) observer.observe(card)
      else card.classList.add('depth-in-view')
    }
  }
  function move(event) {
    if (!enabled.value || event.pointerType !== 'mouse') return
    const card = event.target.closest?.('.depth-card')
    if (
      !card ||
      !root.value?.contains(card) ||
      card.classList.contains('depth-controls') ||
      card.classList.contains('depth-typography') ||
      performance?.coarse.value
    ) {
      reset()
      return
    }
    if (active !== card) {
      reset()
      active = card
    }
    cancelAnimationFrame(frame)
    const { clientX, clientY } = event
    frame = requestAnimationFrame(() => {
      frame = 0
      if (!enabled.value || active !== card) return
      const rect = card.getBoundingClientRect()
      const x = Math.max(
        -1,
        Math.min(1, ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1),
      )
      const y = Math.max(
        -1,
        Math.min(1, ((clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1),
      )
      card.style.setProperty('--depth-axis-x', String(-y || 0.001))
      card.style.setProperty('--depth-axis-y', String(x || 0.001))
      card.style.setProperty('--depth-angle', `${Math.hypot(x, y) * 1.4}deg`)
      card.style.setProperty('--depth-offset-x', `${x * 2}px`)
      card.style.setProperty('--depth-offset-y', `${y * 2}px`)
      card.classList.add('depth-live')
    })
  }
  const preference = () => {
    reduced.value = query.matches
  }
  const visibility = () => {
    hidden.value = document.hidden
  }
  watch(enabled, (value) => {
    if (!value) reset()
  })
  onMounted(() => {
    query = matchMedia('(prefers-reduced-motion: reduce)')
    query.addEventListener('change', preference)
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === root.value) visible.value = entry.isIntersecting
          else
            entry.target.classList.toggle('depth-in-view', entry.isIntersecting)
        }
      })
      observer.observe(root.value)
    }
    discover()
    mutations = new MutationObserver(discover)
    mutations.observe(root.value, { childList: true, subtree: true })
    root.value.addEventListener('pointermove', move, { passive: true })
    root.value.addEventListener('pointerleave', reset)
    window.addEventListener('scroll', reset, { passive: true })
    document.addEventListener('visibilitychange', visibility)
  })
  onUnmounted(() => {
    reset()
    observer?.disconnect()
    mutations?.disconnect()
    cards.clear()
    query?.removeEventListener('change', preference)
    root.value?.removeEventListener('pointermove', move)
    root.value?.removeEventListener('pointerleave', reset)
    window.removeEventListener('scroll', reset)
    document.removeEventListener('visibilitychange', visibility)
  })
  return { enabled }
}
