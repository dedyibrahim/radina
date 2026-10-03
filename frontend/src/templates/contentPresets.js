// One developer-managed preset contract, shared with Laravel. CMS overrides are stored separately.
import presets from '../../../config/template-presets.json'
export const contentPresets = presets
export function presetFor(key) {
  return contentPresets[key] || contentPresets['romantic-floral']
}
