import { Reactive, Reactor, ReactorMetaData, ReadOnlyReactor, SubscribeHandler } from "../types/app"
import { createComputed } from "./app"
import { ARRAY_METHOD, FORCE_SYMBOL, OBSERVABLE_SYMBOL, READONLY_OBSERVABLE_SYMBOL, SEND_EVENT_SYMBOL } from "./constantes"
import { GLOBAL_CONTEXT, isDefined, isJSXElement, recordReactor } from "./helpers"
import { record, unwrap } from "./utils"

type SubscribeHandlers<T> = ((prev: T, next: T) => void) | [(prev: T, next: T) => void, any]

export class DeepObservable<T>  {
  [x: PropertyKey]: any

  [OBSERVABLE_SYMBOL] = true;
  [FORCE_SYMBOL]: any = undefined
  static isObservable(arg: any): arg is Reactive<unknown> {
    return !!arg?.[OBSERVABLE_SYMBOL]
  }

  get [READONLY_OBSERVABLE_SYMBOL]() {
    return this.#freeze
  }

  [SEND_EVENT_SYMBOL](event: string) {
    if (event === "delete_dom")
      this.#handlers = this.#handlers.filter((callback) => (Array.isArray(callback) ? callback[1] !== "dom_reconciler" : true))
    else if (event === "delete") this.#handlers = []
  }

