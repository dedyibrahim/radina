# Invitation visual system

The upgrade is a presentation layer on `WeddingExperience`. Existing template
entry points, palettes, typography, layouts, galleries and navigation styles
remain in their own Vue/CSS files. Laravel data, prices, template availability,
licenses, customer approvals and publication rules are unchanged.

`templateVisualConfig.js` derives a profile from current catalog metadata and
the existing design. It has no fixed template count. The source audit and tests
discover actual keys from `templateRegistry`, including Studio and Atelier
entries which intentionally share renderers. See `template-visual-audit.md` for
the per-template audit and local availability snapshot.

## Extend a template

Keep the existing Vue layout, use `WeddingExperience`, and register its normal
CMS preset. Its category supplies a default visual profile. Optionally add a
developer-managed `visual` object to its preset, Studio or Atelier definition:

```json
{
  "visual": {
    "ornamentFamily": "islamic",
    "ornament": "arabesque",
    "secondaryOrnament": "arch",
    "photoFrame": "arch",
    "openingEffect": "arch",
    "depthIntensity": 0.4,
    "parallaxIntensity": 0.2,
    "texture": "paper",
    "animations": ["soft", "rise", "depth"]
  }
}
```

The configuration controls ornaments, materials, opening and reveal motion,
photo details, dividers and music skin. It does not choose or replace the layout.
All audio remains in the single `useAudio` instance provided by WeddingRenderer.
The click silently prepares that same element; audible playback starts after
the cover leaves. Section navigation still calls `scrollIntoView()`.

Add lightweight SVG assets under `frontend/src/assets/wedding/ornaments/<family>`.
`ornamentLibrary` discovers them automatically. Assets are separate cacheable
files rather than embedding the entire library into the invitation JavaScript.
The audit test rejects missing ornaments before deployment. Atmosphere layers
are decorative, `aria-hidden`, clipped to their own scene and never intercept
clicks. No transform is applied to the root containing fixed controls.

## Motion and quality

- HIGH: fine pointer interaction and bounded scroll parallax, 24 particles,
  limited depth-of-field and glass blur.
- STANDARD: 12 particles, static parallax, no pointer on touch screens,
  small photo and ornament motion.
- LITE: reduced motion, data saving or modest device capacity; static
  ornaments, no particles, no tilt or backdrop blur. Identity remains visible.

Only viewport size, pointer capability, reduced-motion preference, optional
reported memory/core counts and data-saving preference are used locally.
Nothing is recorded or sent for device detection. Offscreen decorations pause;
document visibility and the existing Animasi button pause the experience.
SVG/paper/linen/silk textures stay subtle. Content is never hidden in LITE.

Admin preview embeds the same authenticated preview route in a single iframe.
Desktop/Tablet/Mobile resize its viewport without changing `src` or recreating
the audio engine. Section messages require the same origin and parent frame,
and only the preview section allowlist is accepted. Existing authorization and
read-only preview APIs still apply.

## Verify

```sh
npm run build
npm run test:visual-system
npm run test:visual-browser
node scripts/template-visual-test.mjs --audit
```

The browser suite uses local mocked API fixtures, never production writes. It
renders all discovered templates on desktop and mobile, tests representative
personalities at 360/375/390/414/430px, shared lightboxes, content preservation,
calendar source, navigation/audio continuity, opening timing, quality modes and
actual preview iframe sizes. Screenshots and results are in ignored
`test-results/template-visuals` for visual comparison. Audio timing/state checks
use an Audio fixture; real playback still depends on browser autoplay rules.
