<template>
  <svg class="ink-illustration" viewBox="0 0 360 180" fill="none" aria-hidden="true">
    <path
      d="M-18 171C56 125 96 130 144 80C184 39 250 64 341 12M77 119L42 63M140 84L164 22M214 51L252 108M277 34L291 3"
      stroke="#4c3b32"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path
      d="M-5 166C88 110 102 124 150 75C202 25 264 57 345 10"
      stroke="#4c3b32"
      stroke-width="1"
      opacity=".5"
    />
    <g
      v-for="(flower, i) in [
        [42, 63],
        [77, 119],
        [144, 80],
        [165, 22],
        [215, 51],
        [252, 108],
        [291, 18],
        [321, 28],
      ]"
      :key="i"
      :transform="`translate(${flower[0]} ${flower[1]}) rotate(${i * 27})`"
      fill="#bd7970"
      :opacity="0.55 + (i % 3) * 0.15"
    >
      <ellipse
        v-for="angle in [0, 72, 144, 216, 288]"
        :key="angle"
        cx="0"
        cy="-8"
        rx="6"
        ry="9"
        :transform="`rotate(${angle})`"
      />
      <circle r="2.5" fill="#f5dbc1" />
    </g>
    <path
      d="M102 107Q112 93 126 98Q113 109 102 107M269 32Q260 18 248 20Q254 35 269 32"
      fill="#958877"
    />
  </svg>
</template>
<style scoped>
.ink-illustration {
  display: block;
  width: min(100%, 360px);
  height: auto;
  pointer-events: none;
  transform-origin: left bottom;
  animation: ink-sway 12s ease-in-out infinite;
}
@keyframes ink-sway {
  50% {
    transform: rotate(1.5deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ink-illustration {
    animation: none;
  }
}
</style>
