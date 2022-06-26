import { CreateEffectOption, Reactor } from "../types/app"
import { DeepObservable } from "./Observable"
import { getCurrentContext, getValue, isDefined } from "./utils"

export function createComputed<T>(reactorHandle: () => (T | Reactor<T>), ...deps: Array<Reactor<T>>): Reactor<T> {
  const dependencies = new Set(deps)
  const initialValue = reactorHandle()
  if (DeepObservable.isObservable(initialValue)) dependencies.add(initialValue as Reactor<T>)

  const reactor = createReactor(initialValue)

  for (const dep of deps) {
    dep.subscribe!(() => {
      reactor(getValue(reactorHandle()))
    })
  }

  return reactor
}

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption | Reactor<T>, ...deps: Array<Reactor<T>>): void {
  const observableOption = DeepObservable.isObservable(option)
  const dependencies = new Set(deps)
  let first = true
  if (observableOption) dependencies.add(option as Reactor<T>)
  if (observableOption || (option as CreateEffectOption).immediate) {
    let initialValue = reactorHandle()
    if (DeepObservable.isObservable(initialValue)) dependencies.add(initialValue as Reactor<T>)
    first = false
  }

  for (const dep of deps) {
    dep.subscribe!(() => {
      const value = reactorHandle()
      if (first) {
        if (DeepObservable.isObservable(value)) dependencies.add(value)
        first = false
      }
    })
  }
}

export function createPersistor<T>(handle: () => T): T {
  const context = getCurrentContext()
  if (context.hookIndex in context.hooks) {
    return context.hooks[context.hookIndex]
  }

  const value = handle()

  context.hooks.push(value)
  context.hookIndex++

  return value
}

export function createReactor<T>(initialValue: T | Reactor<T>): Reactor<T> {
  return new DeepObservable(getValue(initialValue), null) as any
}

export function onMounted(handler: Function) {
  const context = getCurrentContext()
  if (!isDefined(context.mounted)) context.mounted = [handler]
  else context.mounted!.push(handler)
}

export function onUnmounted(handler: Function) {
  const context = getCurrentContext()
  if (!isDefined(context.unmounted)) context.unmounted = [handler]
  else context.unmounted!.push(handler)
}
