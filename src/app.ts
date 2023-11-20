import { AsyncComputedReturn, AsyncReturn, Context, CreateComputedOption, CreateEffectOption, Reactive, Reactor, ReadOnlyReactor, TransitionReturn } from "../types/app"
import { NULL } from "./constantes"
import { DeepObservable } from "./Observable"
import { next } from "./runtime"
import { batch, cap, directives, getCurrentInternalContext, isDefined, modifiers } from "./helpers"
import { autoid, record, unwrap } from "./utils"
import { InternalContext } from "./types"

export function createAsync<T, E, A extends Array<unknown>>(fetcher: (...args: A) => Promise<T>, defaultValue?: T): AsyncReturn<T, E> {
  const data = createReactor<T>(defaultValue)
  const error = createReactor<E | null>(null)
  const loading = createReactor(false)

  function refetch(...args: A) {
    loading(true)
    Promise.all([fetcher(...args)])
      .then(([result]) => {
        data(result)
        if (error() !== null) error(null)
      })
      .catch(error)
      .finally(() => loading(false))
  }

  refetch.apply(undefined)

  return {
    data: data.reader(),
    error: error.reader(),
    loading: loading.reader(),
    refetch
  }
}

export function createAsyncComputed<T, E, U>(fetcher: () => Promise<T>, defaultValue?: Reactive<U> | T, optionOrDependency?: CreateEffectOption | Reactive<U>, ...dependencies: Array<Reactive<U>>): AsyncComputedReturn<T, E> {
  if (isReactor(defaultValue)) {
    dependencies.push(defaultValue)
    defaultValue = undefined
  }

  const { data, error, loading, refetch } = createAsync<T, E, []>(fetcher, defaultValue)
  createEffect(refetch, optionOrDependency, ...dependencies)

  return { data, error, loading }
}

export function createComputed<T, U>(handle: () => T, optionOrDependency?: CreateComputedOption | Reactive<U>, ...dependencies: Array<Reactive<U>>): ReadOnlyReactor<T> {
  const updates = new Map<Reactive<U>, { prev: U | NULL, curr: U | NULL }>()

  const option = (() => {
    const defaultOption = {
      unsubscription: true,
      record: true
    }

    if (isReactor(optionOrDependency)) {
      dependencies.push(optionOrDependency)
      return defaultOption
    }

    return {
      ...defaultOption,
      ...optionOrDependency
    }
  })()

  const initialValue: T = (() => {
    if (option.record) {
      const [value, recordedReactors] = record(handle)
      recordedReactors.forEach((v) => dependencies.push(v))
      return value
    }
    return handle()
  })()

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

  if (option.unsubscription) onUnmounted(close)

  reactor.metadata().dependencies = new Set(dependencies)
  return reactor.reader()
}

export function createContext<T>(defaultValue?: T): Context<T> {
  const internalContext = getCurrentInternalContext()
  const id = Symbol("context")
  const context: Context<T> = {
    id,
    defaultValue,
    Consumer({ }, children) {
      return children[0](useContext(context))
    },
    Provider({ value }, children) {
      const internalContext = getCurrentInternalContext()?.parent ?? getCurrentInternalContext()

      internalContext.contexts[id] = {
        context: internalContext.contexts[id]?.context ?? null,
        provider: {
          id,
          value
        },
      }

      return children
    },
  }

  internalContext.contexts[id] = {
    provider: internalContext.contexts[id]?.provider ?? null,
    context
  }

  return context
}

export function createDirective<T, E extends HTMLElement = HTMLElement>(name: string, callback: ((el: E, value: T) => any)) {
  directives.set(name, callback)
}

