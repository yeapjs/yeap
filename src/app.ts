import { Component, CreateEffectOption, Reactor } from "../types/app"
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
    dep.subscribe!(() => {
      reactor(getValue(reactorHandle()))
    })
  }

  return reactor
}

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption | Reactor<T>, ...deps: Array<Reactor<T>>): void {
  const observableOption = DeepObservable.isObservable(option)
  let first = true;
  if (observableOption) deps = [option as Reactor<T>, ...deps]
  if (observableOption || (option as CreateEffectOption).immediate) {
    let initialValue = reactorHandle()
    if (DeepObservable.isObservable(initialValue)) deps = [initialValue as Reactor<T>, ...deps]
    first = false
  }

  for (const dep of deps) {
    dep.subscribe!(() => {
      if (first) {
        let value = reactorHandle()
        if (DeepObservable.isObservable(value)) deps = [value, ...deps]
        first = false
      } else reactorHandle()
    })
  }
}

export function createReactor<T>(initialValue: T): Reactor<T> {
  return new DeepObservable(initialValue, null) as any
}

export const Fragment: Component<{}> = (_, children) => {
  return children
}
