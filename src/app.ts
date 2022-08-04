import { AsyncComputedReturn, AsyncFunction, AsyncReturn, Closer, Context, CreateComputedOption, CreateEffectOption, Function, Reactive, Reactor, ReadOnlyReactor, TransitionReturn } from "../types/app"
import { DeepObservable } from "./Observable"
import { cap, ComponentContext, getCurrentContext, getValue, isDefined } from "./utils"

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

export function createAsyncComputed<T, E, U>(fetcher: AsyncFunction<[], T, Closer>, defaultValue?: Reactive<U> | T, option?: CreateEffectOption | Reactive<U>, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E> {
  if (isReactor(defaultValue)) {
    deps.push(defaultValue)
    defaultValue = undefined
  }
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) deps.push(option as Reactive<any>)
    option = {
      immediate: true,
      observableInitialValue: true,
      unsubscription: true
    }
  }
  option = {
    immediate: true,
    observableInitialValue: true,
    unsubscription: true,
    ...option
  }

  const { data, error, loading, refetch } = createAsync<T, E>(fetcher, defaultValue)
  createEffect(refetch, option, ...deps)

  return { data, error, loading }
}

export function createComputed<T, U>(reactorHandle: Function<[], Reactive<T> | T, Closer>, option?: CreateComputedOption | Reactive<U>, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T> {
  const dependencies = new Set(deps)
  const handle = reactorHandle.bind({ close })
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) dependencies.add(option as Reactive<any>)
    option = {
      observableInitialValue: true,
      unsubscription: true
    }
  }
  option = {
    observableInitialValue: true,
    unsubscription: true,
    ...option
  }

  const initialValue = handle()
  if (isReactor(initialValue) && option!.observableInitialValue) dependencies.add(initialValue as Reactive<any>)

  const reactor = createReactor(initialValue)

  const unsubscribes = Array.from(dependencies).map((dep) => dep.subscribe(() => {
    reactor(getValue(handle())!)
  }))

  function close() {
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  if (option!.unsubscription) onUnmounted(close)

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
      const componentContext = getCurrentContext()?.parent ?? getCurrentContext()

      componentContext.contexts[id] = {
        context: componentContext.contexts[id]?.context ?? null,
        provider: {
          id,
          value
        },
      }

      return children
    },
  }

  componentContext.contexts[id] = {
    provider: componentContext.contexts[id]?.provider ?? null,
    context
  }

  return context
}

export function createEffect<T>(reactorHandle: Function<[], any, Closer>, option?: CreateEffectOption | Reactive<T>, ...deps: Array<Reactive<T>>): void {
  const dependencies = new Set(deps)
  const handle = reactorHandle.bind({ close })
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) dependencies.add(option as Reactive<T>)
    option = {
      immediate: true,
      observableInitialValue: true,
      unsubscription: true
    }
  }
  let first = true
  option = {
    immediate: true,
    observableInitialValue: true,
    unsubscription: true,
    ...option
  }

  function subscriber() {
    const value = handle()
    if (first) {
      if (isReactor(value) && (option as CreateComputedOption).observableInitialValue) unsubscribes.push(value.subscribe(subscriber))
      first = false
    }
  }

  if (option.immediate) subscriber()

  const unsubscribes = Array.from(dependencies).map((dep) => dep.subscribe(subscriber))

  function close() {
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  if (option!.unsubscription) onUnmounted(close)
}

export function createEventDispatcher(): Function<[name: string, detail: any]> {
  const context = getCurrentContext()

  // force if the persistent callbacks are set, pass the while loop
  if (context.hookIndex in context.hooks)
    return context.hooks[context.hookIndex++]

  let globalContext = context
  while (globalContext.parent) globalContext = globalContext.parent

  if (globalContext.element) return createPersistentCallback((name: string, detail: any) => {
    const event = new CustomEvent(name, { detail })
    globalContext.element!.dispatchEvent(event)
  })

  return createPersistentCallback((name: string, detail: any) => {
    const eventName = "on" + cap(name)
    if (context.props[eventName]) {
      const event = new CustomEvent(name, { detail })
      context.props[eventName](event)
    }
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

export function createPersistentCallback<T extends Function>(callback: T): T {
  return createPersistor(() => callback)
}

export function createPersistentReactor<T>(initialValue?: Reactive<T> | T) {
  return createPersistor(() => createReactor(initialValue))
}
export function createReactor<T>(initialValue?: Reactive<T> | T): Reactor<T> {
  return new DeepObservable(getValue(initialValue), null) as any
}

export function createRef<T>(initialValue?: Reactive<T> | T): Reactor<T> {
  return new DeepObservable(getValue(initialValue), null, false, true) as any
}

export function createTransition<T>(): TransitionReturn<T> {
  const isPending = createReactor(false)
  function startTransition(callback: Function) {
    isPending(true)
    setTimeout(() => {
      callback()
      isPending(false)
    }, 0)
  }
  return [
    isPending.reader(),
    startTransition
  ]
}

export function isReactor(arg: any): arg is Reactive<any> {
  return DeepObservable.isObservable(arg)
}

export function onMounted(handler: Function) {
  const first = createPersistentReactor(true)

  if (!first(false)) return

  const context = getCurrentContext()
  if (!isDefined(context.mounted)) context.mounted = [handler]
  else context.mounted!.push(handler)
}

export function onUnmounted(handler: Function) {
  const first = createPersistentReactor(true)

  if (!first(false)) return

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
