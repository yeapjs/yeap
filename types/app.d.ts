import "./jsx"

export type SubscribeHandler<T> = (prev: T, next: T) => void

export type Component<T = object> = (props: ToReactive<T>, children: Array<JSX.Element>) => JSX.Element

// export type Reactor<T> = {
//   [K in keyof T]: Reactor<T[K]>
// } & {
//   (v?: T | ((v: T) => T)): T
//   subscribe(handler: SubscribeHandler<T>): void
// }

export type ToReactive<T = object> = {
  [K in keyof T]: Reactor<T[K]>
}
export type Reactor<T> = T & {
  (v?: T | ((v: T) => T)): T
  subscribe?(handler: SubscribeHandler<T>): void
}

export function createComputed<T>(reactorHandle: () => (T | Reactor<T>), ...deps: Array<Reactor<T>>): Reactor<T>

export function createReactor<T>(initialValue: T): Reactor<T>

export const Fragment: Component<{}>
