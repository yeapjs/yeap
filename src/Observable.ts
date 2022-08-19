import { Function, Reactive, SubscribeHandler } from "../types/app"
import { createComputed, isReactor } from "./app"
import { FORCE_SYMBOL, OBSERVABLE_SYMBOL } from "./constantes"
import { getValue, isDefined, isJSXElement } from "./utils"

export class DeepObservable<T>  {
  [OBSERVABLE_SYMBOL] = true;
  [FORCE_SYMBOL]: any = undefined
  static isObservable(arg: any): arg is Reactive<any> {
    return !!arg?.[OBSERVABLE_SYMBOL]
  }

  #freeze: boolean
  #once: boolean
  #handlers: Array<SubscribeHandler<T>> = []
  constructor(public value: T, parent?: DeepObservable<any> | null, freeze = false, once = false) {
    this.#freeze = freeze
    this.#once = once

    this.call = this.call.bind(this)
    this.compute = this.compute.bind(this)
    this.freeze = this.freeze.bind(this)
    this.reader = this.reader.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.when = this.when.bind(this)

    const properties: Record<PropertyKey, any> = {}

    return new Proxy(() => this.value, {
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
        if (this.#freeze || argArray.length === 0) return value

        if (typeof argArray[0] === "function" && !isReactor(argArray[0])) this.value = (argArray[0] as Function)(value)
        else this.value = getValue(argArray[0])

        if (this.#once) this.#freeze = true

        this.call(value, this.value)
        return value
      },
      get: (_, p) => {
        if (p in properties) return properties[p]

        const value = (this.value as any)?.[p]
        if (p in this && p !== "value" && ["function", "boolean"].includes(typeof (this as any)[p])) {
          return (this as any)[p]
        } else if (isDefined(value)) {
          if (isReactor(value)) return value
          const reactive = new DeepObservable(value, typeof value === "function" ? this : null, this.#freeze)

          this.subscribe((_, curr: any) => {
            reactive[FORCE_SYMBOL] = curr?.[p]
          })
          if (!this.#freeze) reactive.subscribe((prev, curr) => {
            (this.value as any)[p] = curr
          })

          properties[p] = reactive

          return reactive
        } else if (value === null) return null
        return undefined
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
