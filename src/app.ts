import { AsyncComputedReturn, AsyncFunction, AsyncReturn, Closer, Context, CreateComputedOption, CreateEffectOption, Function, Reactive, Reactor, ReadOnlyReactor, TransitionReturn } from "../types/app"
import { NULL } from "./constantes"
import { DeepObservable } from "./Observable"
import { next } from "./runtimeLoop"
import { batch, cap, ComponentContext, getCurrentContext, getRecordReactor, getValue, GLOBAL_CONTEXT, isDefined, resetRecordReactor } from "./utils"

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

export function createComputed<T, U>(reactorHandle: Function<[], Reactive<T> | T, Closer>, option?: CreateComputedOption | Reactive<U>, ...deps: Array<Reactive<U>>): ReadOnlyReactor<T> {
  const dependencies = new Set(deps)
  const updates = new Map<Reactive<U>, { prev: U | NULL, curr: U | NULL }>()
  const handle = reactorHandle.bind({ close })
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) dependencies.add(option as any)
    option = {
      observableInitialValue: false,
      unsubscription: true
    }
  }
  const optionWithDefault = {
    observableInitialValue: false,
    unsubscription: true,
    ...option
  }

  resetRecordReactor()
  const initialValue = handle()
  getRecordReactor()?.forEach((v) => dependencies.add(v as Reactive<U>))
  if (isReactor(initialValue) && optionWithDefault.observableInitialValue) dependencies.add(initialValue as any)

  const reactor = createReactor(initialValue)

  const callback = batch(() => {
    let update = false
    for (const v of updates.values()) {
      if (v.prev == NULL) continue
      update = update || v.prev !== v.curr
      v.prev = NULL
    }

    if (update) reactor(getValue(handle())!)
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

export function createDirective<T, E extends HTMLElement = HTMLElement>(name: string, callback: Function<[E, T]>) {
  GLOBAL_CONTEXT.directives!.set(name, callback)
}

export function createEffect<T>(reactorHandle: Function<[], any, Closer>, option?: CreateEffectOption | Reactive<T>, ...deps: Array<Reactive<T>>): void {
  const dependencies = new Set(deps)
  const updates = new Map<Reactive<T>, { prev: T | NULL, curr: T | NULL }>()
  const handle = reactorHandle.bind({ close })
  if (isReactor(option) || !isDefined(option)) {
    if (isDefined(option)) dependencies.add(option as Reactive<T>)
    option = {
      immediate: true,
      observableInitialValue: false,
      unsubscription: true
    }
  }
  let first = true
  const optionWithDefault = {
    immediate: true,
    observableInitialValue: false,
    unsubscription: true,
    ...option
  }

  function subscriber() {
    if (first) {
      const value = handle()
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

  if (optionWithDefault.immediate) subscriber()

  const callback = batch(subscriber)
  const unsubscribes = Array.from(dependencies).map((dep) => {
    const value: { prev: T | NULL, curr: T | NULL } = { prev: NULL, curr: NULL }
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

export function createEventModifier(name: string, callback: Function<[Event]> | AddEventListenerOptions) {
  GLOBAL_CONTEXT.modifiers!.set(name, callback)
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
export function createReactor<T>(initialValue?: Reactive<T> | Function<[], T> | T): Reactor<T> {
  if (typeof initialValue === "function") initialValue = (initialValue as Function)()

  return new DeepObservable(getValue(initialValue)) as any
}

export function createRef<T>(initialValue?: Reactive<T> | Function<[], T> | T): Reactor<T> {
  if (typeof initialValue === "function") initialValue = (initialValue as Function)()

  return new DeepObservable(getValue(initialValue), null, false, true) as any
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
export function isReadOnlyReactor(arg: any): arg is ReadOnlyReactor<any> {
  return DeepObservable.isReadOnly(arg)
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

// init default event modifier
createDirective<Reactor<string>, HTMLInputElement | HTMLTextAreaElement>("model", (el, reactor) => {
  el.value = reactor()
  el.addEventListener("input", (e) => reactor(el.value))
})

createEventModifier("prevent", (e) => {
  e.preventDefault()
})

createEventModifier("stop", (e) => {
  e.stopPropagation()
})

createEventModifier("capture", {
  capture: true
})

createEventModifier("once", {
  once: true
})

createEventModifier("passive", {
  passive: true
})
