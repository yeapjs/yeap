import { AsyncComputedReturn, AsyncFunction, AsyncReturn, Context, CreateEffectOption, Reactive, Reactor, ReadOnlyReactor } from "../types/app"
import { DeepObservable } from "./Observable"
import { ComponentContext, getCurrentContext, getValue, isDefined } from "./utils"

export function createAsync<T, E>(fetcher: AsyncFunction<[], T>, defaultValue?: T): AsyncReturn<T, E> {
  const data = createReactor<T>(defaultValue)
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

export function createAsyncComputed<T, E>(fetcher: AsyncFunction<[], T>, defaultValue?: Reactive<T> | T, ...deps: Array<Reactive<T>>): AsyncComputedReturn<T, E> {
  if (isReactor(defaultValue)) {
    deps.push(defaultValue)
    defaultValue = undefined
  }
  const { data, error, loading, refetch } = createAsync<T, E>(fetcher, defaultValue)
  createEffect(refetch, { immediate: false }, ...deps)

  return { data, error, loading }
}

export function createComputed<T>(reactorHandle: () => (T | Reactive<T>), ...deps: Array<Reactive<T>>): ReadOnlyReactor<T> {
  const dependencies = new Set(deps)
  const initialValue = reactorHandle()
  if (isReactor(initialValue)) dependencies.add(initialValue as Reactive<T>)

  const reactor = createReactor(initialValue)

  const unsubscribes = Array.from(dependencies).map((dep) => dep.subscribe(() => {
    reactor(getValue(reactorHandle()))
  }))

  onUnmounted(() => {
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  })

  return reactor.reader()
}

export function createContext<T>(defaultValue?: T): Context<T> {
  const componentContext = getCurrentContext()
  const id = Symbol()
  const context: Context<T> = {
    id,
    defaultValue,
    Consumer({ }, children) {
      return children[0](useContext(context))
    },
    Provider({ value }, children) {
      const componentContext = getCurrentContext()

      componentContext.contexts[id] = {
        context: componentContext.contexts[id]?.context ?? null,
        provider: {
          id,
          value
        },
      }

      return children[0]()
    },
  }

  componentContext.contexts[id] = {
    provider: componentContext.contexts[id]?.provider ?? null,
    context
  }

  return context
}

export function createEffect<T>(reactorHandle: () => any, option: CreateEffectOption | Reactive<T>, ...deps: Array<Reactive<T>>): void {
  const observableOption = isReactor(option)
  const dependencies = new Set(deps)
  let first = true
  if (observableOption) dependencies.add(option as Reactive<T>)
  if (observableOption || (option as CreateEffectOption).immediate) {
    let initialValue = reactorHandle()
    if (isReactor(initialValue)) dependencies.add(initialValue as Reactive<T>)
    first = false
  }

  function subscriber() {
    const value = reactorHandle()
    if (first) {
      if (isReactor(value)) unsubscribes.push(value.subscribe(subscriber))
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
    return context.hooks[context.hookIndex++]
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

export function isReactor(arg: any): arg is Reactive<any> {
  return DeepObservable.isObservable(arg)
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

export function useContext<T>(context: Context<T>): T {
  let componentContext: ComponentContext | undefined = getCurrentContext()

  while (isDefined(componentContext?.contexts)) {
    if (isDefined(componentContext!.contexts[context.id]?.provider)) return componentContext!.contexts[context.id]!.provider!.value
    componentContext = componentContext!.parent
  }

  return context.defaultValue!
}
