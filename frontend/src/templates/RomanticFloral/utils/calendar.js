const escape = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
export function downloadCalendar(wedding, events = wedding.events) {
  const stamp = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const offsets = { 'Asia/Jakarta': '+07:00', 'Asia/Makassar': '+08:00', 'Asia/Jayapura': '+09:00' }
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Radina//Wedding//ID',
    'CALSCALE:GREGORIAN',
  ]
  events.forEach((event) => {
    const offset = offsets[event.timezone] || '+07:00'
    lines.push(
      'BEGIN:VEVENT',
      `UID:${wedding.slug}-${event.id ?? wedding.events.indexOf(event)}@radina.local`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(new Date(`${event.date}T${event.start_time}${offset}`))}`,
      `DTEND:${stamp(new Date(`${event.date}T${event.end_time}${offset}`))}`,
      `SUMMARY:${escape(`${event.title} — ${wedding.displayName || [wedding.bride?.shortName, wedding.groom?.shortName].filter(Boolean).join(' & ')}`)}`,
      `LOCATION:${escape(`${event.venue}, ${event.address || ''}`)}`,
      `DESCRIPTION:${escape(wedding.openingText)}`,
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')
  const fold = (line) => {
    const chunks = []
    let chunk = '',
      bytes = 0
    for (const char of line) {
      const size = new TextEncoder().encode(char).length
      if (bytes + size > 73) {
        chunks.push(chunk)
        chunk = ' ' + char
        bytes = 1 + size
      } else {
        chunk += char
        bytes += size
      }
    }
    chunks.push(chunk)
    return chunks.join('\r\n')
  }
  const url = URL.createObjectURL(
    new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = `${wedding.slug}.ics`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
