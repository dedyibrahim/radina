// Preserve each template's primary artwork; choose a compatible second element
// and a reproducible movement signature from its identity, never random per visit.
const ornaments = {
  floral: [
    'baby-breath',
    'jasmine',
    'lavender',
    'wildflower',
    'magnolia',
    'camellia',
  ],
  botanical: [
    'olive',
    'eucalyptus',
    'fern',
    'vine',
    'grass',
    'bamboo',
    'tropical',
    'wildflower',
  ],
  luxury: ['silk', 'pearl', 'gold-frame'],
  modern: ['geometry', 'mesh'],
  islamic: ['arabesque', 'arch'],
  nusantara: ['kawung', 'songket', 'carved'],
  celestial: ['constellation', 'light-ray'],
  vintage: ['postmark', 'envelope', 'vinyl'],
  nature: ['wave', 'mountain'],
  romantic: ['ribbon', 'butterfly', 'balloon'],
  classical: ['column', 'arch'],
}
const styles = {
  floral: 'botanical',
  garden: 'botanical',
  oriental: 'botanical',
  islamic: 'luminous',
  luxury: 'silk',
  classical: 'architectural',
  nusantara: 'heritage',
  vintage: 'paper',
  coastal: 'water',
  celestial: 'starlight',
  cinematic: 'light',
  modern: 'glass',
  minimalist: 'architectural',
  playful: 'celebration',
}
export function motionDesignFor(key, config) {
  const seed = [...(key || 'radina')].reduce(
    (sum, character) => (Math.imul(sum, 31) + character.codePointAt(0)) >>> 0,
    0,
  )
  const choices = (ornaments[config.ornamentFamily] || []).filter(
    (name) => name !== config.ornament,
  )
  return {
    style: styles[config.personality] || 'glass',
    secondary: choices[seed % choices.length] || config.secondaryOrnament,
    camera: ['dolly', 'glide', 'orbit'][seed % 3],
    duration: 16 + (seed % 15),
    phase: -(seed % 29),
    sway: 5 + (seed % 37) / 10,
    direction: seed % 2 ? 'alternate-reverse' : 'alternate',
  }
}
