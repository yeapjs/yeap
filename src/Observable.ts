import { Function, Reactive, ReadOnlyReactor, SubscribeHandler } from "../types/app"
import { createComputed, isReactor, isReadOnlyReactor } from "./app"
import { FORCE_SYMBOL, OBSERVABLE_SYMBOL, READONLY_OBSERVABLE_SYMBOL } from "./constantes"
import { getValue, isArrayMethod, isDefined, isJSXElement, recordReactor } from "./helpers"

export class DeepObservable<T>  {
  [OBSERVABLE_SYMBOL] = true;
  [FORCE_SYMBOL]: any = undefined
  static isObservable(arg: any): arg is Reactive<any> {
    return !!arg?.[OBSERVABLE_SYMBOL]
  }
  static isReadOnly(arg: any): arg is ReadOnlyReactor<any> {
    return !!arg?.[READONLY_OBSERVABLE_SYMBOL]
  }

  get [READONLY_OBSERVABLE_SYMBOL]() {
    return this.#freeze
  }

  #freeze: boolean
  #once: boolean
  #handlers: Array<SubscribeHandler<T>> = []
  constructor(public value: T, parent?: DeepObservable<any> | null, freeze = false, once = false) {
    this.#freeze = freeze
    this.#once = once

    this.call = this.call.bind(this)
    this.copy = this.copy.bind(this)
    this.compute = this.compute.bind(this)
    this.freeze = this.freeze.bind(this)
    this.reader = this.reader.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.when = this.when.bind(this)

    const properties: Record<PropertyKey, any> = {}

    const proxy = new Proxy(() => this.value, {
      apply: (_, thisArg, argArray: [((v: T) => T) | T] | []) => {
        const value = this.value
        if (isReactor(value)) return value
        if (typeof value === "function") {
          const reactive: any = new DeepObservable(value.apply(getValue(thisArg), argArray))

          if (parent) parent.subscribe(() => {
            reactive(value.apply(getValue(thisArg), argArray))
          })

          return reactive.reader()
        }

        if (this.#freeze) {
          if (argArray.length > 0) throw new TypeError("Cannot assign to read only reactor");
          return value
        }

        if (argArray.length === 0) {
          recordReactor.push(this as any)
          return value
        }

        if (typeof argArray[0] === "function" && !isReactor(argArray[0])) this.value = (argArray[0] as Function)(value)
        else this.value = getValue(argArray[0])!

        if (this.#once) this.#freeze = true

        this.call(value, this.value)
        return value
      },
      get: (_, p) => {
        if (p in properties) return properties[p]

        const value = (this.value as any)?.[p]
        if (p in this && p !== "value" && ((["function", "boolean"].includes(typeof (this as any)[p]) && !isArrayMethod(p as string)) || (Array.isArray(this.value) && isArrayMethod(p as string)))) {
          return (this as any)[p]
        }

        if (!isDefined(this.value)) throw new TypeError(`Cannot read properties of ${this.value} (reading '${p.toString()}')`)

        if (isReactor(value)) return value

        if (!Object.hasOwn(this.value as any, p)) return value

        const descriptor = Object.getOwnPropertyDescriptor(this.value, p)
        const freeze = this.#freeze || typeof this.value !== "object" || !(descriptor?.writable ?? descriptor?.set)
        const reactive = new DeepObservable(value, typeof value === "function" ? this : null, freeze)

        this.subscribe((_, curr: any) => {
          reactive[FORCE_SYMBOL] = curr?.[p]
        })
        if (!isReadOnlyReactor(reactive)) reactive.subscribe((_, curr) => {
          if (isDefined(this.value)) {
            if (isDefined(curr)) (this.value as any)[p] = curr
            else delete (this.value as any)[p]
          }
        })

        properties[p] = reactive

        return reactive
      },
      set: (_, p, value) => {
        if (p === FORCE_SYMBOL) {
          const prev = this.value
          this.value = value
          this.call(prev, this.value)
        }
        else if (!this.#freeze) {
          (this.value as any)[p] = value
          if (p in properties) properties[p](value)
        }
        return true
      },
      deleteProperty: (_, p) => {
        if (delete (this.value as any)?.[p]) {
          delete properties[p]
          return true
        }
        return false
      },
    })

    return proxy as any
  }

  subscribe(handler: SubscribeHandler<T>) {
    this.#handlers.push(handler)
    return () => {
      this.#handlers = this.#handlers.filter((callback) => callback !== handler)
    }
  }

  call(prev: T, next: T) {
    this.#handlers.forEach((handle) => handle(prev, next))
  }

  copy() {
    return new DeepObservable(this.value, null, false, false)
  }

  freeze() {
    return new DeepObservable(this.value, null, true, false)
  }

  reader() {
    const observable = new DeepObservable(this.value, null, true, false)
    this.subscribe((prev, curr) => {
      if (prev === curr) return

      observable[FORCE_SYMBOL] = curr
    })
    return observable
  }

  compute<U>(handle: Function<[T], U>) {
    return createComputed(() => handle(this.value), { observableInitialValue: false }, this as any)
  }

  when<U, F>(condition: Function<[T], boolean>, truthy: U | Function<[], U>, falsy?: F | Function<[], F>): ReadOnlyReactor<any> {
    if (!isDefined(falsy)) {
      falsy = truthy as any
      truthy = condition as any
      condition = (v: T) => !!v
    }

    return this.compute((v) => {
      return condition(v) ?
        typeof truthy === "function" && !isReactor(truthy) && !isJSXElement(truthy) ? (truthy as Function)() : truthy :
        typeof falsy === "function" && !isReactor(falsy) && !isJSXElement(falsy) ? (falsy as Function)() : falsy
    })
  }

  /// Array Method for iterate on an array without lost the reactivity on the item
  mapReactor<I extends T extends Array<infer I> ? I : never, U>(this: Reactive<Array<I>>, callbackfn: (value: Reactive<I>, index: number) => U) {
    return this.map((_, i) => callbackfn((this as any)[i], i))
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
    return last as any
  }

  unshift<I extends T extends Array<infer I> ? I : never>(this: Reactive<Array<I>>, ...items: Array<I>): number {
    this((arr) => [...items, ...arr])
    return this.length
  }
  shift<I extends T extends Array<infer I> ? I : never>(this: Reactive<Array<I>>): Reactive<I> | undefined {
    const first = this[0]
    this((arr) => arr.slice(1))
    return first as any
  }
}
