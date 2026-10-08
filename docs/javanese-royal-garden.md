# Javanese Royal Garden

One new wedding template, `javanese-royal-garden`, in the existing Regional category. The initial price is Rp179.000 and remains editable by the admin. Existing templates, prices and customer content are preserved.

The dedicated renderer reuses the compressed Javanese pendopo garden images and transparent jasmine foliage already in the project. Each section has a viewport-sized garden composition, restrained camera movement, mist and petals. The opening reveals the environment, title, names and date over six seconds; visitors can skip it. The closing uses warm environmental lighting without filtering customer photos.

The existing renderer retains ownership of opening state, audio, navigation and CMS data. Only this template supplies the optional opening and scene components. Other templates keep their original components and configuration. Shared gallery, gifts, RSVP, wishes and moderation logic are reused. The events scene uses the CMS countdown selection and offers separate maps and calendar downloads for each event.

Preview: `/templates/javanese-royal-garden/preview`. The normal preview toolbar and its iframe are supported. Guest personalization through `?to=` is preserved.

Deployment migration `2026_10_08_000005_add_javanese_royal_garden_template.php` uses the additive catalog installer. Re-running it preserves existing rows and custom prices. Rollback never removes purchased template references. No license or customer data is deleted.

Verification:

- Production build and the 149-entry template registry audit.
- Backend: `php vendor/bin/phpunit --filter "InvitationEventTest|TemplateExpansionTest" --testdox`, including installation/repeated migration, old catalog snapshots, licenses, order pricing and CMS preview (13 tests, 1,364 assertions).
- Browser: `RADINA_ROYAL_OPENING=1` and `RADINA_ROYAL_GARDEN=1` modes of `scripts/template-visual-browser-test.mjs`, against the production build with API/audio fixtures.
- Opening and sections at widths 320, 360, 375, 390, 414, 430, 768, 1024, 1280 and 1440; screenshots in `test-results/template-visuals/royal-garden-*` and `javanese-royal-garden-opening-390.png`.
- Guest personalization, music gesture and navigation continuity, CMS countdown/event calendar, gallery keyboard/swipe, gift clipboard, RSVP with message, reduced motion, shared preview and old renderer smoke checks.

Browser interaction checks use fixtures; production deployment and live-device audio behavior are not asserted by these checks.
