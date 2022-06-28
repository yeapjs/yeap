import "./jsx"

export interface CreateEffectOption {
  immediate: boolean
}

export type AsyncFunction<A extends Array<any>, O> = (...args: A) => Promise<O>
export interface AsyncComputedReturn<T, E = any> {
  data: ReadOnlyReactor<T>
  error: ReadOnlyReactor<E | null>
  loading: ReadOnlyReactor<boolean>
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

/// REACTIVE
export type ToReadOnlyReactorObject<T = object> = {
  [K in keyof T]: ReadOnlyReactor<T[K]>
}
export interface ReadOnlyReactorMethod<T> {
  subscribe(handler: SubscribeHandler<T>): () => void
  when(truthy: JSX.Element, falsy: JSX.Element): ReadOnlyReactor<JSX.Element>
}
export type ReadOnlyReactor<T> = ToReadOnlyReactorObject<T> & ReadOnlyReactorMethod<T> & {
  (): T
}

export interface ReactorMethod<T> extends ReadOnlyReactorMethod<T> {
  freeze(): ReadOnlyReactor<T>
  reader(): ReadOnlyReactor<T>
}
export type ToReactorObject<T = object> = {
  [K in keyof T]: Reactor<T[K]>
}
export type Reactor<T> = ToReactorObject<T> & ReactorMethod<T> & {
  (v?: T | ((v: T) => T)): T
}
export type Reactive<T> = Reactor<T> | ReadOnlyReactor<T>

/// HOOKS
export function createAsync<T, E>(fetcher: AsyncFunction<[], T>): AsyncReturn<T, E>
export function createAsyncComputed<T, E>(fetcher: AsyncFunction<[], T>, ...deps: Array<Reactor<T>>): AsyncComputedReturn<T, E>

export function createComputed<T>(reactorHandle: () => (T | Reactor<T>), ...deps: Array<Reactor<T>>): ReadOnlyReactor<T>

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption, ...deps: Array<Reactor<T>>): void
export function createEffect<T>(reactorHandle: () => any, ...deps: Array<Reactor<T>>): void

export function createPersistor<T>(handle: () => T): T

export function createPersistentReactor<T>(initialValue?: Reactive<T> | T): Reactor<T>
export function createReactor<T>(initialValue?: Reactive<T> | T): Reactor<T>

export function onMounted(handle: Function): void
export function onUnmounted(handle: Function): void
