import "./jsx"

export interface CreateEffectOption {
  immediate: boolean
}

export type AsyncFunction<A extends Array<any>, O> = (...args: A) => Promise<O>
export interface AsyncComputedReturn<T, E = any> {
  data: Reactor<T>
  error: Reactor<E | null>
  loading: Reactor<boolean>
}
export interface AsyncReturn<T, E = any> extends AsyncComputedReturn<T, E> {
  refetch(): void
}

export type SubscribeHandler<T> = (prev: T, next: T) => void

export type ComponentProps<T> = T & { fallback?: JSX.Element, when?: any | Reactor<any> }
export interface Component<T = object> {
  (props: ComponentProps<T>, children: Array<JSX.Element>): JSX.Element
  defaultProps?: T
}

export type ToReactive<T = object> = {
  [K in keyof T]: Reactor<T[K]>
}
export type Reactor<T> = ToReactive<T> & {
  (v?: T | ((v: T) => T)): T
  subscribe?(handler: SubscribeHandler<T>): void
  when?(truthy: JSX.Element, falsy: JSX.Element): Reactor<JSX.Element>
}

export function createAsync<T, E>(fetcher: AsyncFunction<[], T>): AsyncReturn<T, E>
export function createAsyncComputed<T, E>(fetcher: AsyncFunction<[], T>, ...deps: Array<Reactor<T>>): AsyncComputedReturn<T, E>

export function createComputed<T>(reactorHandle: () => (T | Reactor<T>), ...deps: Array<Reactor<T>>): Reactor<T>

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption, ...deps: Array<Reactor<T>>): void
export function createEffect<T>(reactorHandle: () => any, ...deps: Array<Reactor<T>>): void

export function createReactor<T>(initialValue?: T): Reactor<T>

export function createPersistor<T>(handle: () => T): T

export function onMounted(handle: Function): void
export function onUnmounted(handle: Function): void
