import { Reactive } from "../types/app"
import { YeapConfig } from "../types/utils"
import { createComputed, isReactor } from "./app"
import { equals, GLOBAL_CONTEXT, recordReactor } from "./helpers"

export function config<K extends keyof YeapConfig>(key: K, value?: YeapConfig[K]): YeapConfig[K] {
  if (value) GLOBAL_CONTEXT.yeapContext![key] = value
  return GLOBAL_CONTEXT.yeapContext![key]
}

export function unique(fn: Function): Function {
  let called = false
  let value: any
  return function (this: any, ...args: any[]) {
    if (!called) {
      value = fn.apply(this, args)
      called = true
    }
    return value
  }
}

export function memo(fn: Function): Function {
  let value: any
  let lastArgs: any
  return function (this: any, ...args: any[]) {
    if (!equals(lastArgs, args)) value = fn.apply(this, args)
    lastArgs = args
    return value
  }
}

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<any>>] {
  recordReactor.start()
  const value = callback()
  return [value, Array.from(recordReactor.stop() ?? [])]
}

export function reactable<T>(callback: Reactive<T> | (() => T)): Reactive<T> {
  if (isReactor(callback)) return callback
  return createComputed(callback)
}

export function untrack<T>(callback: Function, ...deps: Array<Reactive<T>>): Function {
  return function (this: any, ...args: any[]) {
    if (!deps.length) recordReactor.pause()
    const value = callback.apply(this, args)
    if (!deps.length) recordReactor.resume()
    else recordReactor.pop(...deps)

    return value
  }
}
