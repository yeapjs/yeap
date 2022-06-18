export type SubscribeHandler<T> = (prev: T, next: T) => void

export type Reactor<T> = {
  [K in keyof T]: Reactor<T[K]>
} & {
  (v?: T | ((v: T) => T)): T
  subscribe(handler: SubscribeHandler<T>): void
}

export type ReccursiveArray<T> = Array<T | ReccursiveArray<T>>
export type HTMLContainer = Array<HTMLElement | Text>
export type Children = ReccursiveArray<HTMLElement | Reactor<any> | any>
export type Component<T = object> = (props: Reactor<T>, children: Children) => HTMLElement | Text | ReccursiveArray<HTMLElement | Text | any> | any
