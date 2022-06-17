export type SubscribeHandler<T> = (prev: T, next: T) => void

export type Reactor<T> = T & {
  (v?: T | ((v: T) => T)): T
  subscribe(handler: SubscribeHandler<T>): void
}
