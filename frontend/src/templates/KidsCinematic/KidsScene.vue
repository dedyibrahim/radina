<script setup>
import { computed, inject, ref } from 'vue'
import { useIntersectionAnimation } from '../../composables/useIntersectionAnimation'
const props = defineProps({ scene: { type: String, default: 'home' } })
const visual = inject('weddingVisual')
const viewport = ref(null)
const visible = useIntersectionAnimation(viewport)
const world = computed(() => visual.config.value.sceneProfile)
const theme = computed(() => world.value.kidsTheme)
const lite = computed(() => visual.performance.quality.value === 'lite')
const active = computed(
  () =>
    visible.value &&
    visual.motion.value &&
    visual.performance.active.value &&
    !visual.performance.reduced.value,
)
const phase = computed(
  () => [...props.scene].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 17,
)
const shot = computed(() =>
  ['opening', 'home'].includes(props.scene)
    ? 'arrival'
    : ['couple', 'story', 'gallery', 'video'].includes(props.scene)
      ? 'play'
      : props.scene === 'closing'
        ? 'farewell'
        : 'celebrate',
)
const actors = computed(() =>
  theme.value === 'tom-jerry'
    ? ['tom', 'jerry']
    : theme.value === 'upin-ipin'
      ? ['upin', 'ipin']
      : [theme.value],
)
const bg = computed(() => `/images/cinematic/kids/bg-${theme.value}`)
const sprite = computed(
  () => `/images/cinematic/kids/character-${theme.value}-768.webp`,
)
</script>
<template>
  <div
    class="kids-scene"
    :data-theme="theme"
    :data-shot="shot"
    :data-scene="scene"
    :data-active="active"
    :data-quality="visual.performance.quality.value"
    :style="{
      '--kids-phase': `${-phase}s`,
      '--kids-backdrop': `url(${bg}-640.webp)`,
    }"
    aria-hidden="true"
  >
    <div ref="viewport" class="kids-scene__viewport">
      <img
        class="kids-camera"
        :src="`${bg}-640.webp`"
        :srcset="`${bg}-640.webp 640w, ${bg}-1024.webp 1024w`"
        sizes="(max-width: 640px) 100vw, 640px"
        alt=""
        :loading="scene === 'opening' ? 'eager' : 'lazy'"
        decoding="async"
        data-living-motion="true"
      />
      <div class="kids-scene__veil" />
      <div class="kids-sunbeam" data-living-motion="true" />
      <div class="kids-clouds">
        <i
          v-for="i in lite ? 1 : 3"
          :key="i"
          :style="{ '--i': i }"
          data-living-motion="true"
        />
      </div>
      <div class="kids-bunting" data-living-motion="true">
        <i v-for="i in 9" :key="i" :style="{ '--i': i }" />
      </div>
      <div class="kids-balloons">
        <i
          v-for="i in lite ? 2 : 5"
          :key="i"
          :style="{ '--i': i, '--x': `${((i * 31) % 90) + 4}%` }"
          data-living-motion="true"
          ><span
        /></i>
      </div>
      <div class="kids-confetti">
        <i
          v-for="i in lite ? 5 : 14"
          :key="i"
          :style="{ '--i': i, '--x': `${(i * 23) % 96}%` }"
          data-living-motion="true"
        />
      </div>
      <div class="kids-sparkles">
        <i
          v-for="i in lite ? 3 : 10"
          :key="i"
          :style="{
            '--i': i,
            '--x': `${((i * 29) % 92) + 4}%`,
            '--y': `${((i * 17) % 86) + 5}%`,
          }"
          data-living-motion="true"
        />
      </div>
      <div
        v-if="theme === 'unicorn'"
        class="kids-rainbow"
        data-living-motion="true"
      />
      <div
        v-if="theme === 'doraemon'"
        class="kids-portal"
        data-living-motion="true"
      >
        <i /><span />
      </div>
      <div
        v-if="theme === 'doraemon'"
        class="kids-propeller"
        data-living-motion="true"
      >
        <i /><span />
      </div>
      <div
        v-if="theme === 'tom-jerry'"
        class="kids-cheese"
        data-living-motion="true"
      >
        <i /><i /><i />
      </div>
      <div v-if="theme === 'upin-ipin'" class="kids-leaves">
        <i
          v-for="i in lite ? 2 : 5"
          :key="i"
          :style="{ '--i': i, '--x': `${(i * 37) % 94}%` }"
          data-living-motion="true"
        />
      </div>
      <div
        v-if="theme === 'upin-ipin' || theme === 'unicorn'"
        class="kids-butterflies"
      >
        <i
          v-for="i in lite ? 1 : 3"
          :key="i"
          :style="{ '--i': i }"
          data-living-motion="true"
          ><span /><b
        /></i>
      </div>
      <figure
        v-for="(actor, i) in actors"
        :key="actor"
        class="kids-actor"
        :class="`kids-actor--${actor}`"
        :data-actor="actor"
        :style="{ '--actor-phase': `${-phase - i * 2.7}s` }"
        data-living-motion="true"
      >
        <img
          :src="sprite"
          alt=""
          :loading="scene === 'opening' ? 'eager' : 'lazy'"
          decoding="async"
        />
      </figure>
    </div>
  </div>
</template>
