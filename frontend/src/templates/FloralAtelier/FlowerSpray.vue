<script>
let flowerInstance = 0
</script>
<script setup>
import { inject, computed } from 'vue'
const props = defineProps({ compact: Boolean })
const design = inject('floralDesign')
const uid = `flower-spray-${++flowerInstance}`
const flowers = computed(() =>
  props.compact
    ? [
        [78, 72, 0.52],
        [34, 141, 0.28],
      ]
    : [
        [95, 93, 0.78],
        [43, 174, 0.5],
        [167, 47, 0.36],
        [154, 171, 0.28],
      ],
)
</script>
<template>
  <svg
    class="flower-spray"
    viewBox="0 0 250 270"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`${uid}-petal`" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#fff9f0" />
        <stop offset=".4" stop-color="var(--floral-flower)" />
        <stop offset="1" stop-color="var(--gold)" />
      </linearGradient>
      <linearGradient :id="`${uid}-leaf`" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="var(--floral-leaf)" stop-opacity=".36" />
        <stop offset="1" stop-color="var(--floral-leaf)" />
      </linearGradient>
    </defs>
    <g stroke="var(--floral-leaf)" stroke-width="1.2" opacity=".75">
      <path
        d="M-6-8C10 66 23 136 69 255M0 0C49 30 89 23 219 60M2 2C30 90 82 110 184 208M0 0C71 86 141 66 223 125"
      />
      <g
        v-for="i in 11"
        :key="`leaf-${i}`"
        :transform="`translate(${8 + i * 14},${20 + i * 15}) rotate(${i % 2 ? -35 : 45})`"
      >
        <g class="spray-leaf" :style="{ '--flower-delay': `${-i * 0.8}s` }">
          <path
            d="M0 0C-12-23-32-28-40-36C-45-7-23 12 0 0Z"
            :fill="`url(#${uid}-leaf)`"
          />
          <path d="M0 0L-31-25" stroke-width=".7" />
        </g>
      </g>
      <g
        v-for="i in 5"
        :key="`bud-${i}`"
        :transform="`translate(${25 + i * 38},${24 + i * 8})`"
      >
        <path d="M0 0Q-12-18-4-30Q11-23 0 0" fill="var(--floral-flower)" />
      </g>
    </g>
    <g
      v-for="([x, y, s], index) in flowers"
      :key="index"
      :transform="`translate(${x},${y}) scale(${design.flower === 'fern' ? s * 0.6 : s})`"
    >
      <g class="flower-core" :style="{ '--flower-delay': `${-index * 2.7}s` }">
        <template v-if="['rose', 'peony'].includes(design.flower)">
          <path
            v-for="i in design.flower === 'peony' ? 14 : 10"
            :key="i"
            d="M0-8C-31-4-46-32-21-47C-2-62 29-45 24-23C19-10 7-5 0-8Z"
            :transform="`rotate(${i * (design.flower === 'peony' ? 360 / 14 : 36)})`"
            :fill="`url(#${uid}-petal)`"
            stroke="var(--floral-flower)"
            stroke-width=".7"
            opacity=".9"
          />
          <path
            v-for="i in 6"
            :key="`inner-${i}`"
            d="M0 0C-22-6-25-23-9-28C8-34 25-15 13-3C7 3 3 4 0 0Z"
            :transform="`rotate(${i * 60})`"
            :fill="`url(#${uid}-petal)`"
            stroke="var(--ivory)"
            stroke-width=".6"
          />
          <path
            d="M-9-5C10-16 21 9 5 13C-11 19-18-4-4-8C6-12 13 3 4 6"
            stroke="var(--gold)"
            stroke-width="2"
          />
        </template>
        <template v-else-if="design.flower === 'orchid'">
          <path
            v-for="i in 5"
            :key="i"
            d="M0 0C-24-18-34-39-14-49C9-63 33-36 21-18Z"
            :transform="`rotate(${i * 72})`"
            :fill="`url(#${uid}-petal)`"
            stroke="var(--floral-flower)"
            stroke-width=".8"
          />
          <path
            d="M-16 5C-26 25-10 34 0 22C12 35 28 21 15 5Q0-3-16 5Z"
            fill="var(--gold)"
            opacity=".75"
          />
          <circle r="5" fill="#faf0cf" />
        </template>
        <template v-else-if="design.flower === 'lily'">
          <path
            v-for="i in 6"
            :key="i"
            d="M0 4C-25-17-15-43 0-58C19-41 23-15 0 4Z"
            :transform="`rotate(${i * 60})`"
            :fill="`url(#${uid}-petal)`"
            stroke="#fff4de"
            stroke-width=".8"
          />
          <g
            v-for="i in 6"
            :key="`stamen-${i}`"
            :transform="`rotate(${i * 60})`"
          >
            <path d="M0 0L0-21" stroke="var(--gold)" />
            <circle cy="-21" r="2.7" fill="var(--gold)" />
          </g>
        </template>
        <template v-else>
          <path
            v-for="i in design.flower === 'sakura' ? 5 : 8"
            :key="i"
            :d="
              design.flower === 'sakura'
                ? 'M0 3C-27-11-26-40-11-44L0-38L10-45C31-32 24-9 0 3Z'
                : 'M0 4C-24-7-25-34-9-43C7-54 28-32 17-12C10-2 5 2 0 4Z'
            "
            :transform="`rotate(${i * (design.flower === 'sakura' ? 72 : 45)})`"
            :fill="
              design.flower === 'jasmine' ? '#fbf6dd' : `url(#${uid}-petal)`
            "
            stroke="var(--floral-flower)"
            stroke-width=".7"
          />
          <circle r="7" fill="var(--gold)" />
          <circle
            v-for="i in 8"
            :key="`pollen-${i}`"
            :cx="11 * Math.cos((i * Math.PI) / 4)"
            :cy="11 * Math.sin((i * Math.PI) / 4)"
            r="1.5"
            fill="var(--gold)"
          />
        </template>
      </g>
    </g>
    <g v-if="design.corner_motion === 'flutter'" transform="translate(198 191)">
      <g class="spray-butterfly">
        <g
          class="butterfly-wings"
          fill="var(--floral-flower)"
          stroke="var(--gold)"
          stroke-width=".8"
        >
          <path d="M0 0C-45-42-36-3-13 4C-35 13-14 30 0 7Z" />
          <path d="M0 0C45-42 36-3 13 4C35 13 14 30 0 7Z" />
        </g>
        <path d="M0-9V13M0-7Q-8-22-10-15M0-7Q8-22 10-15" stroke="var(--ink)" />
      </g>
    </g>
    <g fill="var(--gold)" opacity=".5">
      <circle cx="227" cy="33" r="2" />
      <circle cx="74" cy="234" r="1.7" />
      <circle cx="217" cy="223" r="2.1" />
    </g>
  </svg>
</template>
