export function getGuestName() {
  const name = new URLSearchParams(window.location.search).get('to') || ''
  return (
    name
      .replace(/[\u0000-\u001F\u007F<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'Tamu Undangan'
  )
}
