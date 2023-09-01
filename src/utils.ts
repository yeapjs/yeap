import { Reactive } from "../types/app"
import { YeapConfig } from "../types/utils"
import { createComputed, isReactor } from "./app"
import { equals, GLOBAL_CONTEXT, recordReactor } from "./helpers"

export function config<K extends keyof YeapConfig>(key: K, value?: YeapConfig[K]): YeapConfig[K] {
  if (value) GLOBAL_CONTEXT.yeapContext![key] = value
  return GLOBAL_CONTEXT.yeapContext![key]
}

export function unique<F extends (...args: any[]) => any>(fn: F): F {
  let called = false
  let value: ReturnType<F>

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (!called) {
      value = fn.apply(this, args)
      called = true
    }
    return value
  } as F
}

export function memo<F extends (...args: any[]) => any>(fn: F): F {
  let lastArgs: Parameters<F>
  let value: ReturnType<F>

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (!equals(lastArgs, args)) value = fn.apply(this, args)
    lastArgs = args
    return value
  } as F
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

export function untrack<T, F extends (...args: any[]) => any>(callback: F, ...deps: Array<Reactive<T>>): F {
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (!deps.length) recordReactor.pause()
    const value = callback.apply(this, args)
    if (!deps.length) recordReactor.resume()
    else recordReactor.pop(...deps)

    return value
  } as F
}
