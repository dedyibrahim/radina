import { presetFor } from '../templates/contentPresets'
import { eventProfile } from '../services/invitationEvents'
// A presentation adapter, never a source of customer content. Every value comes from the shared API contract.
export function weddingView(data) {
  const preset = presetFor(data.template?.template_key)
  const eventType = data.event_type || 'wedding'
  const isWedding = eventType === 'wedding'
  const profile = eventProfile(eventType)
  const cover =
    data.cover_image ||
    data.hero_image ||
    (isWedding ? data.bride?.photo || data.groom?.photo : data.event_details?.photo) ||
    null
  const sections = Object.fromEntries(
    Object.entries({ ...preset.sections, ...data.section_content }).map(([key]) => [
      key,
      {
        ...preset.sections[key],
        ...(data.section_content?.[key] || {}),
      },
    ]),
  )
  const events = (data.events || []).map((event) => ({
    ...event,
    time: `${event.start_time?.slice(0, 5).replace(':', '.')} – ${event.end_time?.slice(0, 5).replace(':', '.')}`,
    maps: event.google_maps_url,
  }))
  const first = events[0] || {}
  const timezones = {
    'Asia/Jakarta': '+07:00',
    'Asia/Makassar': '+08:00',
    'Asia/Jayapura': '+09:00',
  }
  const date = data.wedding_date ? new Date(`${data.wedding_date}T12:00:00+07:00`) : null
  function person(source = {}) {
    source ||= {}
    return {
      name: source.full_name || '',
      shortName: source.nickname || source.full_name || '',
      father: source.father_name || '',
      mother: source.mother_name || '',
      photo: source.photo,
      instagram: source.instagram,
      order: source.family_order || '',
    }
  }
  return {
    id: data.id,
    templateKey: data.template?.template_key,
    eventType,
    isWedding,
    occasionLabel: profile.label,
    eventDetails: data.event_details || {},
    displayName: isWedding
      ? [
          data.bride?.nickname || data.bride?.full_name,
          data.groom?.nickname || data.groom?.full_name,
        ]
          .filter(Boolean)
          .join(' & ')
      : data.title,
    sections,
    customSectionOrder: Boolean(data.section_order?.length),
    sectionOrder: data.section_order?.length ? data.section_order : preset.order,
    slug: data.slug,
    title: data.title,
    settings: data.settings || {},
    isDemo: Boolean(data.is_demo),
    bride: person(data.bride),
    groom: person(data.groom),
    date: {
      iso: `${first.date || data.wedding_date}T${first.start_time || '00:00:00'}${timezones[first.timezone] || '+07:00'}`,
      day: date ? String(date.getDate()).padStart(2, '0') : '',
      monthNumber: date ? String(date.getMonth() + 1).padStart(2, '0') : '',
      month: date ? date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase() : '',
      year: date?.getFullYear() || '',
      weekday: date ? date.toLocaleDateString('id-ID', { weekday: 'long' }) : '',
      display: date
        ? date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '',
      timezone:
        {
          'Asia/Jakarta': 'WIB',
          'Asia/Makassar': 'WITA',
          'Asia/Jayapura': 'WIT',
        }[first.timezone] || 'WIB',
    },
    events,
    akad: events[0],
    reception: events[1],
    location: {
      name: first.venue || '',
      city: '',
      address: first.address || '',
      maps: first.maps || '',
      embed: first.venue
        ? `https://maps.google.com/maps?q=${encodeURIComponent(`${first.venue} ${first.address || ''}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
        : '',
    },
    quote: data.section_content?.quote?.content || data.quote,
    quoteSource: data.quote_source,
    openingText: data.opening_text ?? preset.opening_text,
    closingText: data.closing_text,
    cover,
    hero: data.hero_image || cover,
    closing: data.closing_image || data.hero_image || cover,
    gallery: (data.gallery || []).map((photo) => ({
      src: photo.image,
      alt: photo.caption || (isWedding ? 'Momen pernikahan' : 'Dokumentasi acara'),
    })),
    loveStory: (data.stories || []).map((story) => ({
      year: story.date_label,
      title: story.title,
      text: story.description,
      image: story.image,
    })),
    giftMethods: (data.gift_methods || []).filter((g) => g.is_active),
    bankAccounts: (data.gifts || []).map((gift) => ({
      bank: gift.bank,
      number: gift.account_number,
      owner: gift.account_name,
      logo: gift.logo,
    })),
    giftAddress: [
      data.shipping_gift?.recipient,
      data.shipping_gift?.address,
      data.shipping_gift?.phone,
    ]
      .filter(Boolean)
      .join(' — '),
    music: data.music?.playlist?.[0]?.url || data.music?.music_url,
    volume: (data.music?.volume ?? 40) / 100,
    autoplayAfterOpen: data.music?.autoplay_after_open,
    video: {
      enabled: Boolean(data.video_url),
      src: data.video_url,
      poster: data.hero_image || data.cover_image,
    },
    livestream: data.livestream?.url,
    socialMedia: { hashtag: data.hashtag },
  }
}
