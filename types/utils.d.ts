import { Reactive } from "./app"

export interface YeapConfig {
  recordObserverValueMethod: boolean
}

export function config<K extends keyof YeapConfig>(key: K, value?: YeapConfig[K]): YeapConfig[K]

export function unique<F extends Function>(fn: F): F

export function memo<F extends Function>(fn: F): F

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<unknown>>]

export function reactable<T>(callback: Reactive<T> | (() => T)): Reactive<T>

export function untrack<T, F extends Function>(callback: F, ...deps: Array<Reactive<T>>): F

export function unwrap<T>(a: Reactive<T> | (() => T) | T): T

export function autoid(): () => number

export function extend<O, F extends (...args: any) => any>(func: F, extention: O): F & O
