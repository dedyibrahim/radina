# Midnight Romance — living night garden

Existing template key, price and CMS records are retained. No migration or license code changes.

Every visible CMS section has its own sticky viewport environment. The moonlit photographic plate moves slowly while separate rose cutouts sway, fog drifts, candle light flickers, fireflies travel, petals fall and water reflections ripple. Three camera compositions follow the section. Customer photos retain their natural colors and content/navigation/form behavior remains shared.

Animations pause outside the viewport, when the page is hidden, when the invitation's motion setting is off and when the guest turns animation off. OS reduced motion stops all scene animation. Lite devices receive four fireflies, three petals, one mist layer and two ripples. The scene is decorative and cannot intercept clicks. Assets use responsive WebP; the opening loads eagerly and later scenery loads lazily.

The shared jasmine branches used by Melati Senja and other living garden scenes now grow upright from beyond the bottom edge. Removed 150–155-degree rotations, top-corner placements and vertical inversion; the right image is mirrored horizontally only. Sway is limited to two degrees. This corrects the closing scene's detached inverted branch.

## Generated assets

Mode: built-in imagegen. Original PNGs retained at the tool's generated_images location. The project uses these compressed files:

- `frontend/public/images/cinematic/midnight-garden-640.webp`
- `frontend/public/images/cinematic/midnight-garden-1024.webp`
- `frontend/public/images/cinematic/midnight-roses.webp` (384px, alpha preserved)

### Environment prompt

Use case: photorealistic-natural. Asset type: vertical photographic background for Radina Midnight Romance wedding invitation, 1024x1536 portrait. Primary request: an elegant cinematic moonlit rose garden, a living film still with realistic depth. Scene: a narrow reflective garden pool and stone path recede to a softly lit romantic garden pavilion; natural rose bushes and dark leaves frame the lower edges, distant trees on either side, open night sky with soft moonlight in upper third. Materials: realistic damp stone, rose petals, gently rippled water, warm candle lanterns beside the path. Lighting: deep navy and burgundy shadows, restrained warm blush gold lights, mist in the distance, believable blue hour photography. Composition: centered clear negative space for wedding typography, foreground natural plants rooted in the bottom edge, middle pool, distant architecture. Style: high-end editorial landscape photography, atmospheric and elegant, no drawing or sketch. Constraints: no people, no text, no logos, no watermarks, no upside-down plants, no hanging detached flower branches. This is a clean background plate; moving particles and fog will be added in code.

### Foreground prompt

Use case: photorealistic-natural. Asset type: transparent foreground cutout for an animated cinematic Midnight Romance garden invitation. A lush natural cluster of burgundy and dusty pink garden roses, small buds and dark olive leaves growing upward out of the bottom edge. One compact gracefully curved plant, upright stems root at bottom left and flowers above, cluster reaching diagonally to upper right. Realistic photographed botanical textures, moonlit blue rim light and very soft warm gold highlights; elegant premium wedding mood. Full plant fits in portrait image with a transparent background. No pot, no detached hanging branch, no upside-down flowers, no people, no typography, no watermark, no scenery, no opaque backdrop. True alpha transparency.

## Verification

- `npm run build`
- `node scripts/template-visual-test.mjs`
- `$env:RADINA_MIDNIGHT='1'; node scripts/template-visual-browser-test.mjs`
- `$env:RADINA_LIVING_GARDEN='1'; node scripts/template-visual-browser-test.mjs`

The browser checks exercise real transform changes independently across six layers, upright stems, responsive layout, gesture-started audio, gallery, RSVP, motion toggle, OS reduced motion, lite devices and the public preview iframe. The living garden checks verify branch orientation and movement on every section.
