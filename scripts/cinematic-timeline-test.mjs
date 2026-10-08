import assert from 'node:assert/strict'
import { SceneTimeline } from '../frontend/src/components/cinematic/SceneTimeline.js'
const timers = new Map()
let id = 0
const timeline = new SceneTimeline(
  (callback) => {
    timers.set(++id, callback)
    return id
  },
  (key) => timers.delete(key),
)
const states = []
timeline.run(
  [
    { at: 0, state: 'ENTERING' },
    { at: 650, state: 'ACTIVE' },
  ],
  (state) => states.push(state),
)
assert.deepEqual(states, ['ENTERING'])
const stale = [...timers.values()][0]
timeline.run(
  [
    { at: 0, state: 'EXITING' },
    { at: 350, state: 'COMPLETED' },
  ],
  (state) => states.push(state),
)
stale()
assert.deepEqual(states, ['ENTERING', 'EXITING'])
for (const cb of [...timers.values()]) cb()
assert.equal(states.at(-1), 'COMPLETED')
assert.equal(timeline.pending.size, 0)
timeline.run(
  [
    { at: 0, state: 'ENTERING' },
    { at: 650, state: 'ACTIVE' },
  ],
  (state) => states.push(state),
  true,
)
assert.equal(states.at(-1), 'ACTIVE')
assert.equal(timeline.pending.size, 0)
timeline.run([{ at: 20, state: 'READY' }], (state) => states.push(state))
const unmounted = [...timers.values()].at(-1)
timeline.stop()
unmounted()
assert.equal(states.at(-1), 'ACTIVE')
assert.equal(timeline.pending.size, 0)
console.log(
  'PASS: timeline interruption, reentry, reduced motion and unmount cancellation',
)
