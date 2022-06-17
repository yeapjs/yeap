import { Reactor, SubcribeHandler } from "../types/global"
import { isDefined } from "./utils"

const observableSymbol = Symbol("observable")

export class DeepObservable<T, P> {
  static isObservable(arg: any): arg is Reactor<any> {
    return !!arg[observableSymbol]
  }

  [observableSymbol] = true
  #parent: DeepObservable<T, this> | null
  #handlers: Array<SubcribeHandler<T>> = []
  constructor(public value: T, parent: DeepObservable<T, unknown> | null = null) {
    this.#parent = parent

    this.call = this.call.bind(this)
    this.subcribe = this.subcribe.bind(this)

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
        const v = (value as any)[p]
        if (p in this) {
          return (this as any)[p]
        } else if (isDefined(v)) return new DeepObservable(v, parent ?? this)
        return undefined
      }
    }) as any
  }

  subcribe(handler: SubcribeHandler<T>) {
    if (this.#parent) this.#parent.subcribe(handler)
    else this.#handlers = [...this.#handlers, handler]
  }

  call(prev: T, next: T) {
    this.#handlers.forEach((handle) => handle(prev, next))
    this.#parent?.call(prev, next)
  }
}
