import { Reactive } from "./app"

export interface YeapConfig {
  recordObserverValueMethod: boolean
  recordObserverCompute: boolean
}

export function config<K extends keyof YeapConfig>(key: K, value?: YeapConfig[K]): YeapConfig[K]

export function unique<F extends Function>(fn: F): F

export function memo<F extends Function>(fn: F): F

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<any>>]

export function untrack<T, F extends Function>(callback: F, ...deps: Array<Reactive<T>>): F
