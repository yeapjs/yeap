import { Reactive } from "./app"

export interface YeapConfig {
  recordObserverValueMethod: boolean
  recordObserverCompute: boolean
}

export function config<K extends keyof YeapConfig>(key: K, value?: YeapConfig[K]): YeapConfig[K]

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<any>>]

export function untrack<T>(callback: Function, ...deps: Array<Reactive<T>>): Function
