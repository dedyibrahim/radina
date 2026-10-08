# Javanese Royal Garden

One new wedding template, `javanese-royal-garden`, in the existing Regional category. The initial price is Rp179.000 and remains editable by the admin. Existing templates, prices and customer content are preserved.

The dedicated renderer has four distinct garden environments: a new entrance gate and garden walkway, the existing pendopo, and the existing sunset garden. Jasmine branches grow upright from beyond the bottom edge; horizontal mirroring on the right preserves their natural vertical orientation. Each visible chapter has restrained camera movement, swaying branches, drifting mist, falling petals/leaves, sunlight, canopy shadows and floating light. Birds and water reflections are reduced on slower devices. Customer photos are not filtered.

The bride and groom each have a chapter. Each CMS story entry and visible event has its own chapter; countdown uses another chapter when enabled. A full invitation with three stories and two events has 16 content scenes, plus the six-second opening. Fewer entries create fewer chapters; no duplicate customer data is stored. Navigation retains the existing section identifiers and shared audio state. Asset paths, generation prompts and source notes are in [javanese-royal-garden-assets.md](javanese-royal-garden-assets.md).

The existing renderer retains ownership of opening state, audio, navigation and CMS data. Only this template supplies the optional opening and scene components. Other templates keep their original components and configuration. Shared gallery, gifts, RSVP, wishes and moderation logic are reused. The events scene uses the CMS countdown selection and offers separate maps and calendar downloads for each event.

Preview: `/templates/javanese-royal-garden/preview`. The normal preview toolbar and its iframe are supported. Guest personalization through `?to=` is preserved.

Deployment migration `2026_10_08_000005_add_javanese_royal_garden_template.php` uses the additive catalog installer. Re-running it preserves existing rows and custom prices. Rollback never removes purchased template references. No license or customer data is deleted.

Verification:

- Production build and the 149-entry template registry audit.
- Initial installation backend validation: `php vendor/bin/phpunit --filter "InvitationEventTest|TemplateExpansionTest" --testdox`, including repeated migration, old catalog snapshots, licenses, order pricing and CMS preview (13 tests, 1,364 assertions). This visual revision changes no backend, migrations, licenses or catalog pricing.
- Browser: `RADINA_ROYAL_OPENING=1` and `RADINA_ROYAL_GARDEN=1` modes of `scripts/template-visual-browser-test.mjs`, against the production build with API/audio fixtures.
- Opening and sections at widths 320, 360, 375, 390, 414, 430, 768, 1024, 1280 and 1440; screenshots in `test-results/template-visuals/royal-garden-*` and `javanese-royal-garden-opening-390.png`.
- Guest personalization, music gesture and navigation continuity, CMS countdown/event calendar, gallery keyboard/swipe, gift clipboard, RSVP with message, all 16 scenes, upright branch geometry, reduced motion, slower-device particle limits, shared preview and old renderer smoke checks. Individual chapter screenshots are in `test-results/template-visuals/royal-chapter-*`.

Browser interaction checks use fixtures; production deployment and live-device audio behavior are not asserted by these checks.

## Full bleed and depth refinement

The decorative section monogram is hidden in this renderer; it previously entered normal flow because of the content-layer positioning rule and created a large empty block before the bride. Dividers outside the individual chapter scenes are also hidden. Cover names and customer content are retained.

Scenery bypasses Tailwind's image max-width constraint and extends 11% beyond each viewport edge. This prevents pale strips at the right and lower edges during camera motion. A matching backdrop covers the whole scene for chapters taller than the viewport. The same max-width correction applies to the shared photographic cinematic plate and Midnight Romance.

Camera and foreground flowers now use independent perspective transforms. Royal Garden also responds to desktop pointer/scroll with different parallax strengths for scenery, mist and flowers. Low-end Royal cameras retain two-dimensional movement; reduced motion disables animation and parallax. The visibility observer tracks the sticky environment rather than the whole long CMS section.

Browser checks sample camera coverage at five positions throughout the animation across all ten Royal widths and all four Midnight widths. They also verify that the bride chapter begins without the monogram gap and that the camera/foreground render distinct 3D transforms and desktop pointer parallax.

The shared visibility composable now consumes the last queued IntersectionObserver entry. Reading only the first could leave a visible section paused after fast scrolling. The living garden browser checks reproduced this in the video section before the correction and now verify movement across all fourteen sections on desktop, mobile and reduced-motion profiles.
