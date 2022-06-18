export type SubscribeHandler<T> = (prev: T, next: T) => void

export type Reactor<T> = T & {
  (v?: T | ((v: T) => T)): T
  subscribe(handler: SubscribeHandler<T>): void
}

export type ReccursiveArray<T> = Array<T | ReccursiveArray<T>>
export type HTMLContainer = Array<HTMLElement | Text>
