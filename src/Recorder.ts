export class Recorder<T> {
  #recorded: Set<T> | null = null
  isPause = true

  start() {
    this.#recorded = new Set()
    this.isPause = false
  }

  push(...items: Array<T>) {
    if (!this.isPause && this.#recorded) items.forEach((item) => this.#recorded!.add(item))
  }

  pop(...items: Array<T>) {
    if (this.#recorded) items.forEach((item) => this.#recorded!.delete(item))
  }

  pause() {
    this.isPause = true
  }

  resume() {
    this.isPause = this.#recorded === null
  }

  stop(): Set<T> | null {
    let recorded = this.#recorded
    this.#recorded = null
    this.isPause = true

    return recorded
  }
}
