// One developer-managed preset contract, shared with Laravel. CMS overrides are stored separately.
import presets from '../../../config/template-presets.json'
import floralPresets from '../../../config/floral-presets.json'
import cinematicWorlds from '../../../config/cinematic-worlds.json'

import worldContent from '../../../config/cinematic-content.json'
const worldPresets = Object.fromEntries(
  Object.entries(cinematicWorlds).map(([key, world]) => [
    key,
    {
      ...worldContent,
      ...(world.content || {}),
      name: world.name,
      studio: true,
      category: world.category,
      gallery_style: world.photo,
      mood: [world.category, world.world],
      motion: world.effects,
      palette: world.palette,
    },
  ]),
)
export const contentPresets = { ...presets, ...floralPresets, ...worldPresets }
export function presetFor(key) {
  return contentPresets[key] || contentPresets['romantic-floral']
}
