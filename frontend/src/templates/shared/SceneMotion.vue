<script setup>
import { ref, watch, onMounted, onUnmounted, inject } from 'vue'
import { Sparkles, Pause } from 'lucide-vue-next'

const props = defineProps({
  effects: Array,
  quality: { type: String, default: 'standard' },
})
const emit = defineEmits(['change'])
const opened = inject('invitationOpened', ref(false))
const canvas = ref(null),
  enabled = ref(false),
  frames = ref(0),
  ready = ref(false)
let ctx,
  query,
  observer,
  frame,
  last = 0,
  elapsed = 0,
  width = 0,
  height = 0,
  particles = [],
  burst = [],
  visible = true
const colors = ['#d99b70', '#8eafac', '#b990bd', '#edc66e', '#c58586']
let seed = 1729
const random = (min, max) => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  return min + (seed / 4294967296) * (max - min)
}
function particle(effect, celebratory = false) {
  return {
    effect,
    x: random(0, 1),
    y: celebratory ? random(0.35, 0.55) : random(0, 1),
    size: random(3, effect === 'balloons' ? 19 : 9),
    speed: random(0.025, 0.065),
    drift: random(-0.022, 0.022),
    phase: random(0, Math.PI * 2),
    rotation: random(0, Math.PI),
    color: colors[Math.floor(random(0, colors.length))],
    life: celebratory ? random(2.5, 4.5) : 0,
    vx: celebratory ? random(-0.16, 0.16) : 0,
    vy: celebratory ? random(-0.26, -0.08) : 0,
  }
}
function fill() {
  const effects = props.effects?.length ? props.effects : ['sparkles']
  seed = 1729
  const count =
    props.quality === 'lite' ? 0 : props.quality === 'high' ? 24 : 12
  particles = Array.from({ length: count }, (_, i) =>
    particle(effects[i % effects.length]),
  )
}
function position() {
  if (!canvas.value) return
  const shell =
    canvas.value.closest('.live-wedding-preview') ||
    canvas.value.closest('.invitation-shell')
  const rect = shell?.getBoundingClientRect()
  if (!rect) return
  const nextVisible = rect.bottom > 0 && rect.top < window.innerHeight
  if (nextVisible !== visible) {
    visible = nextVisible
    start()
  }
  const nextWidth = Math.round(rect.width),
    nextHeight = window.innerHeight
  canvas.value.style.left = `${rect.left}px`
  canvas.value.style.clipPath = `inset(${Math.max(0, rect.top)}px 0 ${Math.max(0, nextHeight - rect.bottom)}px 0)`
  if (nextWidth === width && nextHeight === height) return
  width = nextWidth
  height = nextHeight
  const ratio = Math.min(
    window.devicePixelRatio || 1,
    props.quality === 'high' ? 1.5 : 1,
  )
  canvas.value.width = Math.round(width * ratio)
  canvas.value.height = Math.round(height * ratio)
  canvas.value.style.width = `${width}px`
  canvas.value.style.height = `${height}px`
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
  fill()
}
function shape(p, time, celebratory = false) {
  const x = p.x * width + Math.sin(time * 0.65 + p.phase) * 12,
    y = p.y * height,
    s = p.size
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(p.rotation + time * 0.18)
  ctx.globalAlpha = celebratory
    ? Math.min(0.85, p.life / 1.5)
    : 0.24 + Math.sin(time * 1.2 + p.phase) * 0.13
  ctx.fillStyle = p.color
  ctx.strokeStyle = p.color
  ctx.lineWidth = 1
  switch (p.effect) {
    case 'confetti':
    case 'ribbons':
      ctx.rotate(Math.sin(time * 2 + p.phase))
      ctx.fillRect(-s / 2, -s, s * 0.7, s * (p.effect === 'ribbons' ? 3 : 1.5))
      break
    case 'hearts':
      ctx.beginPath()
      ctx.moveTo(0, s)
      ctx.bezierCurveTo(-s * 2, -s, -s, -s * 1.6, 0, -s * 0.5)
      ctx.bezierCurveTo(s, -s * 1.6, s * 2, -s, 0, s)
      ctx.fill()
      break
    case 'petals':
    case 'leaves':
      ctx.beginPath()
      ctx.ellipse(0, 0, s * 0.55, s * 1.4, 0.6, 0, Math.PI * 2)
      ctx.fill()
      if (p.effect === 'leaves') {
        ctx.strokeStyle = '#638566'
        ctx.beginPath()
        ctx.moveTo(0, -s)
        ctx.lineTo(0, s)
        ctx.stroke()
      }
      break
    case 'bubbles':
    case 'geometry':
      ctx.beginPath()
      if (p.effect === 'bubbles') ctx.arc(0, 0, s * 1.5, 0, Math.PI * 2)
      else {
        ctx.moveTo(0, -s * 1.5)
        ctx.lineTo(s, 0)
        ctx.lineTo(0, s * 1.5)
        ctx.lineTo(-s, 0)
        ctx.closePath()
      }
      ctx.stroke()
      break
    case 'stars':
    case 'sparkles':
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4,
          radius = i % 2 ? s * 0.2 : s
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      }
      ctx.closePath()
      ctx.fill()
      break
    case 'shootingStars':
      ctx.rotate(-0.8)
      ctx.beginPath()
      ctx.moveTo(-s * 6, 0)
      ctx.lineTo(s, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(s, 0, 1.5, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'orbs':
    case 'fireflies': {
      const r = p.effect === 'orbs' ? s * 4 : s * 1.5,
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      gradient.addColorStop(0, p.color)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(-r, -r, r * 2, r * 2)
      break
    }
    case 'paper':
      ctx.beginPath()
      ctx.moveTo(-s * 2, -s)
      ctx.lineTo(s * 2, 0)
      ctx.lineTo(-s, s)
      ctx.lineTo(0, 0)
      ctx.closePath()
      ctx.fill()
      break
    case 'birds':
      ctx.beginPath()
      ctx.moveTo(-s * 1.5, Math.sin(time * 3 + p.phase) * s)
      ctx.quadraticCurveTo(-s * 0.7, -s, 0, 0)
      ctx.quadraticCurveTo(
        s * 0.7,
        -s,
        s * 1.5,
        Math.sin(time * 3 + p.phase) * s,
      )
      ctx.stroke()
      break
    case 'lanterns':
      ctx.beginPath()
      ctx.roundRect(-s, -s * 1.5, s * 2, s * 3, s * 0.6)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, -s * 1.5)
      ctx.lineTo(0, -s * 3)
      ctx.moveTo(0, s * 1.5)
      ctx.lineTo(0, s * 2.5)
      ctx.stroke()
      break
    case 'balloons':
      ctx.beginPath()
      ctx.ellipse(0, 0, s, s * 1.3, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(0, s * 1.3)
      ctx.bezierCurveTo(-s, s * 2, s, s * 2.5, 0, s * 4)
      ctx.stroke()
      break
    case 'film':
      ctx.strokeRect(-s, -s * 1.8, s * 2, s * 3.6)
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(-s, -s * 1.3 + i * s, 2, 2)
        ctx.fillRect(s - 2, -s * 1.3 + i * s, 2, 2)
      }
      break
    case 'seeds':
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, s * 2)
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI + (i * Math.PI) / 6
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s)
      }
      ctx.stroke()
      break
    case 'waves':
      ctx.beginPath()
      for (let i = -s * 4; i < s * 4; i++)
        ctx.lineTo(i, Math.sin(i / s + time) * s * 0.3)
      ctx.stroke()
      break
  }
  ctx.restore()
}
function stop() {
  cancelAnimationFrame(frame)
  frame = null
  last = 0
}
function draw(timestamp) {
  if (
    !enabled.value ||
    props.quality === 'lite' ||
    document.hidden ||
    !visible ||
    !ctx ||
    !width
  ) {
    stop()
    return
  }
  frame = requestAnimationFrame(draw)
  if (last && timestamp - last < 32) return
  const delta = last ? Math.min((timestamp - last) / 1000, 0.08) : 0.033
  last = timestamp
  elapsed += delta
  frames.value++
  ctx.clearRect(0, 0, width, height)
  for (const p of particles) {
    const upward = ['balloons', 'bubbles', 'orbs', 'fireflies'].includes(
      p.effect,
    )
    p.y += delta * p.speed * (upward ? -1 : 1)
    p.x += delta * p.drift
    if (p.y > 1.1) p.y = -0.1
    if (p.y < -0.1) p.y = 1.1
    if (p.x > 1.1) p.x = -0.1
    if (p.x < -0.1) p.x = 1.1
    shape(p, elapsed)
  }
  burst = burst.filter((p) => p.life > 0)
  for (const p of burst) {
    p.life -= delta
    p.vy += delta * 0.12
    p.x += p.vx * delta
    p.y += p.vy * delta
    shape(p, elapsed, true)
  }
}
function start() {
  stop()
  emit('change', enabled.value && !document.hidden && visible)
  if (enabled.value && props.quality !== 'lite' && !document.hidden && visible)
    frame = requestAnimationFrame(draw)
}
function toggle() {
  enabled.value = !enabled.value
  try {
    localStorage.setItem('radina-motion', enabled.value ? 'on' : 'off')
  } catch {}
}
function preference() {
  enabled.value = !query.matches
  start()
}
watch(enabled, () => {
  start()
})
watch(() => props.effects, fill)
watch(
  () => props.quality,
  () => {
    fill()
    position()
    start()
  },
)
watch(opened, (value, previous) => {
  if (value && !previous && enabled.value && props.quality !== 'lite') {
    const effect = props.effects?.includes('confetti')
      ? 'confetti'
      : props.effects?.includes('paper')
        ? 'paper'
        : 'sparkles'
    burst = Array.from({ length: props.quality === 'high' ? 28 : 14 }, () =>
      particle(effect, true),
    )
  }
})
onMounted(() => {
  ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  query = matchMedia('(prefers-reduced-motion: reduce)')
  ready.value = true
  let saved
  try {
    saved = localStorage.getItem('radina-motion')
  } catch {}
  enabled.value = !query.matches && saved !== 'off'
  emit('change', enabled.value)
  position()
  start()
  observer = new ResizeObserver(position)
  observer.observe(canvas.value.closest('.invitation-shell'))
  window.addEventListener('resize', position)
  window.addEventListener('scroll', position, {
    passive: true,
    capture: true,
  })
  document.addEventListener('visibilitychange', start)
  query.addEventListener('change', preference)
})
onUnmounted(() => {
  stop()
  observer?.disconnect()
  window.removeEventListener('resize', position)
  window.removeEventListener('scroll', position, true)
  document.removeEventListener('visibilitychange', start)
  query?.removeEventListener('change', preference)
})
</script>
<template>
  <canvas
    ref="canvas"
    v-show="enabled"
    class="scene-motion"
    aria-hidden="true"
    :data-frames="frames"
    :data-effects="effects?.join(',')"
  />
  <button
    v-if="ready"
    class="motion-toggle"
    type="button"
    :aria-pressed="enabled"
    :aria-label="enabled ? 'Matikan animasi' : 'Aktifkan animasi'"
    @click="toggle"
  >
    <Pause v-if="enabled" :size="13" /><Sparkles v-else :size="13" />Animasi
    {{ enabled ? 'ON' : 'OFF' }}
  </button>
</template>
<style>
.scene-motion {
  position: fixed;
  top: 0;
  pointer-events: none;
  z-index: 12;
  contain: strict;
}
.motion-toggle {
  position: absolute;
  top: 60px;
  right: 12px;
  z-index: 14;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid currentColor;
  background: var(--ivory);
  color: var(--ink);
  border-radius: 20px;
  padding: 7px 10px;
  font:
    10px 'DM Sans',
    sans-serif;
  min-height: 36px;
  box-shadow: 0 2px 10px #0001;
}
.wedding-page.motion-off *,
.wedding-page.motion-off *::before,
.wedding-page.motion-off *::after {
  animation-play-state: paused !important;
}
.live-wedding-preview .motion-toggle {
  top: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .wedding-page *,
  .wedding-page *::before,
  .wedding-page *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
