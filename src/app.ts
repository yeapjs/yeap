import { Children, Component, Reactor } from "../types/global"
import { DeepObservable } from "./Observable"

function getValue<T>(a: T | Reactor<T>): T {
  if (DeepObservable.isObservable(a)) return (a as Reactor<T>)()
  return a as T
}

export function createComputed<T>(reactorHandle: () => (T | Reactor<T>), ...deps: Array<Reactor<T>>): Reactor<T> {
  let initialValue = reactorHandle()
  if (DeepObservable.isObservable(initialValue)) deps = [initialValue as Reactor<T>, ...deps]

  const reactor = createReactor(getValue(initialValue))

  for (const dep of deps) {
    dep.subscribe(() => {
      reactor(getValue(reactorHandle()))
    })
  }

  return reactor
}

export function createReactor<T>(initialValue: T): Reactor<T> {
  return new DeepObservable(initialValue, null) as any
}

export const Fragment: Component<{}> = (_, children) => {
  return children
}
