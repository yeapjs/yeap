import { AsyncComputedReturn, AsyncReturn, Closer, Context, CreateComputedOption, CreateEffectOption, Reactive, Reactor, ReadOnlyReactor, TransitionReturn } from "../types/app"
import { NULL } from "./constantes"
import { DeepObservable } from "./Observable"
import { next } from "./runtimeLoop"
import { batch, cap, directives, getCurrentContext, isDefined, modifiers } from "./helpers"
import { record } from "./utils"
import { ComponentContext } from "./types"

export function createAsync<T, E>(fetcher: () => Promise<T>, defaultValue?: T): AsyncReturn<T, E> {
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

export function createAsyncComputed<T, E, U>(fetcher: (this: Closer) => Promise<T>, defaultValue?: Reactive<U> | T, option?: CreateEffectOption | Reactive<U>, ...deps: Array<Reactive<U>>): AsyncComputedReturn<T, E> {
  if (isReactor(defaultValue)) {
    deps.push(defaultValue)
    defaultValue = undefined
  }
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) deps.push(option as any)
    option = {
      immediate: true,
      observableInitialValue: false,
      unsubscription: true
    }
  }
  option = {
    immediate: true,
    observableInitialValue: false,
    unsubscription: true,
    ...option
  }

  const { data, error, loading, refetch } = createAsync<T, E>(fetcher, defaultValue as T)
  createEffect(refetch, option, ...deps)

  return { data, error, loading }
}

export function createComputed<T, U>(reactorHandle: (this: Closer) => Reactive<T> | T, option?: CreateComputedOption | Reactive<U>, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T> {
  const dependencies = new Set(deps)
  const updates = new Map<Reactive<U>, { prev: U | NULL, curr: U | NULL }>()
  const handle = reactorHandle.bind({ close })
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) dependencies.add(option as any)
    option = {
      observableInitialValue: false,
      unsubscription: true,
      record: true
    }
  }
  const optionWithDefault = {
    observableInitialValue: false,
    unsubscription: true,
    record: true,
    ...option
  }

  const [initialValue, recordedReactors] = record(handle)
  if (optionWithDefault.record) recordedReactors.forEach((v) => dependencies.add(v as Reactive<U>))
  if (isReactor(initialValue) && optionWithDefault.observableInitialValue) dependencies.add(initialValue as any)

  const reactor = createReactor(initialValue)

  const callback = batch(() => {
    let update = false
    for (const v of updates.values()) {
      if (v.prev == NULL) continue
      update = update || v.prev !== v.curr
      v.prev = NULL
    }

    if (update) reactor(handle())
  })
  const unsubscribes = Array.from(dependencies).map((dep) => {
    const value: { prev: U | NULL, curr: U | NULL } = { prev: NULL, curr: NULL }
    updates.set(dep, value)
    return dep.subscribe((prev, curr) => {
      if (value.prev == NULL) value.prev = prev
      value.curr = curr
      callback()
    })
  })

  function close() {
    updates.clear()
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  if (optionWithDefault.unsubscription) onUnmounted(close)

  reactor.metadata().dependencies = dependencies
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

export function createDirective<T, E extends HTMLElement = HTMLElement>(name: string, callback: ((el: E, value: T) => any)) {
  directives.set(name, callback)
}

export function createEffect<T>(reactorHandle: (this: Closer) => void, option?: CreateEffectOption | Reactive<T>, ...deps: Array<Reactive<T>>): void {
  const dependencies = new Set(deps)
  const updates = new Map<Reactive<T>, { prev: T | NULL, curr: T | NULL }>()
  const handle = reactorHandle.bind({ close })
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) dependencies.add(option as Reactive<T>)
    option = {
      immediate: true,
      observableInitialValue: false,
      unsubscription: true,
      record: false
    }
  }
  let first = true
  const optionWithDefault = {
    immediate: true,
    observableInitialValue: false,
    unsubscription: true,
    record: false,
    ...option
  }

  function sub(dep: Reactive<T>) {
    const value: { prev: T | NULL, curr: T | NULL } = { prev: NULL, curr: NULL }
    updates.set(dep, value)
    return dep.subscribe((prev, curr) => {
      if (value.prev == NULL) value.prev = prev
      value.curr = curr
      callback()
    })
  }

  function subscriber() {
    if (first) {
      const [value, recordedReactors] = record(handle)
      if (optionWithDefault.record) recordedReactors.forEach((v: Reactive<T>) => {
        unsubscribes.push(sub(v))
      })
      if (isReactor(value) && optionWithDefault.observableInitialValue) unsubscribes.push(value.subscribe(subscriber))
      first = false
      return
    }

    let update = false
    for (const v of updates.values()) {
      if (v.prev == NULL) continue
      update = update || v.prev !== v.curr
      v.prev = NULL
    }

    if (update) handle()
  }

  const callback = batch(subscriber)
  const unsubscribes = Array.from(dependencies).map(sub)

  if (optionWithDefault.immediate) subscriber()

  function close() {
    updates.clear()
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  if (optionWithDefault.unsubscription) onUnmounted(close)
}

export function createEventDispatcher(): (name: string, detail: any) => void {
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

export function createEventModifier(name: string, callback: ((e: Event) => void) | AddEventListenerOptions) {
  modifiers.set(name, callback)
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
export function createReactor<T>(initialValue?: Reactive<T> | (() => T) | T): Reactor<T> {
  if (initialValue instanceof Function && !isReactor(initialValue)) initialValue = initialValue()

  return new DeepObservable(initialValue) as any
}

export function createRef<T>(initialValue?: Reactive<T> | (() => T) | T): Reactor<T> {
  if (initialValue instanceof Function && !isReactor(initialValue)) initialValue = initialValue()

  return new DeepObservable(initialValue, null, false, true) as any
}

export function createTransition(): TransitionReturn {
  const isPending = createReactor(false)
  function startTransition(callback: Function) {
    isPending(true)
    next().then(() => {
      callback()
      isPending(false)
    })
  }
  return [
    isPending.reader(),
    startTransition
  ]
}

export function isReactor(arg: any): arg is Reactive<any> {
  return DeepObservable.isObservable(arg)
}
export function isReadOnlyReactor<T>(arg: Reactive<T> | DeepObservable<T>): arg is ReadOnlyReactor<T> {
  return !arg.metadata().settable
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
