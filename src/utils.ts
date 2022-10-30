import { Reactive } from "../types/app"
import { recordReactor } from "./helpers"

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<any>>] {
  recordReactor.start()
  const value = callback()
  return [value, Array.from(recordReactor.stop() ?? [])]
}

export function untrack(callback: Function): Function {
  return () => {
    recordReactor.pause()
    callback()
    recordReactor.resume()
  }
}
