// Original vector scenery. Architecture is simplified, not a ritual/symbol inventory.
import fs from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
const worlds = JSON.parse(
  fs.readFileSync('config/cinematic-worlds.json', 'utf8'),
)
const shapes = {
  'palembang-limas': `<path d="M230 650 390 545H810L970 650Z" fill="var(--accent)"/><path d="M410 545 490 475H710L790 545Z" fill="var(--ink)"/><path d="M300 650H900V740H300Z" fill="var(--highlight)"/><path d="M340 655V790M450 655V790M760 655V790M865 655V790" stroke="var(--ink)" stroke-width="13"/><path d="M545 740H655L715 800H490Z" fill="var(--accent)"/><path d="M355 675H440V712H355ZM475 675H560V712H475ZM640 675H725V712H640ZM760 675H845V712H760Z" fill="var(--ink)"/>`,
  'batak-bolon': `<path d="M270 540Q590 705 930 530L830 700Q600 620 370 710Z" fill="var(--accent)"/><path d="M385 700H815V750H385Z" fill="var(--ink)"/><path d="M410 747V785M475 747V785M730 747V785M795 747V785" stroke="var(--ink)" stroke-width="12"/><path d="M300 559Q600 700 900 549" fill="none" stroke="var(--highlight)" stroke-width="9"/>`,
  'aceh-serambi': `<path d="M270 620 380 500H790L930 620Z" fill="var(--accent)"/><path d="M330 620H870V715H330Z" fill="var(--highlight)"/><path d="M350 630V780M450 630V780M550 630V780M680 630V780M800 630V780M850 630V780" stroke="var(--ink)" stroke-width="10"/><path d="M585 715H650L700 800H530Z" fill="var(--accent)"/><path d="M377 645H425V689H377ZM485 645H533V689H485ZM701 645H749V689H701ZM801 645H834V689H801Z" fill="var(--ink)"/>`,
  'dayak-longhouse': `<path d="M70 610 175 540H995L1130 610Z" fill="var(--accent)"/><path d="M135 610H1060V695H135Z" fill="var(--highlight)"/><path d="M135 690H1060M200 680V775M330 680V775M460 680V775M590 680V775M720 680V775M850 680V775M990 680V775" stroke="var(--ink)" stroke-width="10"/><path d="M240 623H273V668H240ZM380 623H413V668H380ZM520 623H553V668H520ZM660 623H693V668H660ZM800 623H833V668H800ZM940 623H973V668H940Z" fill="var(--ink)"/><path d="M585 695 640 695 690 790 525 790Z" fill="var(--accent)"/>`,
  'banjar-river': `<path d="M300 656 485 590 570 390 660 590 900 656Z" fill="var(--accent)"/><path d="M385 656H815V740H385Z" fill="var(--highlight)"/><path d="M400 736V793M485 736V793M715 736V793M800 736V793" stroke="var(--ink)" stroke-width="12"/><path d="M580 674H635V740H580ZM445 683H500V715H445ZM704 683H755V715H704Z" fill="var(--ink)"/><path d="M0 778Q100 757 210 778T440 778T680 778T900 778T1200 778" stroke="var(--highlight)" fill="none" stroke-width="7"/>`,
  'sasak-bale': `<path d="M290 720Q330 680 370 585Q600 485 825 585Q870 680 915 720Z" fill="var(--accent)"/><path d="M390 712H810V780H390Z" fill="var(--highlight)"/><path d="M550 714H650V780H550Z" fill="var(--ink)"/><path d="M330 705Q600 590 875 704M350 680Q600 560 850 680M365 650Q600 535 840 650" stroke="var(--ink)" fill="none" opacity=".3" stroke-width="4"/>`,
  'toraja-highland': `<path d="M205 465Q400 650 995 420Q930 520 870 620Q590 750 340 635Z" fill="var(--accent)"/><path d="M240 490Q475 685 955 458" fill="none" stroke="var(--highlight)" stroke-width="11"/><path d="M390 662Q605 716 800 660V755H390Z" fill="var(--ink)"/><path d="M420 750V800M510 750V800M690 750V800M785 750V800" stroke="var(--ink)" stroke-width="14"/><path d="M565 706H640V758H565Z" fill="var(--highlight)"/>`,
  'madura-courtyard': `<path d="M170 675 265 590 395 675V750H185ZM480 650 595 550 730 650V735H490ZM820 675 930 590 1040 675V750H825Z" fill="var(--accent)"/><path d="M190 690H380V748H190ZM505 670H710V735H505ZM838 690H1025V748H838Z" fill="var(--highlight)"/><path d="M263 700H309V748H263ZM580 684H637V735H580ZM909 703H958V748H909Z" fill="var(--ink)"/><path d="M0 790Q600 695 1200 790" fill="none" stroke="var(--highlight)" stroke-width="28"/>`,
  'lampung-veranda': `<path d="M250 630 415 480H785L950 630Z" fill="var(--accent)"/><path d="M305 625H895V730H305Z" fill="var(--highlight)"/><path d="M340 640V790M450 640V790M750 640V790M860 640V790M320 710H880" stroke="var(--ink)" stroke-width="11"/><path d="M530 730H675L735 800H465Z" fill="var(--accent)"/><path d="M425 520H775M395 548H805M370 577H835" stroke="var(--ink)" opacity=".2" stroke-width="4"/>`,
  'ntt-savanna': `<path d="M260 700 420 620 465 410H670L735 620 945 700Z" fill="var(--accent)"/><path d="M435 620 480 430H655L705 620M300 700Q600 650 907 700" fill="none" stroke="var(--highlight)" stroke-width="8"/><path d="M350 700H850V765H350Z" fill="var(--ink)"/><path d="M365 760V799M475 760V799M725 760V799M835 760V799" stroke="var(--ink)" stroke-width="10"/>`,
  'kids-treasure-island': `<ellipse cx="610" cy="722" rx="430" ry="70" fill="var(--highlight)"/><path d="M740 717Q815 610 800 490" stroke="var(--ink)" stroke-width="18" fill="none"/><path d="M800 490Q650 450 650 520Q720 493 800 490Q900 419 952 480Q870 466 800 490" fill="var(--ink)"/><path d="M360 680H500V750H360ZM350 685Q352 617 430 617T510 685Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="7"/><path d="M415 670H445V715H415Z" fill="var(--highlight)"/><path d="M120 650H285L245 685H151ZM195 642V480L270 625H205Z" fill="var(--accent)"/>`,
  'kids-robot-workshop': `<path d="M180 740V580H385V490H805V590H1010V740Z" fill="var(--accent)" opacity=".5"/><path d="M280 735V620H935V735M510 600V535H685V600" fill="var(--highlight)" stroke="var(--ink)" stroke-width="8"/><path d="M365 690H830M595 490V430M570 445H620" stroke="var(--ink)" stroke-width="10"/><circle cx="595" cy="408" r="20" fill="var(--accent)"/><circle cx="520" cy="575" r="12" fill="var(--accent)"/><circle cx="680" cy="575" r="12" fill="var(--accent)"/>`,
  'kids-racing-track': `<path d="M0 750Q350 440 600 650T1200 700" fill="none" stroke="var(--ink)" stroke-width="100"/><path d="M0 750Q350 440 600 650T1200 700" fill="none" stroke="var(--highlight)" stroke-width="5" stroke-dasharray="35 25"/><path d="M760 620V415H960V555H760" fill="var(--highlight)" stroke="var(--ink)" stroke-width="8"/><path d="M760 415H810V465H760ZM860 415H910V465H860ZM810 465H860V515H810ZM910 465H960V515H910ZM760 515H810V555H760ZM860 515H910V555H860Z" fill="var(--ink)"/>`,
  'kids-indonesian-village': `<path d="M0 700Q300 610 600 710T1200 695M0 740Q300 650 600 750T1200 735M0 780Q300 690 600 790T1200 775" fill="none" stroke="var(--ink)" opacity=".25" stroke-width="16"/><path d="M245 652 385 540 510 652V730H250ZM655 620 780 520 910 620V707H660Z" fill="var(--accent)"/><path d="M350 660H415V730H350ZM738 633H803V707H738Z" fill="var(--highlight)"/><path d="M820 290 875 355 820 420 765 355Z" fill="var(--accent)"/><path d="M820 420q-80 55-60 105t-90 110" fill="none" stroke="var(--ink)" stroke-width="3"/>`,
  'kids-tropical-island': `<ellipse cx="580" cy="726" rx="460" ry="85" fill="var(--highlight)"/><path d="M360 730Q440 590 390 435M890 726Q800 575 890 480" fill="none" stroke="var(--accent)" stroke-width="24"/><path d="M390 438Q200 365 190 475Q270 416 390 438Q490 324 575 420Q495 392 390 438ZM890 480Q715 420 720 520Q800 475 890 480Q975 385 1070 455Q990 440 890 480Z" fill="var(--ink)" opacity=".7"/><path d="M535 748V685H555V655H580V685H605V655H630V685H655V748Z" fill="var(--accent)"/>`,
  'kids-enchanted-book': `<path d="M210 565Q390 500 600 580Q805 500 1000 565L950 770Q790 720 600 795Q400 720 250 770Z" fill="var(--highlight)" stroke="var(--ink)" stroke-width="10"/><path d="M600 580V790" stroke="var(--accent)" stroke-width="9"/><path d="M480 665V495H520V425L550 390 580 425V495H620V425L650 390 680 425V495H720V665Z" fill="var(--accent)"/><path d="M570 666V615Q600 575 630 615V666Z" fill="var(--ink)"/><path d="m365 390 10 26 28 2-23 17 6 28-22-17-22 17 7-28-24-17 29-2Z" fill="var(--highlight)"/>`,
}
fs.mkdirSync('frontend/public/images/cinematic/scenes', { recursive: true })
fs.mkdirSync('frontend/public/images/templates/cinematic-worlds', {
  recursive: true,
})
const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const server = await createServer({
  root: resolve('frontend'),
  configFile: false,
  plugins: [vue()],
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
})
try {
  const { default: Scene } = await server.ssrLoadModule(
    '/src/components/cinematic/CinematicScene.vue',
  )
  for (const [key, w] of Object.entries(worlds)) {
    const p = w.palette
    const illustration =
      shapes[w.scene] ||
      `<path d="M0 650Q270 510 600 650T1200 630V800H0Z" fill="${p.accent}" opacity=".4"/><path d="M0 730Q300 620 600 730T1200 695V800H0Z" fill="${p.ink}" opacity=".25"/>`
    let svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${p.background}"/><stop offset="1" stop-color="${p.highlight}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="890" cy="310" r="70" fill="${p.highlight}" opacity=".5"/><path d="M0 700 170 485 360 650 620 480 900 650 1090 505 1200 650V800H0Z" fill="${p.ink}" opacity=".08"/>${illustration}</svg>`
        .replaceAll('var(--accent)', p.accent)
        .replaceAll('var(--ink)', p.ink)
        .replaceAll('var(--highlight)', p.highlight)
    if (w.environmentAsset) {
      if (!shapes[w.scene]) throw Error(`Missing original scenery: ${key}`)
      fs.writeFileSync(
        `frontend/public/images/cinematic/scenes/${w.environmentAsset}.svg`,
        svg,
      )
    }
    if (!w.environmentAsset && !w.plate) {
      const markup = await renderToString(
        createSSRApp(Scene, {
          world: w,
          active: false,
          showMascot: false,
        }),
      )
      const match = markup.match(
        /<svg[^>]*class="cinematic-scene__camera"[\s\S]*?<\/svg>/,
      )
      if (!match) throw Error('No vector environment: ' + key)
      svg = match[0]
        .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
        .replaceAll('var(--world-sky)', p.background)
        .replaceAll('var(--world-ink)', p.ink)
        .replaceAll('var(--world-accent)', p.accent)
        .replaceAll('var(--world-highlight)', p.highlight)
    }
    // Gallery cards contain no personal data; actual preview uses the public renderer.
    const thumbnail = svg.replace(
      '</svg>',
      `<rect x="100" y="55" width="1000" height="150" rx="4" fill="${p.background}" opacity=".94"/><text x="600" y="110" text-anchor="middle" fill="${p.ink}" font-size="18" font-family="sans-serif" letter-spacing="5">RADINA · ${esc(w.category.toUpperCase())}</text><text x="600" y="162" text-anchor="middle" fill="${p.ink}" font-size="${w.name.length > 25 ? 32 : 40}" font-family="serif">${esc(w.name)}</text></svg>`,
    )
    fs.writeFileSync(
      `frontend/public/images/templates/cinematic-worlds/${key}.svg`,
      thumbnail,
    )
  }
} finally {
  await server.close()
}
console.log(
  `Built ${Object.keys(shapes).length} original environments and ${Object.keys(worlds).length} catalog thumbnails`,
)
