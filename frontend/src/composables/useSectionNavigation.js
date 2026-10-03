export const sectionKeys = [
  'home',
  'quote',
  'couple',
  'story',
  'event',
  'gallery',
  'gift',
  'rsvp',
  'wishes',
  'closing',
  'date',
  'video',
  'location',
  'livestream',
]
export function scrollToSection(key) {
  if (!sectionKeys.includes(key)) return
  document.getElementById(key)?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  })
}