const effectId = autoid()
const effectCloseCallbacks = new Map<number, Array<() => void>>()
export function createEffect<T>(handle: () => void, optionOrDependency?: CreateEffectOption | Reactive<T>, ...dependencies: Array<Reactive<T>>): number {
  const id = effectId()

  const updates = new Map<Reactive<T>, { prev: T | NULL, curr: T | NULL }>()
  const option = (() => {
    const defaultOption = {
      immediate: true,
      unsubscription: true,
      record: false
    }

    if (isReactor(optionOrDependency)) {
      dependencies.push(optionOrDependency)
      return defaultOption
    }

    return {
      ...defaultOption,
      ...optionOrDependency
    }
  })()

  let first = true

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
      if (option.record) {
        const [, recordedReactors] = record(handle)
        recordedReactors.forEach((v: Reactive<T>) => {
          unsubscribes.push(sub(v))
        })
      } else handle()
      first = false
      return
    }

    const callbacks = effectCloseCallbacks.get(id)
    if (isDefined(callbacks)) callbacks.forEach((callback) => callback())

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

  if (option.immediate) subscriber()

  function close() {
    const callbacks = effectCloseCallbacks.get(id)
    if (isDefined(callbacks)) callbacks.forEach((callback) => callback())
    updates.clear()
    unsubscribes.forEach((unsubscribe) => unsubscribe())
  }

  if (option.unsubscription) onUnmounted(close)

  return id
}

export function cleanupEffect(effectId: number, callback: () => void) {
  if (!effectCloseCallbacks.has(effectId)) {
    effectCloseCallbacks.set(effectId, [callback])
    return
  }
  const callbacks = effectCloseCallbacks.get(effectId)!
  callbacks.push(callback)
}

export function createEventDispatcher<D>(): (name: string, detail: D) => void {
  const context = getCurrentInternalContext()

  // force if the persistent callbacks are set, pass the while loop
  if (context.hookIndex in context.hooks)
    return context.hooks[context.hookIndex++]

  let globalContext = context
  while (globalContext.parent) globalContext = globalContext.parent

  const el = globalContext.element
  if (el) return createPersistentCallback((name: string, detail: D) => {
    const event = new CustomEvent(name, { detail })
    el.dispatchEvent(event)
  })

  return createPersistentCallback((name: string, detail: D) => {
    const eventName = "on" + cap(name)
    if (context.moduleContext.props[eventName]) {
      const event = new CustomEvent(name, { detail })
      context.moduleContext.props[eventName](event)
    }
  })
}

export function createEventModifier(name: string, callback: ((e: Event) => void) | AddEventListenerOptions) {
  modifiers.set(name, callback)
}

export function createPersistor<T>(handle: () => T): T {
  const context = getCurrentInternalContext()
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

export function createPersistentReactor<T>(initialValue?: T) {
  return createPersistor(() => createReactor(initialValue))
}
export function createReactor<T>(initialValue?: (() => T) | T): Reactor<T> {
  // CAST-SAFETY: DeepObservable is a Proxy to type Reactor 
  return new DeepObservable(unwrap(initialValue)) as unknown as Reactor<T>
}

export function createRef<T>(initialValue?: (() => T) | T): Reactor<T> {
  // CAST-SAFETY: DeepObservable is a Proxy to type Reactor 
  return new DeepObservable(unwrap(initialValue), null, false, true) as unknown as Reactor<T>
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

export function isReactor(arg: unknown): arg is Reactive<unknown> {
  return DeepObservable.isObservable(arg)
}

export function isReadOnlyReactor<T>(arg: Reactive<T> | DeepObservable<T>): arg is ReadOnlyReactor<T> {
  return !arg.metadata().settable
}

export function onMounted(handler: Function) {
  const first = createPersistentReactor(true)

  if (!first(false)) return

  const context = getCurrentInternalContext()
  context.events.push("mounted", handler)
}

export function onUnmounted(handler: Function) {
  const first = createPersistentReactor(true)

  if (!first(false)) return

  const context = getCurrentInternalContext()
  context.events.push("unmounted", handler)
}

export function useContext<T>(context: Context<T>): T {
  let internalContext: InternalContext | undefined = getCurrentInternalContext()

  while (isDefined(internalContext) && isDefined(internalContext.contexts)) {
    if (isDefined(internalContext.contexts[context.id]?.provider)) return internalContext.contexts[context.id].provider!.value
    internalContext = internalContext.parent
  }

  return context.defaultValue!
}
