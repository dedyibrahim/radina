<script setup>
import { ref, inject } from 'vue'
import { Music2, Pause, Play, SkipBack, SkipForward, ChevronUp } from 'lucide-vue-next'
const expanded = ref(false)
const { playing, toggle, currentTrack, tracks, next, previous } = inject('weddingAudio')
</script>
<template>
  <aside class="playlist-player" aria-label="Wedding music player">
    <div v-if="expanded" class="playlist-details">
      <small>WEDDING SOUNDTRACK</small><strong>{{ currentTrack?.title }}</strong
      ><span>{{ currentTrack?.artist }}</span>
      <div class="playlist-controls">
        <button aria-label="Lagu sebelumnya" :disabled="tracks.length < 2" @click="previous">
          <SkipBack :size="18" /></button
        ><button :aria-label="playing ? 'Pause music' : 'Play music'" @click="toggle">
          <Pause v-if="playing" :size="20" /><Play v-else :size="20" /></button
        ><button aria-label="Lagu berikutnya" :disabled="tracks.length < 2" @click="next">
          <SkipForward :size="18" />
        </button>
      </div>
    </div>
    <div class="playlist-buttons">
      <button
        class="sound-disc"
        :class="{ spinning: playing }"
        :aria-label="playing ? 'Music ON' : 'Music OFF'"
        @click="toggle"
      >
        <Music2 :size="19" /></button
      ><button
        class="expand-player"
        aria-label="Detail playlist"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <ChevronUp :size="15" />
      </button>
    </div>
  </aside>
</template>
<style>
.playlist-player {
  position: fixed;
  right: max(14px, env(safe-area-inset-right));
  bottom: calc(94px + env(safe-area-inset-bottom));
  z-index: 70;
  color: var(--ink, #513a31);
}
.playlist-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
}
.sound-disc {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--gold, #c49a79);
  background: var(--paper, #fff9f5);
  color: inherit;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 20px #0002;
}
.sound-disc.spinning {
  animation: disc-spin 12s linear infinite;
}
.expand-player {
  width: 32px;
  height: 44px;
  background: var(--paper, #fff9f5);
  border: 1px solid var(--gold, #c49a79);
  border-radius: 15px;
  color: inherit;
  display: grid;
  place-items: center;
}
.playlist-details {
  width: min(250px, calc(100vw - 30px));
  margin-bottom: 10px;
  background: var(--paper, #fff9f5);
  border: 1px solid var(--gold, #c49a79);
  padding: 18px;
  border-radius: 18px;
  box-shadow: 0 8px 30px #0002;
  display: grid;
  gap: 8px;
}
.playlist-details small {
  font-size: 8px;
  letter-spacing: 2px;
}
.playlist-details strong {
  font-size: 13px;
  overflow-wrap: anywhere;
}
.playlist-details > span {
  font-size: 11px;
}
.playlist-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.playlist-controls button {
  height: 44px;
  width: 44px;
  border: 0;
  background: none;
  color: inherit;
  display: grid;
  place-items: center;
}
.playlist-controls button:disabled {
  opacity: 0.3;
}
.design-dark .playlist-details,
.design-dark .sound-disc {
  backdrop-filter: blur(16px);
  background: #231720e6;
  color: #edc4d0;
}
.design-letters .sound-disc {
  background: repeating-radial-gradient(circle, #25211c 0 3px, #39332d 3px 4px);
  color: #e9d4ab;
  border: 7px solid #29231c;
}
.design-amore .sound-disc {
  border-radius: 42% 58% 40% 60%;
  background: #f4dfe2;
}
.design-cinema .playlist-details {
  border-radius: 0;
  background: #17171e;
  color: #eee;
}
.design-noir .playlist-player {
  color: #d8bc8f;
}
.design-noir .playlist-details,
.design-noir .sound-disc,
.design-noir .expand-player {
  background: #171717;
}
.design-pure .sound-disc {
  border: 1px solid #333;
  background: white;
}
.design-daydream .sound-disc {
  background: #eadbf2;
  border: 2px solid white;
}
.design-garden .sound-disc {
  border-radius: 50% 0 50% 0;
  background: #e5eddb;
}
@keyframes disc-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (min-width: 768px) {
  .playlist-player {
    bottom: 25px;
    right: 25px;
  }
  .design-noir .playlist-player,
  .design-cinema .playlist-player {
    right: 100px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sound-disc.spinning {
    animation: none;
  }
}
</style>
