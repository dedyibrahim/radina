# RADINA: 20 wedding experiences

The original ten designs remain available. The additional collection has separately composed Opening, Hero, Couple, Story, Event, Gallery, and Closing Vue components. Each receives the same Wedding API data. Audio, countdown, RSVP, wishes, gift methods, navigation and lightbox behavior remain shared. Vue modules and individual presentation CSS load through explicit dynamic imports.

| Key | Template | Composition |
| --- | --- | --- |
| celestial | Celestial | Star-map profiles, constellation story, lunar calendar |
| editorial | Editorial | Wedding issue masthead, interview spreads, article chapters |
| ocean-vows | Ocean Vows | Horizon photography, shoreline portraits, coastal itinerary |
| royal-heritage | Royal Heritage | Double doors, royal lineage, ceremonial summons |
| paper-petals | Paper & Petals | Ribbon paper stack, polaroid profiles, pressed journal |
| botanica | Botanica | Resort opening, layered tropical portraits, destination schedule |
| monochrome | Monochrome | Documentary portraits, photographic archive, typography programme |
| blossom-east | Blossom East | Ink branch opening, blossom portraits, vertical art invitation |
| neon-love | Neon Love | Urban posters, metro story, digital event passes |
| timeless-romance | Timeless Romance | Classic stationery, triptych hero, formal programme |

## Updating an existing installation

Run from backend:

```sh
php artisan migrate
php artisan db:seed --class=RadinaSeeder
php artisan db:seed --class=ExperienceSeeder
```

These commands preserve customer orders, payments, invitations, guest records, prices, visibility and featured flags. Catalog categories are updated. New fictional demo invitations use dedicated slugs. Default demo content may be curated when it still matches original seed values; customer invitations are never included. Do not run migrate:fresh on customer databases. Keep the existing APP_KEY for encrypted gift data.

Use npm install and npm run dev as before. Required images and audio are included; development asset generation tools are optional. The seeder copies assets to Laravel public storage. Run php artisan storage:link if the public storage link is missing.

## Shared CMS contract

backend/config/template-presets.json remains the canonical preset source. Initial creation applies the selected preset. Template changes preserve saved text, section order, couples, events, photos, gift methods, music and guest records. A null section order follows the selected design's recommendation. Every presentation reads production content through useWedding; fictional identities only exist in seeded demo records.

Opening state and the single audio instance belong to WeddingRenderer. Internal navigation uses semantic keys and scrollIntoView, preserving the guest query, opening state, playback position and volume. Explicit Preview Cover remains available to administrators.

## Music and marketplace

The Music Library includes **50 original synthesized demo cues**, 18–24 seconds each. They demonstrate categories and playlist transitions; they are not recordings of commercial songs. Upload owned or licensed full-length audio for production. Additional library tracks are supported without a 50-song cap; wedding playlists remain limited to ten songs. Only selected audio is requested by the browser.

Marketplace supports eleven style filters, search, newest/price/popularity sorting, browser-local favorites, and comparison of up to three designs. Popularity uses non-demo paid/published orders. Comparison shows factual style, features, music mood, gallery composition and price, without scores. Favorites can be filtered across catalog pages. Live preview opens the complete interactive invitation.

## Validation

```sh
npm run build
npm run test:experiences
npm run test:collection
npm run test:music-cms
npm run test:template-picker
node scripts/experience-edge-test.mjs
node scripts/playlist-playback-test.mjs
cd backend
php artisan test
```

Experience tests cover **200 template/viewport combinations** from 320px to 1440px, long guest names, image integrity, semantic navigation and one persistent player. Edge tests cover all twenty lightboxes on mobile and desktop. Backend tests use the isolated wedding_cms_test database. Asset provenance is in frontend/public/ASSET-CREDITS.md.
