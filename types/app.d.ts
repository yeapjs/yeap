import { Component } from "./components"
import "./jsx"

type CSSProperties = {
  [K in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[K] extends Function ? never : CSSStyleDeclaration[K]
}

export interface CreateComputedOption {
  unsubscription?: boolean
  record?: boolean
}

export interface CreateEffectOption extends CreateComputedOption {
  immediate?: boolean
}

export interface AsyncComputedReturn<T, E = any> {
  data: ReadOnlyReactor<T>
  error: ReadOnlyReactor<E | null>
  loading: ReadOnlyReactor<boolean>
}
export interface AsyncReturn<T, E = any> extends AsyncComputedReturn<T, E> {
  refetch(): void
}
export type TransitionReturn = [ReadOnlyReactor<boolean>, (callback: Function) => void]

export type SubscribeHandler<T> = (prev: T, next: T) => void

export interface Context<T> {
  id: symbol
  defaultValue?: T
  Consumer: Component<{}, [(v: T) => JSX.Element]>
  Provider: Component<{ value: T }, Array<JSX.Element>>
}

/// REACTIVE
interface ReactorMetaData<T> {
  readonly settable: boolean
  readonly value: T
  dependencies: Set<Reactive<any>>
}

interface ArrayReactorMethod<I> {
  /// Array Method for iterate on an rray without lost the reactivity on the item
  mapReactor<U>(callbackfn: (value: Reactive<I>, index: number) => U): Array<U>

  /// Array Method Overwrite for allow the reactivity
  push(...items: Array<I>): number
  pop(): I | undefined

  unshift(...items: Array<I>): number
  shift(): I | undefined
}

type PrimitivesToObject<T> = T extends string ? String :
  T extends number ? Number :
  T extends boolean ? Boolean :
  T extends bigint ? BigInt :
  T extends symbol ? Symbol :
  T extends Array<infer I> ? Array<I> & ArrayReactorMethod<I> :
  T extends null ? object :
  T extends undefined ? object : T

export type ToReadOnlyReactorObject<T = object> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => ReadOnlyReactor<R> : ReadOnlyReactor<T[K]>
}

export interface ReadOnlyReactorMethod<T> {
  /**
   * observe when the reactor is updated
   */
  subscribe(handler: SubscribeHandler<T>, id?: any): () => void
  /**
   * takes a function and returns the result, used as createComputed but only for the current reactor
   */
  compute<U>(handle: (value: T) => U): ReadOnlyReactor<U>
  /**
   * returns the value based on the reactor value, works like if else
   */
  when<U, F>(truthy: U | (() => U), falsy: F | (() => F)): ReadOnlyReactor<U | F>
  when<U, F>(condition: (value: T) => boolean, truthy: U | (() => U), falsy: F | (() => F)): ReadOnlyReactor<U | F>
  /**
   * reactivity keeper `value1 && value2`
   */
  and<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U>
  /**
   * reactivity keeper `value1 || value2`
   */
  or<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U>
  /**
   * reactivity keeper `!value`
   */
  not(): ReadOnlyReactor<boolean>
  /**
   * reactivity keeper `value1 ?? value2`
   */
  nullish<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U>
  /**
   * make a copy of the current value, it don't keep the dependencies
   */
  copy(): Reactor<T>
  /**
   * show the metadata of the reactor
   */
  metadata(): ReactorMetaData<T>
}

export type ReadOnlyReactor<T> = ToReadOnlyReactorObject<PrimitivesToObject<T>> & ReadOnlyReactorMethod<T> & (() => T)

export interface ReactorMethod<T> extends ReadOnlyReactorMethod<T> {
  /**
   * make a read only copy of the current value, it keep the dependencies
   */
  freeze(): ReadOnlyReactor<T>
  /**
   * create a new reactor, it cannot be updated
   */
  reader(): ReadOnlyReactor<T>
}

export type ToReactorObject<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => ReadOnlyReactor<R> : Reactor<T[K]>
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
export function createAsync<T, E>(fetcher: () => Promise<T>): AsyncReturn<T, E>
export function createAsync<T, E, A extends Array<unknown>>(fetcher: (...args: A) => Promise<T>): AsyncReturn<T, E>
/**
 * takes a function and calls the fetcher asynchronously, returns the data, the error and if the fetcher is being called with the load, takes a default value
 */
export function createAsync<T, E>(fetcher: () => Promise<T>, defaultValue: T): AsyncReturn<T, E>
export function createAsync<T, E, A extends Array<unknown>>(fetcher: (...args: A) => Promise<T>, defaultValue: T): AsyncReturn<T, E>
/**
 * shortened to
 * ```js
 * const {data, error, loading, refetch} = createAsync(...)
 * createComputed(refetch, deps) // or createEffect(refetch, deps)
 * ```
 */
export function createAsyncComputed<T, E, U>(fetcher: () => Promise<T>, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E>
/**
 * shortened to
 * ```js
 * const {data, error, loading, refetch} = createAsync(..., defaultValue)
 * createComputed(refetch, deps) // or createEffect(refetch, deps)
 * ```
 */
export function createAsyncComputed<T, E, U>(fetcher: () => Promise<T>, defaultValue: T, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E>
/**
 * shortened to
 * ```js
 * const {data, error, loading, refetch} = createAsync(..., defaultValue)
 * createComputed(refetch, deps) // or createEffect(refetch, option, deps)
 * ```
 */
export function createAsyncComputed<T, E, U>(fetcher: () => Promise<T>, defaultValue: T, option: CreateEffectOption, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E>

/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor, it cannot be updated
 */
export function createComputed<T, U>(handle: () => Reactive<T> | T, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T>
/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor, it cannot be updated, it takes options
 */
export function createComputed<T, U>(handle: () => Reactive<T> | T, option: CreateComputedOption, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T>

export function createContext<T>(defaultValue?: T): Context<T>


/**
 * create a directive, it can be modify the element, to call it `use:directive-name`
 */
export function createDirective<T, E extends HTMLElement = HTMLElement>(name: string, callback: (el: E, value: T) => void): void

/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor
 */
export function createEffect<T>(handle: () => void, ...deps: Array<Reactive<T>>): number
/**
 * observes all dependencies and calls the function again when a dependency has been updated, returns a reactor, it takes options
 */
export function createEffect<T>(handle: () => void, option: CreateEffectOption, ...deps: Array<Reactive<T>>): number

export function cleanupEffect(effectId: number, callback: () => void): void

/**
 * returns a event dispatcher
 */
export function createEventDispatcher<D>(): (name: string, detail: D) => void

/**
 * create an event modifer, it will update the event, to call it `onEvent:event-modifier`
 */
export function createEventModifier(name: string, callback: ((e: Event) => any) | AddEventListenerOptions): void

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
export function createReactor<T>(initialValue?: Reactive<T> | (() => T) | T): Reactor<T>

/**
 * createRef is like createReactor but it can only be updated once, after that it becomes a ReadOnlyReactor
 */
export function createRef<T>(initialValue?: Reactive<T> | (() => T) | T): Reactor<T>

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
