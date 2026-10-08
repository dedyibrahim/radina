# Template identity motion

All existing registry entries inherit the shared motion system through `WeddingExperience`. Primary artwork, palettes and layouts remain in their original template configuration. `templateMotionDesign.js` chooses a compatible secondary ornament and stable camera path, timing and phase from each template key. Explicit `visual.secondaryOrnament` overrides still take precedence.

The motion styles follow the template personality: botanical breeze for flowers/gardens, silk for luxury, illuminated arches for Islamic, carved patterns for Nusantara, paper for vintage, waves for coastal, stars for celestial, glass for modern, restrained architecture for minimalist/classical, and ribbons/confetti/balloons for celebrations. Dedicated Royal Garden, Melati and Midnight scenery retains its own artwork and choreography.

Background cameras overscan their clipped scene to cover every edge during movement. Depth affects decorative layers and photographs; fixed navigation stays outside transformed ancestors. The large inter-section monogram is removed. Floral corners pause when outside the viewport or when animation is disabled. Existing low-power, reduced-motion and hidden-document behavior remains in place.

No database migration or catalog seeding is required. Package prices, customer records, template availability and licensing are unaffected.

Validation commands, run from the backend directory:

```powershell
node scripts/template-visual-test.mjs
npm --prefix frontend run build
$env:RADINA_ALL_IDENTITIES='1'
node scripts/template-visual-browser-test.mjs
Remove-Item Env:RADINA_ALL_IDENTITIES
```

The browser suite uses local API fixtures and the production frontend build. It checks every registered template on mobile, then representatives of each personality on desktop, including actual ornament movement, perspective, camera coverage, gallery interaction, personalized RSVP, animation toggles and reduced-motion preferences. Dedicated Royal Garden, Midnight and Melati suites cover their custom scenery separately.
