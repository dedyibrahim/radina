# Radina cinematic engine 2 â€” implementation audit

## Starting point

The registry contains 111 existing templates: individual Vue compositions, Floral Atelier and Studio configurations. Vue 3 Composition API, Vue Router, Pinia, scoped invitation CSS and Tailwind run over Laravel's existing orders, weddings, events, customer portals, music and licensing APIs. Registry discovery is automated by `scripts/template-visual-test.mjs`; counts are never inferred from directory names.

Reuse WeddingRenderer, useWedding, useAudio, semantic section navigation, SectionFrame, CMS section overrides, RSVP, gifts, maps, gallery, customer approval, performance detection and opt-in Auto Journey. The public page, template preview and customer preview already share WeddingRenderer.

The draft's universal opening and viewport-sized two-column layout were unsuitable for the narrow invitation shell. Scene colors defined on a child were unavailable to its parent. A veil selector could put a decorative overlay into grid flow. Global curtain/ornament layers added competing motion. Replace those rules; retain distinct existing cover/hero compositions and introduce dedicated world scenes only where configured.

## Contract

`config/cinematic-worlds.json` defines new world identity, palette, environment, opening, camera, transition, photo treatment, typography, closing, effects and differentiated price. Existing template keys remain stable. Scene assets and optional presentation metadata do not contain customer names. CMS content overrides win over defaults.

Layer order is environment â†’ atmosphere â†’ content. Decorative layers never receive pointer events. Scene state is IDLE â†’ ENTERING â†’ ACTIVE â†’ EXITING â†’ COMPLETED, with reentry permitted. Cover state is COVER_VISIBLE â†’ OPENING â†’ OPENED; WeddingRenderer owns open state and audio above section components. Semantic section IDs are independent of wedding ID, slug and template key.

Engine validation starts with Jawa Pendopo Pagi, Golden Atelier and Petualangan Laut. Expand only after screenshots and interaction checks. Full delivery results, cultural sources, asset prompts and limitations are recorded below as verification completes.

## Artwork provenance

Three original background plates generated with the built-in imagegen tool (not CLI), converted to responsive WebP in `frontend/public/images/cinematic/`. Prompts: (1) Javanese joglo pendopo garden at sunrise, architecture in lower third, calm pale sky for text, no ceremonial symbols; (2) warm travertine atelier, dark calm centre, sculptural brass ribbon, ivory calla lilies, no curtains; (3) original dimensional underwater storybook world, turquoise water, edge coral, treasure chest, original small fish, central negative space. All exclude text, logos and recognizable protected characters. SVG foreground and character motion are authored in the repository.

Sources consulted for Javanese architectural composition: [Indonesia Travel â€” Joglo](https://www.indonesia.travel/id/id/travel-ideas/heritage/joglo-traditional-house). The Viding reference was reviewed in a browser after the initial web-tool retrieval failed; no proprietary assets were copied.

## Delivery and validation (8 October 2026)

The catalog now contains 147 templates: the original 111 plus 20 regional and 16 original children worlds. Golden Atelier also receives a dedicated composition. Shared motion controls, cancellable scene timelines, public responsive preview, replay, music volume/mute and optional birthday age are integrated with existing customer content.

Two additive migrations introduce nullable birthday age and missing catalog entries. Existing template prices and customer content remain intact; no license tables or deployment workflow are changed. Repeated migration and template switching are covered by preservation tests.

Validation completed locally:

- Production frontend build passed.
- Registry audit passed for 147 entries.
- Browser suite passed all 147 mobile/desktop templates, navigation/music continuity, lightbox, Auto Journey, reduced motion and responsive admin preview.
- Three reference templates passed public preview, replay, motion controls, volume and navigation checks.
- Scene timeline interruption, reentry, reduced-motion and cleanup checks passed.
- Initial backend suite ran 96 tests; five outdated catalog/fixture assertions failed. After correcting those assertions, all three affected classes passed: 15 tests and 3,353 assertions. The new customer/migration preservation regression also passed (20 assertions).

Screenshots and logs are local ignored artifacts under test-results. The 111-active local database snapshot in the visual audit predates these migrations; production was not queried or migrated directly. CI/CD completion and production rendering are not verified in this delivery.

## Visual scope and limitations

Jawa Pendopo, Golden Atelier and the underwater world use detailed original responsive image plates. Other worlds use original SVG scenery and independently animated layers; their illustration detail varies. This is layered CSS/SVG depth and motion, not a WebGL 3D model engine. The full catalog received automated interaction and overflow checks; detailed manual visual review focused on the reference worlds and a contact sheet. Further per-world art direction can build on this implementation without changing customer content or licenses.

## Focused catalog revision (8 October 2026)

At the owner's request, only Jawa Pendopo Pagi and Kabut Pegunungan Sunda remain available from the 36 newly added worlds. The 111 pre-existing templates remain available. The other 34 definitions are retained solely so previously purchased invitations can still render. A transactional migration removes unused template records and disables any referenced by orders or weddings, without changing customer records or licenses. Seeder and initial catalog migration no longer recreate retired entries.

Sunda now uses an original imagegen bitmap: detailed Sundanese mountain garden at misty dawn, bamboo saung, tea terraces, stream and jasmine, calm upper space for invitation copy; no text, people or copied assets. Responsive WebP files are frontend/public/images/cinematic/sunda-pegunungan-{640,1024}.webp. Jawa retains its original detailed pendopo image. Both have independently drifting mist and existing motion controls. Shipped SVG preview placeholders are replaced while preserving administrator-uploaded images and custom prices. Catalog defaults to newest first with descending ID as the tie-breaker.

Focused validation: production build passed; Jawa and Sunda each passed 10 viewport widths, public preview/replay/motion/audio/navigation checks, and manual opening-image review. The related backend run passed 29 of 31 tests initially; two test-fixture mistakes were corrected and the affected tests passed on targeted reruns. The cleanup regression confirms unused retired templates are removed, used templates are disabled, customer/order snapshots and licenses remain intact, and custom prices survive repeated migration and reseeding. No direct production migration or CI/CD wait was performed.
