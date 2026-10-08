import { ref, computed, onUnmounted, toValue, watch } from 'vue'
export function useAudio(src, volume = 0.4, options = () => ({})) {
  const playing = ref(false)
  const error = ref('')
  const index = ref(0)
  const volumeLevel = ref(Math.min(1, Math.max(0, toValue(volume))))
  const muted = ref(false)
  function setVolume(value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return
    volumeLevel.value = Math.min(1, Math.max(0, number))
    if (audio) audio.volume = volumeLevel.value
  }
  function toggleMute() {
    muted.value = !muted.value
    if (audio) audio.muted = muted.value
  }
  const tracks = computed(() => {
    const value = toValue(src)
    return Array.isArray(value)
      ? value.filter((track) => track.url)
      : value
        ? [{ url: value, title: 'Wedding soundtrack' }]
        : []
  })
  const currentTrack = computed(
    () => tracks.value[index.value] || tracks.value[0],
  )
  let audio
  let history = [],
    generation = 0
  function ensureAudio() {
    if (!audio) {
      audio = new Audio(currentTrack.value?.url)
      audio.loop = false
      audio.addEventListener('ended', ended)
      audio.volume = volumeLevel.value
      audio.muted = muted.value
      audio.preload = 'metadata'
    }
  }
  // Unlock the same audio element during the click gesture, silently. Playback
  // becomes audible after the cover transition, including on mobile browsers.
  async function preparePlayback() {
    if (playing.value || !currentTrack.value) return
    ensureAudio()
    const request = ++generation
    audio.muted = true
    try {
      await audio.play()
      if (request !== generation) return
      audio.pause()
      audio.currentTime = 0
    } catch {}
  }
  async function play() {
    ensureAudio()
    if (!currentTrack.value) return
    audio.muted = muted.value
    if (audio.getAttribute('src') !== currentTrack.value.url)
      audio.src = currentTrack.value.url
    const request = ++generation
    try {
      await audio.play()
      if (request !== generation) return
      playing.value = true
      error.value = ''
    } catch (e) {
      if (request !== generation || e.name === 'AbortError') return
      playing.value = false
      error.value =
        'Musik belum dapat diputar. Tekan tombol musik untuk mencoba kembali.'
    }
  }
  function pause() {
    ++generation
    audio?.pause()
    playing.value = false
  }
  function toggle() {
    if (playing.value) pause()
    else play()
  }
  function advance(direction = 1, auto = false) {
    const config = toValue(options) || {}
    if (!tracks.value.length) return
    if (
      auto &&
      !config.repeat &&
      (!config.shuffle || tracks.value.length === 1) &&
      index.value === tracks.value.length - 1
    ) {
      pause()
      return
    }
    let candidate =
      (index.value + direction + tracks.value.length) % tracks.value.length
    if (config.shuffle && tracks.value.length > 1) history.push(index.value)
    if (config.shuffle && direction > 0 && tracks.value.length > 1) {
      let choices = tracks.value
        .map((_, i) => i)
        .filter((i) => !history.includes(i))
      if (!choices.length) {
        if (auto && !config.repeat) {
          pause()
          return
        }
        history = [index.value]
        choices = tracks.value.map((_, i) => i).filter((i) => i !== index.value)
      }
      candidate = choices[Math.floor(Math.random() * choices.length)]
    } else if (config.shuffle && direction < 0) {
      history.pop()
      candidate = history.pop() ?? candidate
    }
    const resume = playing.value || auto
    pause()
    index.value = candidate
    if (audio) {
      audio.src = currentTrack.value.url
      audio.currentTime = 0
    }
    if (resume) play()
  }
  function ended() {
    advance(1, true)
  }
  watch(
    () => toValue(volume),
    (value) => {
      setVolume(value)
    },
  )
  watch(
    () => tracks.value.map((track) => track.url).join('|'),
    () => {
      const position = tracks.value.findIndex(
        (track) => track.url === audio?.getAttribute('src'),
      )
      if (position >= 0) index.value = position
      else if (audio) {
        pause()
        index.value = 0
        history = []
        audio.src = currentTrack.value?.url || ''
      }
    },
  )
  onUnmounted(() => {
    audio?.pause()
    audio?.removeEventListener('ended', ended)
    if (audio) audio.src = ''
  })
  return {
    playing,
    error,
    play,
    preparePlayback,
    pause,
    toggle,
    tracks,
    index,
    currentTrack,
    volumeLevel,
    muted,
    setVolume,
    toggleMute,
    next: () => advance(1),
    previous: () => advance(-1),
  }
}
