<script setup>
import { inject } from 'vue'
const design = inject('studioDesign')
</script>
<template>
  <div class="studio-art" aria-hidden="true" :class="`art-${design.art}`">
    <svg viewBox="0 0 390 820" preserveAspectRatio="xMidYMid slice">
      <g
        v-if="['rose', 'branches', 'meadow'].includes(design.art)"
        class="art-botanical"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M-10 840Q45 600 15 390M405 820Q340 615 385 380" />
        <g
          v-for="i in 9"
          :key="i"
          :transform="`translate(${i % 2 ? 5 : 350},${380 + i * 46}) rotate(${i % 2 ? -30 : 30})`"
        >
          <path d="M0 0Q60-60 40 20Q10 32 0 0ZM0 0Q-50-30-20 30Q0 38 0 0Z" />
        </g>
        <g
          v-if="design.art !== 'branches'"
          v-for="i in 6"
          :key="`flower-${i}`"
          :transform="`translate(${i % 2 ? 25 : 360},${420 + i * 58})`"
        >
          <circle r="9" />
          <path
            d="M0-8C-32-40-44-4-9 1C-48 30-6 48 0 9C26 49 49 11 8 1C48-20 11-45 0-8Z"
          />
        </g>
      </g>
      <g
        v-else-if="design.art === 'wayang'"
        fill="currentColor"
        class="art-gates"
      >
        <path
          d="M0 820V410L30 440L23 365L60 395L50 335L92 365L81 300L114 270L126 345L150 373L134 450L100 490L97 820Z"
        />
        <path
          d="M390 820V410L360 440L367 365L330 395L340 335L298 365L309 300L276 270L264 345L240 373L256 450L290 490L293 820Z"
        />
      </g>
      <g
        v-else-if="['batik', 'songket'].includes(design.art)"
        fill="none"
        stroke="currentColor"
      >
        <g
          v-for="i in 50"
          :key="i"
          :transform="`translate(${(i % 5) * 88 - 20},${Math.floor(i / 5) * 100})`"
        >
          <path d="M0-30Q35 0 0 30Q-35 0 0-30ZM-30 0Q0-35 30 0Q0 35-30 0Z" />
          <circle r="3" />
        </g>
      </g>
      <g
        v-else-if="design.art === 'waves'"
        fill="none"
        stroke="currentColor"
        class="art-wave"
      >
        <path
          v-for="i in 7"
          :key="i"
          :d="`M-100 ${670 + i * 19} Q20 ${600 + i * 19} 160 ${670 + i * 19} T480 ${670 + i * 19}`"
        />
      </g>
      <g
        v-else-if="design.art === 'dunes'"
        class="art-dunes"
        fill="currentColor"
      >
        <circle cx="285" cy="195" r="60" />
        <path d="M-30 780Q115 525 245 705T450 700V850H-30Z" opacity=".5" />
        <path d="M-30 825Q140 615 295 785T450 735V850H-30Z" opacity=".8" />
      </g>
      <g
        v-else-if="design.art === 'curtains'"
        fill="currentColor"
        class="art-curtains"
      >
        <path d="M0 0H34Q42 190 18 370Q45 580 24 820H0Z" />
        <path d="M390 0H356Q348 190 372 370Q345 580 366 820H390Z" />
      </g>
      <g v-else-if="design.art === 'pearls'" fill="none" stroke="currentColor">
        <circle
          v-for="i in 36"
          :key="i"
          :cx="195 + 164 * Math.cos((i * Math.PI) / 18)"
          :cy="410 + 334 * Math.sin((i * Math.PI) / 18)"
          :r="i % 3 ? 5 : 9"
        />
      </g>
      <g
        v-else-if="design.art === 'greenhouse'"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M25 820V170L195 40L365 170V820M25 170H365M195 40V820M25 330H365M25 560H365"
        />
        <path d="M70 820V205L195 110L320 205V820" />
      </g>
      <g v-else-if="design.art === 'film'" fill="currentColor">
        <g v-for="i in 24" :key="i">
          <rect x="8" :y="i * 36" width="12" height="20" rx="2" />
          <rect x="370" :y="i * 36" width="12" height="20" rx="2" />
        </g>
        <circle cx="195" cy="170" r="100" fill="none" stroke="currentColor" />
        <circle
          v-for="i in 5"
          :key="`reel-${i}`"
          :cx="195 + 60 * Math.cos((i * Math.PI * 2) / 5)"
          :cy="170 + 60 * Math.sin((i * Math.PI * 2) / 5)"
          r="21"
          fill="none"
          stroke="currentColor"
        />
      </g>
      <g
        v-else-if="design.art === 'vinyl'"
        class="art-vinyl"
        fill="none"
        stroke="currentColor"
      >
        <circle v-for="i in 18" :key="i" cx="195" cy="260" :r="30 + i * 7" />
        <circle cx="195" cy="260" r="8" fill="currentColor" />
      </g>
      <g
        v-else-if="['deco', 'marquee'].includes(design.art)"
        fill="none"
        stroke="currentColor"
      >
        <path
          v-for="i in 5"
          :key="i"
          :d="`M${14 + i * 8} 790V${84 + i * 14}H${70 + i * 11}V${24 + i * 8}H${320 - i * 11}V${84 + i * 14}H${376 - i * 8}V790`"
        />
        <g v-if="design.art === 'marquee'" fill="currentColor">
          <circle
            v-for="i in 30"
            :key="i"
            :cx="i % 2 ? 20 : 370"
            :cy="70 + Math.floor(i / 2) * 50"
            r="3"
          />
        </g>
      </g>
      <g
        v-else-if="['postal', 'paper'].includes(design.art)"
        fill="none"
        stroke="currentColor"
      >
        <path d="M0 530L195 655L390 530M0 820L150 680M390 820L240 680" />
        <rect x="285" y="54" width="64" height="78" stroke-dasharray="4 3" />
        <path d="M275 90Q245 55 210 80T140 75M275 105Q245 70 210 95T140 90" />
        <circle cx="195" cy="690" r="27" />
      </g>
      <g
        v-else-if="design.art === 'balloons'"
        class="art-balloons"
        fill="currentColor"
      >
        <g
          v-for="i in 7"
          :key="i"
          :transform="`translate(${i % 2 ? 35 : 355},${80 + i * 87})`"
        >
          <ellipse rx="22" ry="29" />
          <path d="M0 28Q-20 50 0 90T0 145" fill="none" stroke="currentColor" />
        </g>
      </g>
      <g
        v-else-if="design.art === 'origami'"
        class="art-paper"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M30 130L145 240L75 285L30 130L160 180L145 240L240 125L215 220L145 240L200 285L260 260L240 125M230 625L355 550L330 690L230 625L325 630L330 690L285 720Z"
        />
      </g>
      <g
        v-else-if="['confetti', 'festival'].includes(design.art)"
        fill="currentColor"
      >
        <g
          v-for="i in 27"
          :key="i"
          :transform="`translate(${(i * 97) % 390},${(i * 137) % 820}) rotate(${i * 37})`"
        >
          <rect v-if="i % 3 === 0" width="9" height="24" />
          <circle v-else-if="i % 3 === 1" r="7" />
          <path v-else d="M0-10L12 10H-12Z" />
        </g>
      </g>
      <g v-else-if="design.art === 'scene'"></g>
      <g v-else fill="none" stroke="currentColor" class="art-orbit">
        <ellipse cx="195" cy="240" rx="155" ry="80" />
        <ellipse cx="195" cy="240" rx="80" ry="155" />
        <circle cx="195" cy="240" r="130" />
        <path d="M30 30H140M30 30V145M360 790H250M360 790V680" />
      </g>
    </svg>
    <div v-if="design.art === 'aurora'" class="studio-aurora"></div>
  </div>
</template>
