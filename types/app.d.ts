import "./jsx"

export interface CreateEffectOption {
  immediate: boolean
}

export type SubscribeHandler<T> = (prev: T, next: T) => void

export type Component<T = object> = (props: ToReactive<T>, children: Array<JSX.Element>) => JSX.Element

export type ToReactive<T = object> = {
  [K in keyof T]: Reactor<T[K]>
}
export type Reactor<T> = ToReactive<T> & {
  (v?: T | ((v: T) => T)): T
  subscribe?(handler: SubscribeHandler<T>): void
  when?(truthy: JSX.Element, falsy: JSX.Element): Reactor<JSX.Element>
}

export function createComputed<T>(reactorHandle: () => (T | Reactor<T>), ...deps: Array<Reactor<T>>): Reactor<T>

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption, ...deps: Array<Reactor<T>>): void
export function createEffect<T>(reactorHandle: () => any, ...deps: Array<Reactor<T>>): void

export function createReactor<T>(initialValue: T): Reactor<T>

export function onMounted(handle: Function): void
export function onUnmounted(handle: Function): void

export const Fragment: Component<{}>
