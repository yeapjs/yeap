import { Function, Reactive } from "../types/app"
import { recordReactor } from "./helpers"

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<any>>] {
  recordReactor.start()
  const value = callback()
  return [value, Array.from(recordReactor.stop() ?? [])]
}

export function untrack<T>(callback: Function, ...deps: Array<Reactive<T>>): Function {
  return () => {
    if (!deps.length) recordReactor.pause()
    const value = callback()
    if (!deps.length) recordReactor.resume()
    else recordReactor.pop(...deps)

    return value
  }
}
