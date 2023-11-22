import { Reactive } from "../types/app"
import { createComputed, createReactor, isReactor } from "./app"
import { equals, recordReactor } from "./helpers"

export function unique<F extends (...args: Array<any>) => any>(fn: F): F {
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

export function memo<F extends (...args: Array<any>) => any>(fn: F): F {
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

export function reactable<T>(callback: Reactive<T> | (() => T) | T): Reactive<T> {
  if (isReactor(callback)) return callback
  if (callback instanceof Function) return createComputed(callback)
  return createReactor(callback)
}

export function untrack<T, F extends (...args: Array<any>) => any>(callback: F, ...deps: Array<Reactive<T>>): F {
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (!deps.length) recordReactor.pause()
    const value = callback.apply(this, args)
    if (!deps.length) recordReactor.resume()
    else recordReactor.pop(...deps)

    return value
  } as F
}

export function unwrap<T>(a: Reactive<T> | (() => T) | T): T {
  return a instanceof Function ? a() : a
}

export function autoid(): () => number {
  let i = 0
  return () => i++
}

export function extend<O, F extends (...args: any) => any>(func: F, extention: O): F & O {
  return Object.assign(func, extention)
}
