import { ref, inject } from 'vue'
export function useGallery() {
  const wedding = inject('wedding')
  const active = ref(-1)
  const touchStart = ref(0)
  function move(direction) {
    active.value = (active.value + direction + wedding.gallery.length) % wedding.gallery.length
  }
  function onKey(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    }
  }
  function onTouchEnd(event) {
    const delta = event.changedTouches[0].clientX - touchStart.value
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1)
  }
  function onTouchStart(event) {
    touchStart.value = event.touches[0].clientX
  }
  return { wedding, active, move, onKey, onTouchEnd, onTouchStart }
}
