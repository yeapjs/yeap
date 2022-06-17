export type SubcribeHandler<T> = (prev: T, next: T) => void

export type Reactor<T> = T & {
  (v?: T | ((v: T) => T)): T
  subcribe(handler: SubcribeHandler<T>): void
}
