export class Recorder<T> {
  #recorded: Set<T> | null = null
  isPause = true

  start() {
    this.#recorded = new Set()
    this.isPause = false
  }

  push(item: T) {
    if (!this.isPause) this.#recorded?.add(item)
  }

  pause() {
    this.isPause = true
  }

  resume() {
    this.isPause = false
  }

  stop(): Set<T> | null {
    let recorded = this.#recorded
    this.#recorded = null
    this.isPause = true

    return recorded
  }
}
