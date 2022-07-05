import "./jsx"

export interface CreateComputedOption {
  observableInitialValue?: boolean
  unsubscription?: boolean
}

export interface CreateEffectOption extends CreateComputedOption {
  immediate?: boolean
}

export type Function<A extends Array<any> = Array<any>, R = any, T = any> = (this: T, ...args: A) => R
export type AsyncFunction<A extends Array<any> = Array<any>, R = any, T = any> = Function<A, Promise<R>, T>

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
export interface Component<T = object, C extends Array<any> = Array<JSX.Element>> {
  (props: ComponentProps<T>, children: C): JSX.Element
  defaultProps?: T
}

export interface Context<T> {
  id: symbol
  defaultValue?: T
  Consumer: Component<{}, [(v: T) => JSX.Element]>
  Provider: Component<{ value: T }, [Function]>
}

export interface Closer {
  close(): void
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
export function createAsync<T, E>(fetcher: AsyncFunction<[], T>, defaultValue: T): AsyncReturn<T, E>
export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, ...deps: Array<Reactor<U>>): AsyncComputedReturn<T, E>
export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, defaultValue: T, ...deps: Array<Reactor<U>>): AsyncComputedReturn<T, E>
export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, defaultValue: T, option: CreateEffectOption, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E>

export function createComputed<T, U>(reactorHandle: Function<[], Reactive<T> | T, Closer>, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T>
export function createComputed<T, U>(reactorHandle: Function<[], Reactive<T> | T, Closer>, option: CreateComputedOption, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T>

export function createContext<T>(defaultValue?: T): Context<T>

export function createEffect<T>(reactorHandle: Function<[], any, Closer>, ...deps: Array<Reactor<T>>): void
export function createEffect<T>(reactorHandle: Function<[], any, Closer>, option: CreateEffectOption, ...deps: Array<Reactor<T>>): void

export function createPersistor<T>(handle: () => T): T

export function createPersistentReactor<T>(initialValue?: Reactive<T> | T): Reactor<T>
export function createReactor<T>(initialValue?: Reactive<T> | T): Reactor<T>

export function createRef<T>(initialValue?: Reactive<T> | T): Reactor<T>

export function isReactor(arg: any): arg is Reactive<any>

export function onMounted(handle: Function): void
export function onUnmounted(handle: Function): void

export function useContext<T>(context: Context<T>): T
