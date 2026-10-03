import profiles from '../../../config/invitation-events.json'
export const eventProfiles = profiles
export const eventOptions = Object.entries(profiles).map(([value, profile]) => ({
  value,
  label: profile.label,
}))
export const agendaOptions = [
  ['akad', 'Akad Nikah'],
  ['reception', 'Resepsi'],
  ['ngunduh', 'Ngunduh Mantu'],
  ['afterparty', 'After Party'],
  ['ceremony', 'Seremoni'],
  ['syukuran', 'Syukuran'],
  ['meeting', 'Pertemuan'],
  ['seminar', 'Seminar'],
  ['gathering', 'Gathering'],
  ['celebration', 'Perayaan'],
  ['other', 'Agenda Lainnya'],
]
export function eventProfile(type) {
  return profiles[type] || profiles.wedding
}
export function eventDetailsFields(type) {
  const profile = eventProfile(type)
  const fields = [['host_name', profile.host_label, 'text', true]]
  if (profile.honoree)
    fields.push(
      ['honoree_name', profile.honoree_label, 'text', true],
      ['father_name', 'Nama ayah (opsional)', 'text', false],
      ['mother_name', 'Nama ibu (opsional)', 'text', false],
    )
  fields.push(['description', 'Tentang acara / penyelenggara', 'textarea', false])
  return fields
}
