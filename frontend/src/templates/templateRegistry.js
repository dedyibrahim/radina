import { defineAsyncComponent } from 'vue'
import studio from '../../../config/template-studio.json'
import floral from '../../../config/floral-collection.json'
import cinematicWorlds from '../../../config/cinematic-worlds.json'
export const templateRegistry = {
  ...Object.fromEntries(
    Object.keys(floral).map((key) => [
      key,
      defineAsyncComponent(
        () => import('./FloralAtelier/FloralInvitation.vue'),
      ),
    ]),
  ),
  ...Object.fromEntries(
    Object.keys(studio).map((key) => [
      key,
      defineAsyncComponent(() => import('./shared/StudioInvitation.vue')),
    ]),
  ),
  ...Object.fromEntries(
    Object.keys(cinematicWorlds).map((key) => [
      key,
      defineAsyncComponent(() => import('./shared/StudioInvitation.vue')),
    ]),
  ),
  'javanese-royal-garden': defineAsyncComponent(
    () => import('./JavaneseRoyalGarden/index.vue'),
  ),
  'nur-jannah': defineAsyncComponent(() => import('./NurJannah/index.vue')),
  'mihrab-emerald': defineAsyncComponent(
    () => import('./MihrabEmerald/index.vue'),
  ),
  'sahara-gold': defineAsyncComponent(() => import('./SaharaGold/index.vue')),
  'qamar-blue': defineAsyncComponent(() => import('./QamarBlue/index.vue')),
  'zahra-ivory': defineAsyncComponent(() => import('./ZahraIvory/index.vue')),

  'timeless-romance': defineAsyncComponent(
    () => import('./TimelessRomance/index.vue'),
  ),
  'neon-love': defineAsyncComponent(() => import('./NeonLove/index.vue')),
  'blossom-east': defineAsyncComponent(() => import('./BlossomEast/index.vue')),
  monochrome: defineAsyncComponent(() => import('./Monochrome/index.vue')),
  botanica: defineAsyncComponent(() => import('./Botanica/index.vue')),
  'paper-petals': defineAsyncComponent(() => import('./PaperPetals/index.vue')),
  'royal-heritage': defineAsyncComponent(
    () => import('./RoyalHeritage/index.vue'),
  ),
  'ocean-vows': defineAsyncComponent(() => import('./OceanVows/index.vue')),
  editorial: defineAsyncComponent(() => import('./Editorial/index.vue')),
  celestial: defineAsyncComponent(() => import('./Celestial/index.vue')),
  'romantic-floral': defineAsyncComponent(
    () => import('./RomanticFloral/index.vue'),
  ),
  'elegant-luxury': defineAsyncComponent(
    () => import('./ElegantLuxury/index.vue'),
  ),
  'minimalist-white': defineAsyncComponent(
    () => import('./MinimalistWhite/index.vue'),
  ),
  'nusantara-heritage': defineAsyncComponent(
    () => import('./NusantaraHeritage/index.vue'),
  ),
  'garden-dream': defineAsyncComponent(() => import('./GardenDream/index.vue')),
  'classic-vintage': defineAsyncComponent(
    () => import('./ClassicVintage/index.vue'),
  ),
  'midnight-romance': defineAsyncComponent(
    () => import('./MidnightRomance/index.vue'),
  ),
  sakinah: defineAsyncComponent(() => import('./Sakinah/index.vue')),
  'eternal-story': defineAsyncComponent(
    () => import('./EternalStory/index.vue'),
  ),
  blush: defineAsyncComponent(() => import('./Blush/index.vue')),
}
export const templateOptions = [
  ...Object.entries(floral).map(([value, entry]) => ({
    value,
    label: entry.name,
    component: entry.name.replaceAll(' ', '') + '.vue',
  })),
  ...Object.entries(studio).map(([value, entry]) => ({
    value,
    label: entry.name,
    category: entry.category,
    component: entry.component,
  })),
  ...Object.entries(cinematicWorlds)
    .filter(([, entry]) => !entry.retired)
    .map(([value, entry]) => ({
      value,
      label: entry.name,
      category: entry.category,
      component: `${value
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('')}.vue`,
    })),
  { value: 'nur-jannah', label: 'Nur Jannah', component: 'NurJannah.vue' },
  {
    value: 'mihrab-emerald',
    label: 'Mihrab Emerald',
    component: 'MihrabEmerald.vue',
  },
  { value: 'sahara-gold', label: 'Sahara Gold', component: 'SaharaGold.vue' },
  { value: 'qamar-blue', label: 'Qamar Blue', component: 'QamarBlue.vue' },
  { value: 'zahra-ivory', label: 'Zahra Ivory', component: 'ZahraIvory.vue' },

  {
    value: 'timeless-romance',
    label: 'Timeless Romance',
    component: 'TimelessRomance.vue',
  },
  { value: 'neon-love', label: 'Neon Love', component: 'NeonLove.vue' },
  {
    value: 'blossom-east',
    label: 'Blossom East',
    component: 'BlossomEast.vue',
  },
  { value: 'monochrome', label: 'Monochrome', component: 'Monochrome.vue' },
  { value: 'botanica', label: 'Botanica', component: 'Botanica.vue' },
  {
    value: 'paper-petals',
    label: 'Paper & Petals',
    component: 'PaperPetals.vue',
  },
  {
    value: 'royal-heritage',
    label: 'Royal Heritage',
    component: 'RoyalHeritage.vue',
  },
  { value: 'ocean-vows', label: 'Ocean Vows', component: 'OceanVows.vue' },
  { value: 'editorial', label: 'Editorial', component: 'Editorial.vue' },
  { value: 'celestial', label: 'Celestial', component: 'Celestial.vue' },
  {
    value: 'romantic-floral',
    label: 'Amore Bloom',
    component: 'RomanticFloral.vue',
  },
  {
    value: 'elegant-luxury',
    label: 'Noir Élégance',
    component: 'ElegantLuxury.vue',
  },
  {
    value: 'minimalist-white',
    label: 'Pure',
    component: 'MinimalistWhite.vue',
  },
  {
    value: 'nusantara-heritage',
    label: 'Nusantara',
    component: 'NusantaraHeritage.vue',
  },
  {
    value: 'garden-dream',
    label: 'Verdant Vows',
    component: 'GardenDream.vue',
  },
  {
    value: 'classic-vintage',
    label: 'Heritage Letters',
    component: 'ClassicVintage.vue',
  },
  {
    value: 'midnight-romance',
    label: 'After Dark',
    component: 'MidnightRomance.vue',
  },
  { value: 'sakinah', label: 'Sakinah', component: 'Sakinah.vue' },
  {
    value: 'eternal-story',
    label: 'Frame by Frame',
    component: 'EternalStory.vue',
  },
  { value: 'blush', label: 'Daydream', component: 'Blush.vue' },
]
