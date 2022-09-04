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
export type TransitionReturn = [ReadOnlyReactor<boolean>, Function<[callback: Function]>]

export type SubscribeHandler<T> = (prev: T, next: T) => void

export type ComponentProps<T> = T & { fallback?: JSX.Element, when?: any | Reactor<any> }
export interface Component<T = object, C extends Array<JSX.Element> = Array<JSX.Element>> {
  (props: ComponentProps<T>, children: C): JSX.Element
  attributeTypes?: Record<string, NumberConstructor | BooleanConstructor | BigIntConstructor | Function<[HTMLElement, unknown]>>
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
type PrimitivesToObject<T> = T extends string ? String :
  T extends number ? Number :
  T extends boolean ? Boolean :
  T extends bigint ? BigInt :
  T extends symbol ? Symbol : T

export type ToReadOnlyReactorObject<T = object> = {
  [K in keyof T]: T[K] extends Function<infer A, infer R, infer T> ? Function<A, ReadOnlyReactor<R>, T> : ReadOnlyReactor<T[K]>
}
export interface ReadOnlyReactorMethod<T> {
  /**
   * observe when the reactor is updated
   */
  subscribe(handler: SubscribeHandler<T>): () => void
  /**
   * takes a function and returns the result, used as createComputed but only for the current reactor
   */
  compute<U>(handle: Function<[T], U>): ReadOnlyReactor<U>
  /**
   * returns the value based on the reactor value, works like if else
   */
  when<U, F>(truthy: U | Function<[], U>, falsy: F | Function<[], F>): ReadOnlyReactor<U | F>
}
export type ReadOnlyReactor<T> = ToReadOnlyReactorObject<PrimitivesToObject<T>> & ReadOnlyReactorMethod<T> & {
  (): T
}

export interface ReactorMethod<T> extends ReadOnlyReactorMethod<T> {
  /**
   * create a new reactor, it cannot be updated, and it cannot observe the progress of the parent
   */
  freeze(): ReadOnlyReactor<T>
  /**
   * create a new reactor, it cannot be updated
   */
  reader(): ReadOnlyReactor<T>
}
export type ToReactorObject<T = object> = {
  [K in keyof T]: T[K] extends Function<infer A, infer R, infer T> ? Function<A, ReadOnlyReactor<R>, T> : Reactor<T[K]>
}
export type Reactor<T> = ToReactorObject<PrimitivesToObject<T>> & ReactorMethod<T> & {
  (): T
  (v: T | ((v: T) => T)): T
}
export type Reactive<T> = Reactor<T> | ReadOnlyReactor<T>

/// HOOKS
/**
 * takes a function and calls the fetcher asynchronously, returns the data, the error and if the fetcher is being called with the load
 */
export function createAsync<T, E>(fetcher: AsyncFunction<[], T>): AsyncReturn<T, E>
/**
 * takes a function and calls the fetcher asynchronously, returns the data, the error and if the fetcher is being called with the load, takes a default value
 */
export function createAsync<T, E>(fetcher: AsyncFunction<[], T>, defaultValue: T): AsyncReturn<T, E>
/**
 * shortened to
 * ```js
 * const {data, error, loading, refetch} = createAsync(...)
 * createComputed(refetch, deps) // or createEffect(refetch, deps)
 * ```
 */
export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, ...deps: Array<Reactor<U>>): AsyncComputedReturn<T, E>
/**
 * shortened to
 * ```js
 * const {data, error, loading, refetch} = createAsync(..., defaultValue)
 * createComputed(refetch, deps) // or createEffect(refetch, deps)
 * ```
 */
export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, defaultValue: T, ...deps: Array<Reactor<U>>): AsyncComputedReturn<T, E>
/**
 * shortened to
 * ```js
 * const {data, error, loading, refetch} = createAsync(..., defaultValue)
 * createComputed(refetch, deps) // or createEffect(refetch, option, deps)
 * ```
 */
export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, defaultValue: T, option: CreateEffectOption, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E>

/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor, it cannot be updated
 */
export function createComputed<T, U>(handle: Function<[], Reactive<T> | T, Closer>, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T>
/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor, it cannot be updated, it takes options
 */
export function createComputed<T, U>(handle: Function<[], Reactive<T> | T, Closer>, option: CreateComputedOption, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T>

export function createContext<T>(defaultValue?: T): Context<T>

export function createDirective<T, E extends HTMLElement = HTMLElement>(name: string, callback: Function<[E, T]>): void

/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor
 */
export function createEffect<T>(handle: Function<[], any, Closer>, ...deps: Array<Reactor<T>>): void
/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor, it takes options
 */
export function createEffect<T>(handle: Function<[], any, Closer>, option: CreateEffectOption, ...deps: Array<Reactor<T>>): void

/**
 * returns a event dispatcher
 */
export function createEventDispatcher(): Function<[name: string, detail: any]>

/**
 * create an event modifer, it will update the event, to call it `onEvent:event-modifier`
 */
export function createEventModifier(name: string, callback: Function<[Event]> | AddEventListenerOptions): void

/**
 * allows the information to be retained despite reminders from the component
 */
export function createPersistor<T>(handle: () => T): T

/**
 * shortened to `createPersistor(() =>callback)`
 */
export function createPersistentCallback<T extends Function>(callback: T): T

/**
 * shortened to `createPersistor(() =>createReactor(initialValue))`
 */
export function createPersistentReactor<T>(initialValue?: Reactive<T> | T): Reactor<T>
/**
 * create a reactor, it is a function, it can be updated `reactor(newValue)`, returns the previous value and it can be read `reactor()`, returns the current value. It can be observed
 */
export function createReactor<T>(initialValue?: Reactive<T> | T): Reactor<T>

/**
 * createRef is like createReactor but it can only be updated once, after that it becomes a ReadOnlyReactor
 */
export function createRef<T>(initialValue?: Reactive<T> | T): Reactor<T>

/**
 * create a transition, returns a reactive boolean and a function to start the transition
 */
export function createTransition(): TransitionReturn

/**
 * test if the argument is a reactor
 */
export function isReactor(arg: any): arg is Reactive<unknown>
export function isReadOnlyReactor(arg: any): arg is ReadOnlyReactor<unknown>

/**
 * registers a function that will be called when the component is rendered 
 */
export function onMounted(handle: Function): void
/**
 * registers a function that will be called when the component is deleted 
 */
export function onUnmounted(handle: Function): void

/**
 * retrieves the nearest context (provided before/parent)
 */
export function useContext<T>(context: Context<T>): T