  #proxy: Reactive<T>
  #freeze: boolean
  #once: boolean
  #value: any
  #handlers: Array<SubscribeHandlers<T>> = []
  #dependencies: Set<Reactive<any>> = new Set()
  constructor(value: T, parent?: DeepObservable<any> | null, freeze = false, once = false) {
    this.#freeze = freeze
    this.#once = once
    this.#value = value

    this.call = this.call.bind(this)
    this.copy = this.copy.bind(this)
    this.compute = this.compute.bind(this)
    this.freeze = this.freeze.bind(this)
    this.reader = this.reader.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.metadata = this.metadata.bind(this)
    this.when = this.when.bind(this)
    this[SEND_EVENT_SYMBOL] = this[SEND_EVENT_SYMBOL].bind(this)

    this.and = this.and.bind(this)
    this.or = this.or.bind(this)
    this.not = this.not.bind(this)
    this.nullish = this.nullish.bind(this)

    const properties: Record<PropertyKey, any> = {}

    this.#proxy = new Proxy(() => this.#value, {
      apply: (_, thisArg, argArray: [((v: T) => T) | T] | []) => {
        const value = this.#value
        if (DeepObservable.isObservable(value)) return value()
        if (value instanceof Function) {
          const [firstValue, recordedReactors] = record(() => value.apply(unwrap(thisArg), argArray))

          // CAST-SAFETY: DeepObservable is a Proxy to type Reactor 
          const reactive = new DeepObservable(firstValue) as unknown as Reactor<T>

          const subscribe = () => reactive(value.apply(unwrap(thisArg), argArray))

          if (parent) parent.subscribe(subscribe)
          if (GLOBAL_CONTEXT.yeapContext?.recordObserverValueMethod) recordedReactors.forEach((recordedReactor) => recordedReactor.subscribe(subscribe))

          return reactive.reader()
        }

        if (this.#freeze) {
          if (argArray.length > 0) throw new TypeError("Cannot assign to read only reactor")
          return value
        }

        if (argArray.length === 0) {
          recordReactor.push(this.#proxy)
          return value
        }

        if (argArray[0] instanceof Function && !DeepObservable.isObservable(argArray[0])) this.#value = argArray[0](value)
        else this.#value = unwrap(argArray[0])! as T

        if (this.#once) this.#freeze = true

        this.call(value, this.#value)
        return value
      },
      get: (_, p) => {
        if (p in properties) return properties[p]

        const value = this.#value?.[p]
        if (p in this && p !== "value" && ((["function", "boolean"].includes(typeof this[p]) && !ARRAY_METHOD.has(p)) || (Array.isArray(this.#value) && ARRAY_METHOD.has(p)))) {
          return this[p]
        }

        if (!isDefined(this.#value)) throw new TypeError(`Cannot read properties of ${this.#value} (reading '${p.toString()}')`)

        if (DeepObservable.isObservable(value)) return value

        try {
          if (!(p in this.#value)) return value
        } catch (e) {
          if (!value) return undefined
        }

        const descriptor = Object.getOwnPropertyDescriptor(this.#value, p)
        const freeze = this.#freeze || typeof this.#value !== "object" || !(descriptor?.writable ?? descriptor?.set)
        const reactive = new DeepObservable(value, value instanceof Function ? this : null, freeze)

        this.subscribe((_, curr: any) => {
          reactive[FORCE_SYMBOL] = curr?.[p]
        })
        if (reactive.metadata().settable) reactive.subscribe((_, curr) => {
          if (isDefined(this.#value)) {
            if (isDefined(curr)) this.#value[p] = curr
            else delete this.#value[p]
          }
        })

        properties[p] = reactive

        return reactive
      },
      set: (_, p, value) => {
        if (p === FORCE_SYMBOL) {
          const prev = this.#value
          this.#value = value
          this.call(prev, this.#value)
        }
        else if (!this.#freeze) {
          this.#value[p] = value
          if (p in properties) properties[p](value)
        }
        return true
      },
      deleteProperty: (_, p) => {
        if (delete this.#value?.[p]) {
          properties[p][SEND_EVENT_SYMBOL]("delete")
          delete properties[p]
          return true
        }
        return false
      },
    }) as any

    return this.#proxy as any
  }

  subscribe(handler: SubscribeHandler<T>, id?: any) {
    if (id) this.#handlers.push([handler, id])
    else this.#handlers.push(handler)
    return () => {
      this.#handlers = this.#handlers.filter((callback) => (Array.isArray(callback) ? callback[0] : callback) !== handler)
    }
  }

  call(prev: T, next: T) {
    this.#handlers.forEach((handle) => {
      if (Array.isArray(handle)) handle[0](prev, next)
      else handle(prev, next)
    })
  }

  copy() {
    return new DeepObservable(this.#value, null, false, false)
  }

  freeze() {
    const freezed = new DeepObservable(this.#value, null, true, false)
    freezed.metadata().dependencies = this.#dependencies

    return freezed
  }

  reader() {
    const observable = new DeepObservable(this.#value, null, true, false)
    this.subscribe((prev, curr) => {
      if (prev === curr) return

      observable[FORCE_SYMBOL] = curr
    })
    observable.metadata().dependencies = this.#dependencies

    return observable
  }

  compute<U>(handle: (value: T) => U): ReadOnlyReactor<U> {
    return createComputed(() => handle(this.#value), {}, this.#proxy)
  }

  when<U, F>(condition: (value: T) => boolean, truthy: U | (() => U), falsy?: F | (() => F)): ReadOnlyReactor<U | F> {
    if (!isDefined(falsy)) {
      falsy = truthy as any
      truthy = condition as any
      condition = (v: T) => !!v
    }

    return this.compute((v) => {
      return condition(v) ?
        truthy instanceof Function && !DeepObservable.isObservable(truthy) && !isJSXElement(truthy) ? truthy() : truthy as U :
        falsy instanceof Function && !DeepObservable.isObservable(falsy) && !isJSXElement(falsy) ? falsy() : falsy as F
    })
  }

  and<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U> {
    return this.compute((v) => v && (otherwise instanceof Function && !DeepObservable.isObservable(otherwise) && !isJSXElement(otherwise) ? otherwise() : otherwise as U))
  }

  or<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U> {
    return this.compute((v) => v || (otherwise instanceof Function && !DeepObservable.isObservable(otherwise) && !isJSXElement(otherwise) ? otherwise() : otherwise as U))
  }

  not(): ReadOnlyReactor<boolean> {
    return this.compute((v) => !v)
  }

  nullish<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U> {
    return this.compute((v) => v ?? (otherwise instanceof Function && !DeepObservable.isObservable(otherwise) && !isJSXElement(otherwise) ? otherwise() : otherwise as U))
  }

  metadata(): ReactorMetaData<T> {
    const self = this
    return {
      get settable() {
        return !self.#freeze
      },
      get value() {
        return self.value
      },
      get dependencies() {
        return self.#dependencies
      },
      set dependencies(value) {
        self.#dependencies = value
      }
    }
  }

  /// Array Method for iterate on an array without lost the reactivity on the item
  mapReactor<I extends T extends Array<infer I> ? I : never, U>(this: Reactive<Array<I>>, callbackfn: (value: Reactive<I>, index: number) => U) {
    return this.map((_, i) => callbackfn(this[i] as Reactive<I>, i))
  }

  /// Array Method Overwrite for allow the reactivity
  push<I extends T extends Array<infer I> ? I : never>(this: Reactive<Array<I>>, ...items: Array<I>): number {
    this((arr) => [...arr, ...items])
    return this.length
  }
  pop<I extends T extends Array<infer I> ? I : never>(this: Reactive<Array<I>>): Reactive<I> | undefined {
    let l = this.length()
    if (!l) return undefined

    const last = this[l - 1]
    this((arr) => arr.slice(0, l - 1))
    return last as Reactive<I>
  }

  unshift<I extends T extends Array<infer I> ? I : never>(this: Reactive<Array<I>>, ...items: Array<I>): number {
    this((arr) => [...items, ...arr])
    return this.length
  }
  shift<I extends T extends Array<infer I> ? I : never>(this: Reactive<Array<I>>): Reactive<I> | undefined {
    const first = this[0]
    this((arr) => arr.slice(1))
    return first as Reactive<I>
  }
}
