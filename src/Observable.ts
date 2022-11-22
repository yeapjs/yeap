import { Reactive, ReactorMetaData, ReadOnlyReactor, SubscribeHandler } from "../types/app"
import { createComputed } from "./app"
import { FORCE_SYMBOL, OBSERVABLE_SYMBOL, READONLY_OBSERVABLE_SYMBOL } from "./constantes"
import { getValue, GLOBAL_CONTEXT, isArrayMethod, isDefined, isJSXElement, recordReactor } from "./helpers"
import { record } from "./utils";

export class DeepObservable<T>  {
  [OBSERVABLE_SYMBOL] = true;
  [FORCE_SYMBOL]: any = undefined
  static isObservable(arg: any): arg is Reactive<any> {
    return !!arg?.[OBSERVABLE_SYMBOL]
  }

  get [READONLY_OBSERVABLE_SYMBOL]() {
    return this.#freeze
  }

  #proxy: Reactive<T>
  #freeze: boolean
  #once: boolean
  #handlers: Array<SubscribeHandler<T>> = []
  #dependencies: Set<Reactive<any>> = new Set()
  constructor(public value: T, parent?: DeepObservable<any> | null, freeze = false, once = false) {
    this.#freeze = freeze
    this.#once = once

    this.call = this.call.bind(this)
    this.copy = this.copy.bind(this)
    this.compute = this.compute.bind(this)
    this.freeze = this.freeze.bind(this)
    this.reader = this.reader.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.metadata = this.metadata.bind(this)
    this.when = this.when.bind(this)

    this.and = this.and.bind(this)
    this.or = this.or.bind(this)
    this.not = this.not.bind(this)
    this.nullish = this.nullish.bind(this)

    const properties: Record<PropertyKey, any> = {}

    this.#proxy = new Proxy(() => this.value, {
      apply: (_, thisArg, argArray: [((v: T) => T) | T] | []) => {
        const value = this.value
        if (DeepObservable.isObservable(value)) return value()
        if (value instanceof Function) {
          const [firstValue, recordedReactors] = record(() => value.apply(getValue(thisArg), argArray))

          const reactive: Reactive<any> = new DeepObservable(firstValue) as any;

          const subscribe = () => reactive(value.apply(getValue(thisArg), argArray))

          if (parent) parent.subscribe(subscribe)
          if (GLOBAL_CONTEXT.yeapContext?.recordObserverValueMethod) recordedReactors.forEach((recordedReactor) => recordedReactor.subscribe(subscribe))

          return reactive.reader()
        }

        if (this.#freeze) {
          if (argArray.length > 0) throw new TypeError("Cannot assign to read only reactor");
          return value
        }

        if (argArray.length === 0) {
          recordReactor.push(this.#proxy)
          return value
        }

        if (argArray[0] instanceof Function && !DeepObservable.isObservable(argArray[0])) this.value = argArray[0](value)
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

        if (DeepObservable.isObservable(value)) return value

        try {
          if (!(p in this.value)) return value
        } catch (e) {
          return undefined
        }

        const descriptor = Object.getOwnPropertyDescriptor(this.value, p)
        const freeze = this.#freeze || typeof this.value !== "object" || !(descriptor?.writable ?? descriptor?.set)
        const reactive = new DeepObservable(value, value instanceof Function ? this : null, freeze)

        this.subscribe((_, curr: any) => {
          reactive[FORCE_SYMBOL] = curr?.[p]
        })
        if (reactive.metadata().settable) reactive.subscribe((_, curr) => {
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
    }) as any

    return this.#proxy as any
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
    const freezed = new DeepObservable(this.value, null, true, false)
    freezed.metadata().dependencies = this.#dependencies

    return freezed
  }

  reader() {
    const observable = new DeepObservable(this.value, null, true, false)
    this.subscribe((prev, curr) => {
      if (prev === curr) return

      observable[FORCE_SYMBOL] = curr
    })
    observable.metadata().dependencies = this.#dependencies

    return observable
  }

  compute<U>(handle: (value: T) => any): ReadOnlyReactor<U> {
    return createComputed(() => handle(this.value), { observableInitialValue: GLOBAL_CONTEXT.yeapContext?.recordObserverCompute }, this.#proxy)
  }

  when<U, F>(condition: (value: T) => boolean, truthy: U | (() => U), falsy?: F | (() => F)): ReadOnlyReactor<U | F> {
    if (!isDefined(falsy)) {
      falsy = truthy as any
      truthy = condition as any
      condition = (v: T) => !!v
    }

    return this.compute((v) => {
      return condition(v) ?
        truthy instanceof Function && !DeepObservable.isObservable(truthy) && !isJSXElement(truthy) ? truthy() : truthy :
        falsy instanceof Function && !DeepObservable.isObservable(falsy) && !isJSXElement(falsy) ? falsy() : falsy
    })
  }

  and<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U> {
    return this.compute<U>((v) => v && (otherwise instanceof Function && !DeepObservable.isObservable(otherwise) && !isJSXElement(otherwise) ? otherwise() : otherwise))
  }

  or<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U> {
    return this.compute<U>((v) => v || (otherwise instanceof Function && !DeepObservable.isObservable(otherwise) && !isJSXElement(otherwise) ? otherwise() : otherwise))
  }

  not(): ReadOnlyReactor<boolean> {
    return this.compute((v) => !v)
  }

  nullish<U>(otherwise: (() => U) | U): ReadOnlyReactor<T | U> {
    return this.compute<U>((v) => v ?? (otherwise instanceof Function && !DeepObservable.isObservable(otherwise) && !isJSXElement(otherwise) ? otherwise() : otherwise))
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
