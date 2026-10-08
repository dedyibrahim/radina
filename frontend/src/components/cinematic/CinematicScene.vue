<script setup>
import { computed, useId } from 'vue'
import OriginalMascot from './OriginalMascot.vue'

const props = defineProps({
  world: { type: Object, required: true },
  scene: { type: String, default: 'opening' },
  active: Boolean,
  showMascot: { type: Boolean, default: true },
})
const palette = computed(() => props.world.palette || {})
const marker = `cinematic-${useId().replaceAll(':', '')}`
</script>

<template>
  <div
    class="cinematic-scene"
    :class="[
      `scene-${world.scene}`,
      `camera-${world.camera || 'dolly-in'}`,
      `shot-${scene}`,
      { 'has-plate': world.plate },
    ]"
    :data-active="active"
    :style="{
      '--world-sky': palette.background || '#e9e4d7',
      '--world-ink': palette.ink || '#34443d',
      '--world-accent': palette.accent || '#a17b55',
      '--world-highlight': palette.highlight || '#c5d1ae',
    }"
    aria-hidden="true"
  >
    <img
      v-if="world.plate || world.environmentAsset"
      class="cinematic-scene__plate cinematic-scene__camera"
      :src="
        world.plate
          ? `/images/cinematic/${world.plate}-640.webp`
          : `/images/cinematic/scenes/${world.environmentAsset}.svg`
      "
      :srcset="
        world.plate
          ? `/images/cinematic/${world.plate}-640.webp 640w, /images/cinematic/${world.plate}-1024.webp 1024w`
          : undefined
      "
      sizes="(max-width: 640px) 100vw, 640px"
      alt=""
      :loading="scene === 'opening' ? 'eager' : 'lazy'"
      decoding="async"
    />
    <svg
      v-else
      class="cinematic-scene__camera"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient :id="`${marker}-sky`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--world-sky)" />
          <stop
            offset="1"
            stop-color="var(--world-highlight)"
            stop-opacity=".72"
          />
        </linearGradient>
        <linearGradient :id="`${marker}-haze`" x1="0" y1="0" x2="1" y2="0">
          <stop stop-color="var(--world-highlight)" stop-opacity="0" />
          <stop
            offset=".5"
            stop-color="var(--world-highlight)"
            stop-opacity=".56"
          />
          <stop
            offset="1"
            stop-color="var(--world-highlight)"
            stop-opacity="0"
          />
        </linearGradient>
        <radialGradient :id="`${marker}-sun`">
          <stop stop-color="var(--world-highlight)" stop-opacity=".82" />
          <stop
            offset="1"
            stop-color="var(--world-highlight)"
            stop-opacity="0"
          />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" :fill="`url(#${marker}-sky)`" />
      <circle
        class="scene-sun"
        cx="915"
        cy="185"
        r="150"
        :fill="`url(#${marker}-sun)`"
      />
      <path
        class="scene-haze"
        d="M0 455Q300 380 600 448T1200 430V655H0Z"
        :fill="`url(#${marker}-haze)`"
      />

      <g v-if="world.scene === 'jawa-pendopo'" class="world-architecture">
        <path
          d="M270 502 600 280 930 502Z"
          fill="var(--world-accent)"
          opacity=".62"
        />
        <path
          d="M350 478 600 326 850 478Z"
          fill="var(--world-ink)"
          opacity=".22"
        />
        <path
          d="M390 488V685M500 488V685M700 488V685M810 488V685M350 685H850"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="18"
          opacity=".6"
        />
        <path
          d="M280 706Q600 638 920 706"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="12"
        />
        <path
          d="M0 715Q240 660 430 720T840 714T1200 698V800H0Z"
          fill="var(--world-ink)"
          opacity=".2"
        />
      </g>
      <g v-else-if="world.scene === 'sunda-mountain'" class="world-landscape">
        <path
          d="M0 565 180 355 340 500 560 260 770 490 995 315 1200 525V800H0Z"
          fill="var(--world-ink)"
          opacity=".32"
        />
        <path
          d="M0 628Q230 480 460 630T910 600T1200 582V800H0Z"
          fill="var(--world-accent)"
          opacity=".52"
        />
        <path
          d="M45 760Q270 672 515 760T1000 738T1200 752"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="23"
        />
        <g
          class="scene-bamboo"
          stroke="var(--world-ink)"
          stroke-width="9"
          opacity=".6"
        >
          <path
            d="M90 800V280M132 800V350M109 430H145M109 545H145M940 800V260M980 800V340M956 418H992M956 540H992"
          />
        </g>
      </g>
      <g
        v-else-if="world.scene === 'bali-water-garden'"
        class="world-architecture"
      >
        <path
          d="M380 710V445Q380 275 600 275Q820 275 820 445V710"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="26"
          opacity=".62"
        />
        <path
          d="M425 710V460Q425 330 600 330Q775 330 775 460V710"
          fill="var(--world-highlight)"
          opacity=".24"
        />
        <path
          d="M0 675Q300 620 600 680T1200 665V800H0Z"
          fill="var(--world-accent)"
          opacity=".43"
        />
        <path
          class="scene-water"
          d="M80 735Q180 710 280 735T480 735T680 735T880 735T1080 735"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="8"
        />
        <g fill="var(--world-ink)" opacity=".4">
          <path
            d="M150 650Q126 540 160 455Q200 555 176 650ZM1010 665Q980 540 1020 440Q1060 560 1038 660Z"
          />
          <path
            d="M150 500Q65 445 40 465Q95 535 150 500ZM165 545Q245 468 280 488Q235 560 165 545ZM1010 505Q930 445 900 470Q955 535 1010 505ZM1024 555Q1100 475 1140 500Q1090 566 1024 555Z"
          />
        </g>
      </g>
      <g
        v-else-if="world.scene === 'minang-hill-house'"
        class="world-architecture"
      >
        <path
          d="M0 560 190 380 350 540 520 305 720 535 930 350 1200 575V800H0Z"
          fill="var(--world-accent)"
          opacity=".35"
        />
        <path
          d="M325 560Q380 500 440 558Q500 478 565 550Q625 488 685 558Q745 494 810 560V730H325Z"
          fill="var(--world-ink)"
          opacity=".62"
        />
        <path
          d="M330 555Q390 488 440 555Q500 468 565 548Q630 468 690 555Q760 484 812 558"
          fill="none"
          stroke="var(--world-accent)"
          stroke-width="25"
        />
        <path
          d="M0 735Q280 650 570 740T1200 715V800H0Z"
          fill="var(--world-highlight)"
          opacity=".56"
        />
      </g>
      <g
        v-else-if="world.scene === 'betawi-garden-house'"
        class="world-architecture"
      >
        <path
          d="M340 510 600 345 860 510V720H340Z"
          fill="var(--world-highlight)"
          opacity=".6"
        />
        <path
          d="M300 515 600 305 900 515M390 525V710M810 525V710"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="22"
        />
        <path
          d="M480 570H560V650H480ZM640 570H720V650H640Z"
          fill="var(--world-accent)"
          opacity=".62"
        />
        <path
          d="M0 720Q300 650 600 725T1200 710V800H0Z"
          fill="var(--world-ink)"
          opacity=".22"
        />
      </g>
      <g v-else-if="world.scene === 'bugis-coastal-voyage'" class="world-ocean">
        <path
          d="M0 520Q200 460 400 520T800 520T1200 500V800H0Z"
          fill="var(--world-ink)"
          opacity=".28"
        />
        <path
          d="M0 602Q200 540 400 602T800 602T1200 580M0 690Q200 630 400 690T800 690T1200 670"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="14"
          opacity=".76"
        />
        <path
          d="M360 540H820L735 628H435Z"
          fill="var(--world-accent)"
          opacity=".8"
        />
        <path
          d="M590 290V530M600 310 790 485H600Z"
          fill="var(--world-highlight)"
          opacity=".8"
        />
        <path
          d="M0 755Q300 690 600 760T1200 740V800H0Z"
          fill="var(--world-ink)"
          opacity=".35"
        />
      </g>
      <g
        v-else-if="world.scene === 'melayu-river-palace'"
        class="world-architecture"
      >
        <path
          d="M330 525V390H870V525M390 390V335H810V390M460 335V286H740V335"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="22"
          opacity=".65"
        />
        <path
          d="M0 635Q200 580 400 635T800 635T1200 615V800H0Z"
          fill="var(--world-accent)"
          opacity=".38"
        />
        <path
          d="M0 700Q190 655 380 700T760 700T1200 680"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="16"
        />
        <path
          d="M0 760Q220 705 440 760T880 758T1200 745V800H0Z"
          fill="var(--world-ink)"
          opacity=".18"
        />
      </g>
      <g
        v-else-if="world.scene === 'papua-highland-forest'"
        class="world-landscape"
      >
        <path
          d="M0 580 160 420 300 520 455 315 630 530 820 340 990 500 1125 365 1200 460V800H0Z"
          fill="var(--world-ink)"
          opacity=".4"
        />
        <path
          d="M0 655Q220 565 450 670T900 650T1200 632V800H0Z"
          fill="var(--world-accent)"
          opacity=".52"
        />
        <g fill="var(--world-ink)" opacity=".55">
          <path
            d="M85 760Q60 620 100 480Q150 620 125 760ZM1020 760Q990 600 1030 440Q1080 610 1055 760Z"
          />
          <path
            d="M98 600 20 545Q65 520 108 580L155 520Q190 540 120 610ZM1030 575 960 520Q1000 498 1040 555L1090 500Q1125 520 1050 592Z"
          />
        </g>
        <path
          d="M0 730Q250 690 480 735T960 722T1200 720"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="18"
        />
      </g>
      <g v-else-if="world.scene === 'maluku-island-dusk'" class="world-ocean">
        <path
          d="M0 550Q200 475 400 550T800 550T1200 525V800H0Z"
          fill="var(--world-ink)"
          opacity=".32"
        />
        <path
          d="M0 625Q200 575 400 625T800 625T1200 600M0 708Q200 660 400 708T800 708T1200 690"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="12"
        />
        <path
          d="M160 600Q340 430 505 605Q680 420 850 606Q1010 450 1150 610Z"
          fill="var(--world-ink)"
          opacity=".58"
        />
        <path d="M390 510H680L620 570H435Z" fill="var(--world-accent)" />
        <path
          d="M535 375V505M545 390 670 490H545Z"
          fill="var(--world-highlight)"
        />
      </g>
      <g
        v-else-if="world.scene === 'nusantara-horizon'"
        class="world-landscape"
      >
        <path
          d="M0 590Q130 470 250 570T500 560T760 540T1010 570T1200 530V800H0Z"
          fill="var(--world-accent)"
          opacity=".48"
        />
        <path
          d="M0 660Q190 590 380 660T760 650T1200 635V800H0Z"
          fill="var(--world-ink)"
          opacity=".34"
        />
        <path
          d="M90 710Q210 670 330 710T570 710T810 710T1050 710"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="9"
          stroke-dasharray="22 16"
        />
        <g
          fill="none"
          stroke="var(--world-accent)"
          stroke-width="8"
          opacity=".65"
        >
          <path d="M500 210 600 160 700 210 600 260Z" />
          <path d="M500 210V300L600 350 700 300V210M600 260V350" />
        </g>
      </g>
      <g
        v-else-if="
          world.scene === 'kids-underwater-adventure' ||
          world.scene === 'kids-cartoon-undersea-party'
        "
        class="world-underwater"
      >
        <path
          d="M0 570Q140 530 280 570T560 570T840 570T1200 550V800H0Z"
          fill="var(--world-ink)"
          opacity=".24"
        />
        <path
          d="M0 680Q120 580 230 680T460 670T700 690T940 665T1200 680V800H0Z"
          fill="var(--world-accent)"
          opacity=".48"
        />
        <g
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="17"
          stroke-linecap="round"
          opacity=".82"
        >
          <path
            d="M150 745V610Q150 555 185 610V745M1040 760V600Q1040 535 1080 600V760M590 770V650Q590 595 625 650V770"
          />
        </g>
        <g
          class="scene-bubbles"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="6"
        >
          <circle cx="240" cy="285" r="22" />
          <circle cx="900" cy="365" r="34" />
          <circle cx="1030" cy="235" r="18" />
          <circle cx="445" cy="410" r="14" />
        </g>
        <path
          d="M0 220Q250 165 500 225T1000 210T1200 220"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="9"
          opacity=".54"
        />
      </g>
      <g
        v-else-if="world.scene === 'kids-dinosaur-valley'"
        class="world-landscape"
      >
        <path
          d="M0 530 190 305 380 520 595 250 820 530 1040 310 1200 500V800H0Z"
          fill="var(--world-ink)"
          opacity=".3"
        />
        <path
          d="M0 640Q210 545 420 650T840 635T1200 620V800H0Z"
          fill="var(--world-accent)"
          opacity=".52"
        />
        <g
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="18"
          stroke-linecap="round"
          opacity=".62"
        >
          <path
            d="M90 780V630M90 675 40 635M90 700 145 650M1080 800V650M1080 690 1030 650M1080 715 1130 665"
          />
        </g>
        <path
          d="M525 800Q580 745 635 800"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="18"
        />
      </g>
      <g
        v-else-if="world.scene === 'kids-space-expedition'"
        class="world-space"
      >
        <circle
          cx="930"
          cy="245"
          r="112"
          fill="var(--world-accent)"
          opacity=".52"
        />
        <path
          d="M760 260Q930 110 1100 260"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="10"
          opacity=".7"
        />
        <circle
          cx="310"
          cy="210"
          r="48"
          fill="var(--world-highlight)"
          opacity=".55"
        />
        <g class="scene-stars" fill="var(--world-ink)">
          <path d="m180 390 12 32 32 12-32 12-12 32-12-32-32-12 32-12z" />
          <path d="m760 450 8 20 20 8-20 8-8 20-8-20-20-8 20-8z" />
          <circle cx="1040" cy="425" r="8" />
          <circle cx="470" cy="320" r="7" />
        </g>
        <path
          d="M0 700Q300 660 600 700T1200 680"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="4"
          stroke-dasharray="8 24"
          opacity=".45"
        />
      </g>
      <g
        v-else-if="world.scene === 'kids-jungle-expedition'"
        class="world-jungle"
      >
        <path
          d="M0 190Q210 50 420 210T820 190T1200 175V800H0Z"
          fill="var(--world-ink)"
          opacity=".28"
        />
        <path
          d="M0 620Q260 480 520 640T1040 600T1200 610V800H0Z"
          fill="var(--world-accent)"
          opacity=".5"
        />
        <path
          d="M200 0Q280 220 150 410M990 0Q900 220 1040 440"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="18"
          opacity=".48"
        />
        <path
          d="M0 770Q240 680 480 770T960 760T1200 740"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="14"
        />
        <g fill="var(--world-highlight)" opacity=".8">
          <circle cx="350" cy="420" r="7" />
          <circle cx="840" cy="370" r="9" />
          <circle cx="710" cy="510" r="6" />
        </g>
      </g>
      <g v-else-if="world.scene === 'kids-moon-castle'" class="world-castle">
        <circle
          cx="930"
          cy="190"
          r="85"
          fill="var(--world-highlight)"
          opacity=".75"
        />
        <path
          d="M260 710V475L345 365 430 475V710M430 710V425L515 325 600 425V710M600 710V475L685 365 770 475V710M770 710V425L855 325 940 425V710"
          fill="var(--world-accent)"
          opacity=".72"
        />
        <path
          d="M240 710H960M345 365V290M515 325V240M685 365V290M855 325V240"
          stroke="var(--world-ink)"
          stroke-width="16"
        />
        <g fill="var(--world-ink)" opacity=".62">
          <circle cx="200" cy="215" r="8" />
          <circle cx="470" cy="170" r="10" />
          <circle cx="730" cy="230" r="7" />
          <circle cx="1080" cy="350" r="9" />
        </g>
      </g>
      <g v-else-if="world.scene === 'kids-candy-cloud'" class="world-candy">
        <path
          d="M0 625Q115 560 230 625Q255 500 370 550Q465 450 560 570Q690 480 790 595Q935 480 1040 610Q1135 550 1200 590V800H0Z"
          fill="var(--world-accent)"
          opacity=".48"
        />
        <g fill="var(--world-highlight)" opacity=".8">
          <circle cx="210" cy="675" r="28" />
          <circle cx="255" cy="675" r="28" />
          <circle cx="232" cy="638" r="28" />
          <circle cx="900" cy="660" r="28" />
          <circle cx="945" cy="660" r="28" />
          <circle cx="922" cy="622" r="28" />
        </g>
        <path
          d="M225 680V780M920 665V775"
          stroke="var(--world-ink)"
          stroke-width="9"
        />
        <g fill="none" stroke="var(--world-ink)" stroke-width="9" opacity=".58">
          <path d="M470 230C470 170 560 170 560 230V330H470Z" />
          <path d="M470 250H560" />
        </g>
      </g>
      <g v-else-if="world.scene === 'kids-firefly-garden'" class="world-garden">
        <path
          d="M0 670Q160 600 320 670T640 660T960 670T1200 645V800H0Z"
          fill="var(--world-ink)"
          opacity=".28"
        />
        <g fill="none" stroke="var(--world-accent)" stroke-width="12">
          <path
            d="M170 760Q130 570 210 420M1030 760Q1090 560 980 395M490 790Q450 600 520 480"
          />
        </g>
        <g fill="var(--world-highlight)" opacity=".76">
          <circle cx="210" cy="420" r="20" />
          <circle cx="980" cy="395" r="25" />
          <circle cx="520" cy="480" r="18" />
          <circle cx="390" cy="300" r="9" />
          <circle cx="810" cy="360" r="12" />
          <circle cx="670" cy="245" r="8" />
        </g>
        <path
          d="M0 750Q300 690 600 750T1200 735"
          fill="none"
          stroke="var(--world-accent)"
          stroke-width="9"
        />
      </g>
      <g v-else-if="world.scene === 'kids-hero-city'" class="world-city">
        <path
          d="M0 540H145V385H290V480H420V300H560V495H690V350H825V460H960V255H1095V425H1200V800H0Z"
          fill="var(--world-ink)"
          opacity=".42"
        />
        <g fill="var(--world-highlight)" opacity=".86">
          <path
            d="M180 430h36v52h-36zM460 350h28v45h-28zM730 395h30v38h-30zM1000 310h32v48h-32z"
          />
          <path
            d="m600 150 18 48 50 2-39 31 14 49-43-28-43 28 14-49-39-31 50-2z"
          />
        </g>
        <path d="M0 700H1200" stroke="var(--world-accent)" stroke-width="15" />
        <path
          class="scene-comic-ray"
          d="M600 0V150M260 105 380 230M950 90 830 215"
          stroke="var(--world-highlight)"
          stroke-width="8"
          opacity=".42"
        />
      </g>
      <g v-else-if="world.scene === 'kids-sunny-farm'" class="world-farm">
        <circle
          cx="940"
          cy="200"
          r="105"
          fill="var(--world-highlight)"
          opacity=".7"
        />
        <path
          d="M0 590Q240 470 480 590T960 580T1200 555V800H0Z"
          fill="var(--world-accent)"
          opacity=".45"
        />
        <path
          d="M360 570 600 410 840 570V725H360Z"
          fill="var(--world-ink)"
          opacity=".64"
        />
        <path
          d="M330 570 600 380 870 570M490 725V590H710V725"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="20"
        />
        <path
          d="M0 760Q200 710 400 760T800 750T1200 745"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="12"
          opacity=".44"
        />
      </g>
      <g v-else-if="world.scene === 'quiet-arch'" class="world-architecture">
        <path
          d="M335 760V455Q335 250 600 250Q865 250 865 455V760M405 760V470Q405 315 600 315Q795 315 795 470V760"
          fill="none"
          stroke="var(--world-accent)"
          stroke-width="18"
          opacity=".62"
        />
        <path
          d="M0 710Q300 650 600 710T1200 690V800H0Z"
          fill="var(--world-ink)"
          opacity=".18"
        />
        <circle
          cx="600"
          cy="180"
          r="85"
          fill="var(--world-highlight)"
          opacity=".44"
        />
      </g>
      <g v-else-if="world.scene === 'film-garden'" class="world-film">
        <path
          d="M130 0V800M1070 0V800"
          stroke="var(--world-ink)"
          stroke-width="22"
          opacity=".3"
        />
        <path
          d="M0 660Q300 555 600 660T1200 635V800H0Z"
          fill="var(--world-ink)"
          opacity=".32"
        />
        <path
          d="M160 130H1040V680H160Z"
          fill="none"
          stroke="var(--world-accent)"
          stroke-width="4"
          opacity=".44"
        />
        <circle
          cx="600"
          cy="400"
          r="118"
          fill="none"
          stroke="var(--world-highlight)"
          stroke-width="7"
          opacity=".38"
        />
        <circle
          cx="600"
          cy="400"
          r="38"
          fill="var(--world-highlight)"
          opacity=".24"
        />
      </g>
      <g v-else-if="world.scene === 'glass-atrium'" class="world-glass">
        <path
          d="M140 0 410 800M420 0 555 800M780 0 645 800M1060 0 790 800"
          stroke="var(--world-ink)"
          stroke-width="10"
          opacity=".2"
        />
        <path
          d="M0 615Q300 545 600 615T1200 590V800H0Z"
          fill="var(--world-accent)"
          opacity=".18"
        />
        <path
          d="M0 210H1200M0 410H1200"
          stroke="var(--world-highlight)"
          stroke-width="6"
          opacity=".42"
        />
        <path
          d="M0 710Q300 650 600 710T1200 690"
          stroke="var(--world-ink)"
          stroke-width="8"
          fill="none"
          opacity=".3"
        />
      </g>
      <g v-else class="world-garden">
        <path
          d="M0 620Q180 520 360 620T720 615T1200 590V800H0Z"
          fill="var(--world-accent)"
          opacity=".36"
        />
        <path
          d="M0 715Q240 650 480 715T960 705T1200 690V800H0Z"
          fill="var(--world-ink)"
          opacity=".18"
        />
        <path
          d="M150 720Q190 590 240 500M1040 735Q1000 600 960 500"
          fill="none"
          stroke="var(--world-ink)"
          stroke-width="12"
          opacity=".4"
        />
      </g>

      <g
        class="scene-foreground"
        fill="none"
        stroke="var(--world-ink)"
        stroke-width="5"
        opacity=".42"
      >
        <path d="M35 0Q180 150 150 320M1165 0Q1020 130 1050 310" />
        <path
          d="M150 125Q80 70 54 90Q90 155 150 125ZM1050 142Q1120 80 1150 106Q1112 174 1050 142Z"
        />
      </g>
    </svg>
    <span class="scene-light-ray"></span>
    <div class="scene-particles">
      <i
        v-for="i in 7"
        :key="i"
        :style="{
          '--particle-left': `${((i * 19) % 87) + 6}%`,
          '--particle-top': `${((i * 31) % 79) + 5}%`,
          '--particle-index': i,
        }"
      ></i>
    </div>
    <OriginalMascot v-if="showMascot && world.mascot" :type="world.mascot" />
  </div>
</template>
