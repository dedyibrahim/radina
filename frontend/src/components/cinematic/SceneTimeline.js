// Deterministic, disposable scheduler. Stale callbacks cannot mutate a newer run.
export class SceneTimeline {
  constructor(schedule = setTimeout, cancel = clearTimeout) {
    // Browser timer methods must not receive this controller as their receiver.
    this.schedule = (callback, delay) => schedule(callback, delay)
    this.cancel = (timer) => cancel(timer)
    this.pending = new Set()
    this.generation = 0
  }
  stop() {
    this.generation++
    for (const timer of this.pending) this.cancel(timer)
    this.pending.clear()
  }
  run(steps, apply, immediate = false) {
    this.stop()
    const generation = this.generation
    if (immediate) {
      if (steps.length) apply(steps.at(-1).state)
      return
    }
    for (const step of steps) {
      if (!step.at) {
        apply(step.state)
        continue
      }
      const timer = this.schedule(() => {
        this.pending.delete(timer)
        if (generation === this.generation) apply(step.state)
      }, step.at)
      this.pending.add(timer)
    }
  }
}
