import { AsyncComputedReturn, AsyncFunction, AsyncReturn, CreateEffectOption, Reactive, Reactor, ReadOnlyReactor } from "../types/app"
import { DeepObservable } from "./Observable"
import { getCurrentContext, getValue, isDefined } from "./utils"

export function createAsync<T, E>(fetcher: AsyncFunction<[], T>): AsyncReturn<T, E> {
  const data = createReactor<T>()
  const error = createReactor<E | null>(null)
  const loading = createReactor(false)

  function refetch() {
    loading(true)
    Promise.all([fetcher()])
      .then(([result]) => {
        data(result)
        if (error() !== null) error(null)
      })
      .catch(error)
      .finally(() => loading(false))
  }

  refetch()

  return {
    data: data.reader(),
    error: error.reader(),
    loading: loading.reader(),
    refetch
  }
}

export function createAsyncComputed<T, E>(fetcher: AsyncFunction<[], T>, ...deps: Array<Reactive<T>>): AsyncComputedReturn<T, E> {
  const { data, error, loading, refetch } = createAsync<T, E>(fetcher)
  createEffect(refetch, { immediate: false }, ...deps)

  return { data, error, loading }
}

export function createComputed<T>(reactorHandle: () => (T | Reactive<T>), ...deps: Array<Reactive<T>>): ReadOnlyReactor<T> {
  const dependencies = new Set(deps)
  const initialValue = reactorHandle()
  if (DeepObservable.isObservable(initialValue)) dependencies.add(initialValue as Reactive<T>)

  const reactor = createReactor(initialValue)

  const unsubscribes = Array.from(dependencies).map((dep) => dep.subscribe(() => {
    reactor(getValue(reactorHandle()))
  }))

  onUnmounted(() => {
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  })

  return reactor.reader()
}

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption | Reactive<T>, ...deps: Array<Reactive<T>>): void {
  const observableOption = DeepObservable.isObservable(option)
  const dependencies = new Set(deps)
  let first = true
  if (observableOption) dependencies.add(option as Reactive<T>)
  if (observableOption || (option as CreateEffectOption).immediate) {
    let initialValue = reactorHandle()
    if (DeepObservable.isObservable(initialValue)) dependencies.add(initialValue as Reactive<T>)
    first = false
  }

  function subscriber() {
    const value = reactorHandle()
    if (first) {
      if (DeepObservable.isObservable(value)) unsubscribes.push(value.subscribe(subscriber))
      first = false
    }
  }

  const unsubscribes = Array.from(dependencies).map((dep) => dep.subscribe(subscriber))

  onUnmounted(() => {
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  })
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

export function createPersistentReactor<T>(initialValue?: Reactive<T> | T) {
  return createPersistor(() => createReactor(initialValue))
}
export function createReactor<T>(initialValue?: Reactive<T> | T): Reactor<T> {
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
