import { Reactive, SubscribeHandler } from "../types/app"
import { createComputed, createReactor, isReactor } from "./app"
import { FORCE_SYMBOL, OBSERVABLE_SYMBOL } from "./constantes"
import { getValue, isDefined } from "./utils"

export class DeepObservable<T> {
  static isObservable(arg: any): arg is Reactive<any> {
    return !!arg?.[OBSERVABLE_SYMBOL]
  }

  [OBSERVABLE_SYMBOL] = true
  #freeze: boolean
  #parent: DeepObservable<T> | null
  #handlers: Array<SubscribeHandler<T>> = []
  constructor(public value: T, parent: DeepObservable<T> | null = null, freeze = false) {
    this.#freeze = freeze
    this.#parent = parent
    if (this.#parent) this.#handlers = this.#parent.#handlers

    this.call = this.call.bind(this)
    this.freeze = this.freeze.bind(this)
    this.reader = this.reader.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.when = this.when.bind(this)

    return new Proxy(() => this.value, {
      apply: (target, thisArg, argArray: [((v: T) => T) | T] | []) => {
        const value = target()
        if (typeof value === "function")
          return createComputed(() => value.apply(getValue(thisArg), argArray), { unsubscription: false }, this as any)
        if (this.#freeze || argArray.length === 0) return value

        if (typeof argArray[0] === "function") this.value = (argArray[0] as Function)(value)
        else this.value = argArray[0]

        if (value !== this.value) this.call(value, this.value)
        return value
      },
      get: (target, p, _) => {
        const value = (target() as any)[p]
        if (p in this && p !== "value" && ["function", "boolean"].includes(typeof (this as any)[p])) {
          return (this as any)[p]
        } else if (isDefined(value)) {
          if (isReactor(value)) return value
          return new DeepObservable(value, parent ?? this)
        }
        return undefined
      },
      set: (target, p, value, _) => {
        if (p === FORCE_SYMBOL) this.value = value
        else (target() as any)[p] = value
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
    if (!this.#parent) this.#handlers.forEach((handle) => handle(prev, next))
    else this.#parent.call(prev, next)
  }

  freeze() {
    return new DeepObservable(this.value, this.#parent ?? this, true)
  }

  reader() {
    const observable = new DeepObservable(this.value, this.#parent ?? this, true)
    this.subscribe((prev, curr) => {
      if (prev === curr) return

      (observable as any)[FORCE_SYMBOL] = curr
    })
    return observable
  }

  when(truthy: JSX.Element | Function, falsy: JSX.Element | Function) {
    const reactor = createReactor(
      this.value ?
        typeof truthy === "function" ? truthy() : truthy :
        typeof falsy === "function" ? falsy() : falsy
    )

    this.subscribe((prev, curr) => {
      if (prev === curr) return
      if (curr) reactor(typeof truthy === "function" ? truthy() : truthy)
      else reactor(typeof falsy === "function" ? falsy() : falsy)
    })

    return reactor.reader()
  }
}
