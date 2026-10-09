import studio from '../../../../config/template-studio.json'
import floral from '../../../../config/floral-collection.json'
import { contentPresets } from '../contentPresets'
import cinematicWorlds from '../../../../config/cinematic-worlds.json'
import { motionDesignFor } from './templateMotionDesign'
import { artDirectionFor } from './templateArtDirection'

// Presentation profiles, not template keys. New registry entries inherit a profile
// from their catalog metadata and can opt into any combination with `visual`.
export const visualProfiles = {
  classical: {
    ornamentFamily: 'classical',
    ornament: 'column',
    texture: 'paper',
    photoFrame: 'floating',
    openingEffect: 'gate',
    divider: 'gold',
    musicSkin: 'gold',
    eventSurface: 'stationery',
    giftSurface: 'note',
    light: 'champagne',
    depthIntensity: 0.4,
    parallaxIntensity: 0.2,
    animations: ['soft', 'rise', 'line'],
  },
  oriental: {
    ornamentFamily: 'botanical',
    ornament: 'bamboo',
    texture: 'paper',
    photoFrame: 'editorial',
    openingEffect: 'paper',
    divider: 'line',
    musicSkin: 'minimal',
    eventSurface: 'stationery',
    giftSurface: 'note',
    light: 'rose',
    depthIntensity: 0.4,
    parallaxIntensity: 0.2,
    animations: ['line', 'soft', 'drift'],
  },
  floral: {
    ornamentFamily: 'floral',
    ornament: 'rose',
    texture: 'paper',
    photoFrame: 'layered',
    openingEffect: 'bloom',
    divider: 'vine',
    musicSkin: 'flower',
    eventSurface: 'stationery',
    giftSurface: 'envelope',
    light: 'rose',
    depthIntensity: 0.7,
    parallaxIntensity: 0.35,
    animations: ['rise', 'soft', 'bloom'],
  },
  garden: {
    ornamentFamily: 'botanical',
    ornament: 'eucalyptus',
    texture: 'linen',
    photoFrame: 'organic',
    openingEffect: 'garden',
    divider: 'vine',
    musicSkin: 'leaf',
    eventSurface: 'garden',
    giftSurface: 'note',
    light: 'sunbeam',
    depthIntensity: 0.6,
    parallaxIntensity: 0.4,
    animations: ['soft', 'rise', 'drift'],
  },
  luxury: {
    ornamentFamily: 'luxury',
    ornament: 'pearl',
    secondaryOrnament: 'silk',
    texture: 'silk',
    photoFrame: 'floating',
    openingEffect: 'arch',
    divider: 'gold',
    musicSkin: 'gold',
    eventSurface: 'glass',
    giftSurface: 'glass',
    light: 'champagne',
    depthIntensity: 0.6,
    parallaxIntensity: 0.2,
    animations: ['soft', 'depth', 'rise'],
  },
  minimalist: {
    ornamentFamily: 'modern',
    ornament: 'geometry',
    texture: 'linen',
    photoFrame: 'editorial',
    openingEffect: 'editorial',
    divider: 'line',
    musicSkin: 'minimal',
    eventSurface: 'type',
    giftSurface: 'type',
    light: 'daylight',
    depthIntensity: 0.25,
    parallaxIntensity: 0.15,
    animations: ['soft', 'line', 'rise'],
  },
  islamic: {
    ornamentFamily: 'islamic',
    ornament: 'arabesque',
    secondaryOrnament: 'arch',
    texture: 'paper',
    photoFrame: 'arch',
    openingEffect: 'arch',
    divider: 'geometric',
    musicSkin: 'gold',
    eventSurface: 'arch',
    giftSurface: 'note',
    light: 'moonlight',
    depthIntensity: 0.4,
    parallaxIntensity: 0.2,
    animations: ['rise', 'soft', 'depth'],
  },
  nusantara: {
    ornamentFamily: 'nusantara',
    ornament: 'kawung',
    secondaryOrnament: 'songket',
    texture: 'woven',
    photoFrame: 'carved',
    openingEffect: 'gate',
    divider: 'pattern',
    musicSkin: 'gold',
    eventSurface: 'traditional',
    giftSurface: 'note',
    light: 'amber',
    depthIntensity: 0.45,
    parallaxIntensity: 0.2,
    animations: ['soft', 'rise', 'line'],
  },
  cinematic: {
    ornamentFamily: 'celestial',
    ornament: 'light-ray',
    texture: 'film',
    photoFrame: 'film',
    openingEffect: 'light',
    divider: 'light',
    musicSkin: 'soundtrack',
    eventSurface: 'cinematic',
    giftSurface: 'glass',
    light: 'spotlight',
    depthIntensity: 0.5,
    parallaxIntensity: 0.3,
    animations: ['depth', 'soft', 'drift'],
  },
  celestial: {
    ornamentFamily: 'celestial',
    ornament: 'constellation',
    texture: 'grain',
    photoFrame: 'halo',
    openingEffect: 'constellation',
    divider: 'stars',
    musicSkin: 'glass',
    eventSurface: 'glass',
    giftSurface: 'glass',
    light: 'moonlight',
    depthIntensity: 0.45,
    parallaxIntensity: 0.3,
    animations: ['soft', 'depth', 'rise'],
  },
  vintage: {
    ornamentFamily: 'vintage',
    ornament: 'postmark',
    texture: 'paper',
    photoFrame: 'paper',
    openingEffect: 'letter',
    divider: 'tear',
    musicSkin: 'vinyl',
    eventSurface: 'letter',
    giftSurface: 'envelope',
    light: 'candle',
    depthIntensity: 0.4,
    parallaxIntensity: 0.2,
    animations: ['drift', 'soft', 'rise'],
  },
  coastal: {
    ornamentFamily: 'nature',
    ornament: 'wave',
    texture: 'sand',
    photoFrame: 'postcard',
    openingEffect: 'ocean',
    divider: 'wave',
    musicSkin: 'glass',
    eventSurface: 'postcard',
    giftSurface: 'note',
    light: 'sunset',
    depthIntensity: 0.5,
    parallaxIntensity: 0.35,
    animations: ['drift', 'soft', 'rise'],
  },
  modern: {
    ornamentFamily: 'modern',
    ornament: 'mesh',
    texture: 'grain',
    photoFrame: 'glass',
    openingEffect: 'glass',
    divider: 'line',
    musicSkin: 'glass',
    eventSurface: 'glass',
    giftSurface: 'glass',
    light: 'daylight',
    depthIntensity: 0.45,
    parallaxIntensity: 0.2,
    animations: ['depth', 'line', 'soft'],
  },
  playful: {
    ornamentFamily: 'romantic',
    ornament: 'ribbon',
    texture: 'paper',
    photoFrame: 'polaroid',
    openingEffect: 'paper',
    divider: 'ribbon',
    musicSkin: 'flower',
    eventSurface: 'ticket',
    giftSurface: 'envelope',
    light: 'rose',
    depthIntensity: 0.5,
    parallaxIntensity: 0.25,
    animations: ['bloom', 'drift', 'rise'],
  },
}
// Motion belongs to the design identity. New templates inherit it from their
// visual profile and may replace individual fields in `visual.motionProfile`.
export const motionProfiles = {
  floral: {
    environment: 'garden',
    foreground: 'flower',
    particle: 'petal',
    openingType: 'bloom-reveal',
    ambient: 'soft',
  },
  garden: {
    environment: 'garden',
    foreground: 'leaf',
    particle: 'petal',
    openingType: 'garden-gate',
    ambient: 'soft',
  },
  luxury: {
    environment: 'silk',
    foreground: 'fabric',
    particle: 'dust',
    openingType: 'light-reveal',
    ambient: 'slow',
  },
  minimalist: {
    environment: 'architectural',
    foreground: 'geometry',
    particle: 'none',
    openingType: 'panels',
    ambient: 'slow',
  },
  islamic: {
    environment: 'arch',
    foreground: 'lantern',
    particle: 'light',
    openingType: 'arch',
    ambient: 'slow',
  },
  nusantara: {
    environment: 'textile',
    foreground: 'pattern',
    particle: 'dust',
    openingType: 'gate',
    ambient: 'slow',
  },
  cinematic: {
    environment: 'film',
    foreground: 'light',
    particle: 'dust',
    openingType: 'film-light',
    ambient: 'slow',
  },
  celestial: {
    environment: 'night',
    foreground: 'star',
    particle: 'star',
    openingType: 'night-sky',
    ambient: 'slow',
  },
  vintage: {
    environment: 'paper',
    foreground: 'letter',
    particle: 'dust',
    openingType: 'envelope',
    ambient: 'slow',
  },
  coastal: {
    environment: 'coast',
    foreground: 'wave',
    particle: 'light',
    openingType: 'wave',
    ambient: 'soft',
  },
  modern: {
    environment: 'glass',
    foreground: 'reflection',
    particle: 'light',
    openingType: 'glass',
    ambient: 'slow',
  },
  playful: {
    environment: 'paper',
    foreground: 'ribbon',
    particle: 'petal',
    openingType: 'paper',
    ambient: 'soft',
  },
  classical: {
    environment: 'hall',
    foreground: 'architecture',
    particle: 'dust',
    openingType: 'arch-reveal',
    ambient: 'slow',
  },
  oriental: {
    environment: 'bamboo',
    foreground: 'leaf',
    particle: 'petal',
    openingType: 'paper',
    ambient: 'soft',
  },
}
const categories = {
  Creative: 'playful',
  Regional: 'nusantara',
  'Kids & Birthday': 'playful',
  Classical: 'classical',
  Oriental: 'oriental',
  Romantic: 'floral',
  Garden: 'garden',
  Luxury: 'luxury',
  Elegant: 'luxury',
  Minimalist: 'minimalist',
  Islamic: 'islamic',
  Traditional: 'nusantara',
  Cinematic: 'cinematic',
  Dreamy: 'celestial',
  Vintage: 'vintage',
  Destination: 'coastal',
  Modern: 'modern',
  Playful: 'playful',
}
const designs = {
  amore: 'floral',
  garden: 'garden',
  noir: 'luxury',
  pure: 'minimalist',
  sakinah: 'islamic',
  nusantara: 'nusantara',
  cinema: 'cinematic',
  dark: 'celestial',
  letters: 'vintage',
  daydream: 'playful',
}
const artOrnaments = {
  rose: 'rose',
  branches: 'olive',
  meadow: 'wildflower',
  greenhouse: 'fern',
  batik: 'kawung',
  songket: 'songket',
  wayang: 'carved',
  waves: 'wave',
  dunes: 'mountain',
  pearls: 'pearl',
  curtains: 'silk',
  film: 'light-ray',
  postal: 'postmark',
  vinyl: 'postmark',
  stars: 'constellation',
  lines: 'geometry',
  sculpture: 'geometry',
  glass: 'mesh',
}
const frames = {
  arch: 'arch',
  letter: 'paper',
  editorial: 'editorial',
  cinema: 'film',
  carousel: 'floating',
  collage: 'polaroid',
  split: 'editorial',
  card: 'layered',
}
const openings = {
  arch: 'arch',
  letter: 'letter',
  editorial: 'editorial',
  cinema: 'light',
  carousel: 'bloom',
  collage: 'paper',
  split: 'editorial',
}
export function visualConfigFor(key, context = {}) {
  const preset = contentPresets[key] || {}
  const collection = floral[key] || studio[key] || cinematicWorlds[key] || {}
  // Category wins over mood: studio catalog music mood is not a design identity.
  const category = collection.category || preset.category || context.category
  const gallery = (preset.gallery_style || '').toLowerCase()
  const inferred = /garden|travel journal/.test(gallery)
    ? 'garden'
    : /vintage|polaroid/.test(gallery)
      ? 'vintage'
      : /night|star-map/.test(gallery)
        ? 'celestial'
        : /cinematic/.test(gallery)
          ? 'cinematic'
          : /creative collage/.test(gallery)
            ? 'playful'
            : /clean grid|exhibition/.test(gallery)
              ? 'minimalist'
              : /heritage/.test(gallery)
                ? 'nusantara'
                : /asymmetric/.test(gallery)
                  ? 'luxury'
                  : null
  const stylistic = /classic european/i.test(preset.style || '')
    ? 'classical'
    : /oriental modern/i.test(preset.style || '')
      ? 'oriental'
      : /tropical destination/i.test(preset.style || '')
        ? 'garden'
        : /fashion editorial/i.test(preset.style || '')
          ? 'minimalist'
          : null
  const personality =
    stylistic ||
    categories[collection.category || preset.category] ||
    designs[context.design] ||
    inferred ||
    categories[context.category] ||
    (/Islamic/.test((preset.mood || []).join(' '))
      ? 'islamic'
      : /Cinematic/.test((preset.mood || []).join(' '))
        ? 'cinematic'
        : 'floral')
  const profile = visualProfiles[personality]
  const world = cinematicWorlds[key]
  const genericScenes = {
    classical: 'melayu-river-palace',
    oriental: 'sunda-mountain',
    floral: 'kids-firefly-garden',
    garden: 'bali-water-garden',
    luxury: 'melayu-river-palace',
    minimalist: 'nusantara-horizon',
    islamic: 'quiet-arch',
    nusantara: 'nusantara-horizon',
    cinematic: 'film-garden',
    celestial: 'kids-space-expedition',
    vintage: 'betawi-garden-house',
    coastal: 'maluku-island-dusk',
    modern: 'glass-atrium',
    playful: 'kids-candy-cloud',
  }
  const sceneProfile = world
    ? { ...world, id: key }
    : {
        id: personality,
        name: profile.ornament,
        category: personality,
        world: preset.name || 'Radina',
        scene: genericScenes[personality] || 'nusantara-horizon',
        opening: profile.openingEffect,
        camera: ['dolly-in', 'pan-left', 'pan-right', 'dolly-out'][
          [...(key || 'radina')].reduce(
            (sum, char) => sum + char.codePointAt(0),
            0,
          ) % 4
        ],
        transition: 'light-dissolve',
        photo: profile.photoFrame,
        typography: personality,
        closing: 'soft-fade',
        effects:
          motionProfiles[personality]?.particle === 'none'
            ? []
            : [motionProfiles[personality]?.particle || 'dust'],
        palette: {
          background: 'var(--ivory)',
          ink: 'var(--ink)',
          accent: 'var(--gold)',
          highlight: 'var(--sage)',
        },
      }
  // A dedicated art direction for this existing key; no new template or CMS data.
  if (key === 'golden-atelier')
    Object.assign(sceneProfile, {
      id: key,
      category: 'Luxury',
      scene: 'golden-atelier',
      world: 'Golden Atelier',
      opening: 'atelier-light',
      camera: 'dolly-out',
      photo: 'editorial',
      typography: 'editorial',
      plate: 'golden-atelier',
      composition: 'atelier',
      palette: {
        background: '#231c16',
        ink: '#fff5df',
        accent: '#e6bd74',
        highlight: '#a48356',
      },
    })
  sceneProfile.cinematic = Boolean(world || key === 'golden-atelier')
  const variant = [...(key || 'radina')].reduce(
    (sum, char) => (sum * 31 + char.codePointAt(0)) >>> 0,
    0,
  )
  const overrides = {
    ...preset.visual,
    ...collection.visual,
    ...context.visual,
  }
  const config = {
    ...profile,
    personality,
    category: category || personality,
    layout:
      collection.layout || collection.family || context.design || 'original',
    galleryStyle: preset.gallery_style || 'original',
    ornament: artOrnaments[collection.art] || profile.ornament,
    secondaryOrnament: profile.secondaryOrnament || profile.ornament,
    photoFrame: world?.photo || frames[collection.family] || profile.photoFrame,
    openingEffect: sceneProfile.cinematic
      ? sceneProfile.opening
      : openings[collection.family] || profile.openingEffect,
    ...(collection.art === 'dunes'
      ? { openingEffect: 'light', divider: 'line' }
      : {}),
    ...(/tropical destination/i.test(preset.style || '')
      ? { ornament: 'tropical', secondaryOrnament: 'tropical' }
      : {}),
    // Existing Atelier flower art is retained; extra layers use its flower type.
    ...(floral[key] &&
    !['minimalist', 'islamic', 'nusantara', 'cinematic', 'modern'].includes(
      personality,
    )
      ? {
          ornamentFamily: collection.flower === 'fern' ? 'botanical' : 'floral',
          ornament: collection.flower || 'rose',
          secondaryOrnament: collection.flower || 'rose',
        }
      : {}),
    variant: variant % 6,
    particleType: (collection.motion || preset.motion || ['sparkles'])[0],
    ...overrides,
    motionProfile: {
      ...motionProfiles[personality],
      ...(world
        ? {
            environment: world.scene,
            particle: world.effects[0] || 'none',
            openingType: world.opening,
          }
        : {}),
      ...(overrides.motionProfile || {}),
    },
    sceneProfile,
  }
  config.motionDesign = motionDesignFor(key, config)
  if (!overrides.secondaryOrnament)
    config.secondaryOrnament = config.motionDesign.secondary
  if (
    !world &&
    !overrides.motionProfile?.particle &&
    config.motionDesign.style === 'celebration'
  ) {
    const effects = collection.motion || preset.motion || []
    config.motionProfile.particle =
      ['confetti', 'balloons', 'bubbles', 'paper'].find((effect) =>
        effects.includes(effect),
      ) || 'confetti'
  }
  config.artDirection = artDirectionFor(key, config, collection)
  return config
}
export const templateVisualConfig = Object.fromEntries(
  Object.keys(contentPresets).map((key) => [key, visualConfigFor(key)]),
)
