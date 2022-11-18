interface RecordSession<T> {
  value: Set<T>,
  previous: RecordSession<T> | null
}

export class Recorder<T> {
  #session: RecordSession<T> | null = null
  isPause = true

  start() {
    this.#session = {
      value: new Set(),
      previous: this.#session
    }
    this.isPause = false
  }

  push(...items: Array<T>) {
    if (!this.isPause && this.#session?.value) items.forEach((item) => this.#session!.value.add(item))
  }

  pop(...items: Array<T>) {
    if (this.#session?.value) items.forEach((item) => this.#session!.value.delete(item))
  }

  pause() {
    this.isPause = true
  }

  resume() {
    this.isPause = this.#session === null
  }

  stop(): Set<T> | null {
    let recorded = this.#session?.value
    this.#session = this.#session?.previous ?? null
    this.isPause = this.#session === null

    return recorded ?? null
  }
}
