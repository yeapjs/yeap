import { Reactor, SubscribeHandler } from "../types/app"
import { isDefined } from "./utils"

const observableSymbol = Symbol("observable")

export class DeepObservable<T> {
  static isObservable(arg: any): arg is Reactor<any> {
    return !!arg?.[observableSymbol]
  }

  [observableSymbol] = true
  #parent: DeepObservable<T> | null
  #handlers: Array<SubscribeHandler<T>> = []
  constructor(public value: T, parent: DeepObservable<T> | null = null) {
    this.#parent = parent
    if (this.#parent) this.#handlers = this.#parent.#handlers

    this.call = this.call.bind(this)
    this.subscribe = this.subscribe.bind(this)

    return new Proxy(() => this.value, {
      apply: (target, thisArg, argArray: [((v: T) => T) | T] | []) => {
        const value = target()
        if (typeof value === "function")
          return new DeepObservable(value.apply(parent?.value ?? thisArg, argArray), parent ?? this)
        if (argArray.length === 0) return value

        if (typeof argArray[0] === "function") this.value = (argArray[0] as Function)(value)
        else this.value = argArray[0]

        this.call(value, this.value)

        return value
      },
      get: (target, p, receiver) => {
        const value = (target() as any)[p]
        if (p in this) {
          return (this as any)[p]
        } else if (isDefined(value)) {
          if (DeepObservable.isObservable(value)) return value
          return new DeepObservable(value, parent ?? this)
        }
        return undefined
      }
    }) as any
  }

  subscribe(handler: SubscribeHandler<T>) {
    this.#handlers.push(handler)
  }

  call(prev: T, next: T) {
    this.#handlers.forEach((handle) => handle(prev, next))
    this.#parent?.call(prev, next)
  }
}
