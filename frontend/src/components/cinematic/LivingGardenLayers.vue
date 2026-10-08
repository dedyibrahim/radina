<script setup>
import { computed } from 'vue'

const props = defineProps({
  scene: String,
  active: Boolean,
  quality: String,
  plane: { type: String, default: 'all' },
})
const light = computed(() => props.quality === 'lite')
const chapters = [
  'opening',
  'home',
  'quote',
  'couple',
  'date',
  'event',
  'story',
  'gallery',
  'video',
  'location',
  'gift',
  'livestream',
  'rsvp',
  'wishes',
  'closing',
]
const chapter = computed(() => Math.max(0, chapters.indexOf(props.scene)))
</script>

<template>
  <div
    class="living-garden"
    :data-active="active"
    :data-lite="light"
    :data-garden-plane="plane"
    :data-shot="scene"
    :style="{ '--garden-phase': `${chapter * -1.7}s` }"
    aria-hidden="true"
  >
    <div data-living-motion="true" class="garden-sunbeam"></div>
    <div data-living-motion="true" class="garden-mist garden-mist--far"></div>
    <div data-living-motion="true" class="garden-mist garden-mist--near"></div>
    <div data-living-motion="true" class="garden-water">
      <i data-living-motion="true"></i><i data-living-motion="true"></i>
    </div>
    <div data-living-motion="true" class="garden-branch garden-branch--left">
      <img
        src="/images/cinematic/melati-branch.webp"
        alt=""
        :loading="scene === 'opening' ? 'eager' : 'lazy'"
        decoding="async"
      />
    </div>
    <div data-living-motion="true" class="garden-branch garden-branch--right">
      <img
        src="/images/cinematic/melati-branch.webp"
        alt=""
        :loading="scene === 'opening' ? 'eager' : 'lazy'"
        decoding="async"
      />
    </div>
    <div data-living-motion="true" class="garden-petals">
      <i
        data-living-motion="true"
        v-for="i in light ? 3 : 7"
        :key="i"
        :style="{
          '--petal-x': `${(i * 23) % 94}%`,
          '--petal-delay': `${i * -2.3}s`,
          '--petal-turn': `${i * 37}deg`,
        }"
      ></i>
    </div>
    <div
      v-for="i in light ? 1 : 2"
      :key="i"
      data-living-motion="true"
      class="garden-butterfly"
      :class="`garden-butterfly--${i}`"
    >
      <svg viewBox="0 0 60 40" fill="none">
        <path
          data-living-motion="true"
          class="butterfly-wing butterfly-wing--left"
          d="M29 21C-3-12-5 24 17 23C1 38 26 46 29 21Z"
          fill="#fff4d3"
          stroke="#ad8557"
        />
        <path
          data-living-motion="true"
          class="butterfly-wing butterfly-wing--right"
          d="M31 21C63-12 65 24 43 23C59 38 34 46 31 21Z"
          fill="#fff4d3"
          stroke="#ad8557"
        />
        <path
          d="M30 11V29M30 12L25 6M30 12L35 6"
          stroke="#5a4939"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.living-garden {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.living-garden *,
.living-garden *::before {
  animation-play-state: paused !important;
}
.living-garden[data-active='true'] *,
.living-garden[data-active='true'] *::before {
  animation-play-state: running !important;
}
.garden-branch {
  position: absolute;
  width: clamp(100px, 30%, 180px);
  bottom: -48px;
  transform-origin: bottom left;
  animation: garden-branch-sway 7s ease-in-out infinite alternate;
  animation-delay: var(--garden-phase);
}
.garden-branch img {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 7px 7px #12302220);
}
.garden-branch--left {
  left: -42px;
}
.garden-branch--right {
  right: -42px;
  transform-origin: bottom right;
  animation-duration: 9s;
  animation-direction: alternate-reverse;
}
.garden-branch--right img {
  transform: scaleX(-1);
}
.garden-mist {
  position: absolute;
  width: 165%;
  left: -35%;
  height: 24%;
  background: radial-gradient(
    ellipse,
    #fff9eeb3,
    #fff9ee24 45%,
    transparent 68%
  );
  animation: garden-mist-flow 13s ease-in-out infinite alternate;
  animation-delay: var(--garden-phase);
}
.garden-mist--far {
  top: 30%;
  opacity: 0.45;
}
.garden-mist--near {
  bottom: 8%;
  opacity: 0.37;
  animation-duration: 19s;
  animation-direction: alternate-reverse;
}
.garden-sunbeam {
  position: absolute;
  inset: -20%;
  background: conic-gradient(
    from 148deg at 75% 0%,
    transparent,
    #fff4cc66 9deg,
    transparent 19deg,
    #fff4cc33 23deg,
    transparent 32deg
  );
  opacity: 0.5;
  transform-origin: 75% 0;
  animation: garden-light-sweep 10s ease-in-out infinite alternate;
  animation-delay: var(--garden-phase);
}
.garden-water {
  position: absolute;
  width: 72%;
  height: 22%;
  bottom: 1%;
  right: -7%;
  overflow: hidden;
  opacity: 0.5;
}
.garden-water i {
  position: absolute;
  top: 48%;
  left: 30%;
  width: 40%;
  height: 18%;
  border: 2px solid #fff5dbb3;
  border-radius: 50%;
  animation: garden-ripple 5s ease-out infinite;
  animation-delay: var(--garden-phase);
}
.garden-water i + i {
  animation-delay: calc(var(--garden-phase) - 2.5s);
}
.garden-petals {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.garden-petals i {
  position: absolute;
  left: var(--petal-x);
  top: -8%;
  width: 9px;
  height: 14px;
  background: #fffdf2;
  border-radius: 70% 20% 70% 20%;
  box-shadow: 0 1px 4px #927a4826;
  animation: garden-petal-fall 12s linear infinite;
  animation-delay: var(--petal-delay);
}
.garden-butterfly {
  position: absolute;
  top: 16%;
  left: 2%;
  width: 33px;
  animation: garden-butterfly-flight 11s ease-in-out infinite alternate;
  animation-delay: var(--garden-phase);
}
.garden-butterfly--2 {
  top: 68%;
  left: auto;
  right: 5%;
  width: 25px;
  animation-direction: alternate-reverse;
  animation-duration: 15s;
}
.garden-butterfly svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
.butterfly-wing {
  transform-box: view-box;
  transform-origin: center;
  animation: garden-wing 650ms ease-in-out infinite alternate;
}
.butterfly-wing--right {
  animation-direction: alternate-reverse;
}
[data-lite='true'] .garden-mist--near,
[data-lite='true'] .garden-water,
[data-lite='true'] .garden-sunbeam {
  display: none;
}

[data-garden-plane='background']
  :is(.garden-branch, .garden-petals, .garden-butterfly),
[data-garden-plane='foreground']
  :is(.garden-mist, .garden-sunbeam, .garden-water) {
  display: none;
}
[data-garden-plane='foreground'] .garden-branch {
  opacity: 0.94;
}
@keyframes garden-branch-sway {
  from {
    transform: rotate(-2deg) translateY(-3px);
  }
  to {
    transform: rotate(2deg) translateY(3px);
  }
}
@keyframes garden-mist-flow {
  from {
    transform: translateX(-8%);
  }
  to {
    transform: translateX(14%);
  }
}
@keyframes garden-light-sweep {
  from {
    transform: rotate(-7deg);
    opacity: 0.28;
  }
  to {
    transform: rotate(8deg);
    opacity: 0.62;
  }
}
@keyframes garden-ripple {
  from {
    transform: scale(0.3);
    opacity: 0.8;
  }
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
@keyframes garden-petal-fall {
  from {
    transform: translate3d(0, 0, 0) rotate(var(--petal-turn));
    opacity: 0;
  }
  12% {
    opacity: 0.8;
  }
  88% {
    opacity: 0.8;
  }
  to {
    transform: translate3d(45px, 115cqh, 0)
      rotate(calc(var(--petal-turn) + 210deg));
    opacity: 0;
  }
}
@keyframes garden-butterfly-flight {
  0% {
    transform: translate3d(0, 0, 0) rotate(-12deg);
  }
  45% {
    transform: translate3d(24px, 45px, 0) rotate(8deg);
  }
  100% {
    transform: translate3d(-7px, 85px, 0) rotate(-8deg);
  }
}
@keyframes garden-wing {
  from {
    transform: scaleX(0.35);
  }
  to {
    transform: scaleX(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .living-garden *,
  .living-garden *::before {
    animation: none !important;
  }
}
</style>
