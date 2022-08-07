import { Function, Reactive, SubscribeHandler } from "../types/app"
import { createComputed, isReactor } from "./app"
import { FORCE_SYMBOL, OBSERVABLE_SYMBOL } from "./constantes"
import { getValue, isDefined, isJSXElement } from "./utils"

export class DeepObservable<T> {
  static isObservable(arg: any): arg is Reactive<any> {
    return !!arg?.[OBSERVABLE_SYMBOL]
  }

  [OBSERVABLE_SYMBOL] = true
  #freeze: boolean
  #once: boolean
  #parent: DeepObservable<T> | null
  #handlers: Array<SubscribeHandler<T>> = []
  constructor(public value: T, parent: DeepObservable<T> | null = null, freeze = false, once = false) {
    this.#freeze = freeze
    this.#once = once
    this.#parent = parent
    if (this.#parent) this.#handlers = this.#parent.#handlers

    this.call = this.call.bind(this)
    this.compute = this.compute.bind(this)
    this.freeze = this.freeze.bind(this)
    this.reader = this.reader.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.when = this.when.bind(this)

    return new Proxy(() => this.value, {
      apply: (_, thisArg, argArray: [((v: T) => T) | T] | []) => {
        const value = this.value
        if (isReactor(value)) return value
        if (typeof value === "function")
          return createComputed(() => value.apply(getValue(thisArg), argArray), { unsubscription: false }, this as any)
        if (this.#freeze || argArray.length === 0) return value

        if (typeof argArray[0] === "function" && !isReactor(argArray[0])) this.value = (argArray[0] as Function)(value)
        else this.value = getValue(argArray[0])

        if (this.#once) this.#freeze = true

        this.call(value, this.value)
        return value
      },
      get: (_, p) => {
        const value = (this.value as any)?.[p]
        if (p in this && p !== "value" && ["function", "boolean"].includes(typeof (this as any)[p])) {
          return (this as any)[p]
        } else if (isDefined(value)) {
          if (isReactor(value)) return value
          const reactive = new DeepObservable(value, parent ?? this, this.#freeze)
          if (!this.#freeze) reactive.subscribe((_, curr) => {
            if (this.value === curr) return

            (this.value as any)[p] = curr
            this.call(this.value, this.value)
          })
          return reactive
        } else if (value === null) return null
        return undefined
      },
      set: (_, p, value) => {
        if (p === FORCE_SYMBOL) this.value = value
        else if (!this.#freeze) {
          const prev = (this.value as any)[p];
          (this.value as any)[p] = value
          this.call(prev, value)
        }
        return true
      },
    }) as any
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

  freeze() {
    return new DeepObservable(this.value, this.#parent ?? this, true, false)
  }

  reader() {
    const observable = new DeepObservable(this.value, this.#parent ?? this, true, false)
    this.subscribe((prev, curr) => {
      if (prev === curr) return

      (observable as any)[FORCE_SYMBOL] = curr
    })
    return observable
  }

  compute(handle: Function<[T], JSX.Element>) {
    return createComputed(() => handle(this.value), this as any)
  }

  when(truthy: JSX.Element | Function, falsy: JSX.Element | Function) {
    return createComputed(() => (
      this.value ?
        typeof truthy === "function" && !isReactor(truthy) && !isJSXElement(truthy) ? truthy() : truthy :
        typeof falsy === "function" && !isReactor(falsy) && !isJSXElement(falsy) ? falsy() : falsy
    ), { observableInitialValue: false }, this as any)
  }
}
