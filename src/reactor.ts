import { Reactive, Reactor, ReadOnlyReactor } from "../types/app"
import { isDefined, recordReactor } from "./helpers"

type SubscribtionCallback<T> = (previous: T, current: T) => void
type ComputeCallback<T, U> = (value: T) => U
type Subscribtion<T> = SubscribtionCallback<T> | [SubscribtionCallback<T>, string | symbol]

const SUBSCRIBTIONS_SYMBOL = Symbol("subscribtions")
const PROPERTIES_SYMBOL = Symbol("properties")
const REACTABLE_SYMBOL = Symbol("reactable")
const NOOP = () => { }

export function reactor<T>(value: T, freeze: boolean, once: boolean): Reactive<T> {
  const node = new Node(value)

  return reactorFromNode(node, freeze, once)
}

export function reactorFromNode<T>(node: Node<T>, freeze: boolean, once: boolean): Reactive<T> {
  const proxy = new Proxy(NOOP, {
    apply(_, __, argArray: [ComputeCallback<T, T> | T] | []) {
      if (argArray.length === 0) {
        recordReactor.push(proxy)
        return node.get()
      }

      if (freeze) throw new TypeError("Cannot assign to read only reactor")
      if (once) freeze = true

      return node.set(argArray[0])
    },
    get<K extends keyof T>(_: typeof NOOP, p: string | symbol) {
      // if (p in properties) return properties[p]
      if (p in node && p !== "_value") return node[p]

      const reactor = native.call<Node<T>, [K], Reactive<T[K]> | undefined>(node, p as K)
      if (!isDefined(reactor)) return reactor

      return reactor
    },
    set<K extends keyof T>(_: typeof NOOP, p: string | symbol, newValue: T[K]) {
      const descriptor = Object.getOwnPropertyDescriptor(node.get(), p)
      const freezed = freeze || typeof node.get() !== "object" || !(descriptor?.writable ?? descriptor?.set)
      if (freezed) throw new TypeError("Cannot assign to read only reactor")

      const reactor = native.call<Node<T>, [K], Reactive<T[K]> | undefined>(node, p as K)
      if (!isDefined(reactor)) return false

      return true
    },
  }) as Reactive<T>

  return proxy
}

class Node<T> {
  [x: PropertyKey]: any

  [REACTABLE_SYMBOL] = true;
  [PROPERTIES_SYMBOL]: Record<PropertyKey, Reactive<any>> = {};
  [SUBSCRIBTIONS_SYMBOL]: Array<Subscribtion<T>> = []
  constructor(public _value: T) { }

  get() {
    return this._value
  }

  set(newValue: any) {
    const value = newValue instanceof Function ? newValue(this._value) : newValue;

    const oldValue = value
    this._value = value
    notify(this, oldValue)
  }

  subscribe(subscribtion: SubscribtionCallback<T>, id?: string | symbol) {
    if (id) this[SUBSCRIBTIONS_SYMBOL].push([subscribtion, id])
    else this[SUBSCRIBTIONS_SYMBOL].push(subscribtion)
    return () => {
      this[SUBSCRIBTIONS_SYMBOL] = this[SUBSCRIBTIONS_SYMBOL].filter((callback) => (Array.isArray(callback) ? callback[0] : callback) !== subscribtion)
    }
  }

  copy(): Reactor<T> {
    return reactorFromNode(new Node(this._value), false, false) as Reactor<T>
  }

  freeze(): ReadOnlyReactor<T> {
    return reactorFromNode(new Node(this._value), true, false)
  }

  reader(): ReadOnlyReactor<T> {
    const node = new Node(this._value)

    this.subscribe((_, value) => {
      node.set(value)
    })

    return reactorFromNode(node, true, false)
  }

  compute<U>(callback: ComputeCallback<T, U>): ReadOnlyReactor<U> {
    const node = new Node(callback(this._value))

    this.subscribe((_, value) => {
      node.set(callback(value))
    })

    return reactorFromNode(node, true, false)
  }
}

function isReactable(arg: any): arg is Reactive<unknown> {
  return !!arg?.[REACTABLE_SYMBOL]
}

function notify<T>(node: Node<T>, oldValue: T) {
  node[SUBSCRIBTIONS_SYMBOL].forEach((handle) => {
    if (Array.isArray(handle)) handle[0](oldValue, node._value)
    else handle(oldValue, node._value)
  })
}


function native<T, K extends keyof T>(this: Node<T>, property: K): Reactive<T[K]> | undefined {
  if (!!(this._value)) throw new TypeError(`Cannot read properties of ${this._value} (reading '${property.toString()}')`)

  const descriptor = Object.getOwnPropertyDescriptor(this._value, property)
  if (descriptor === undefined) return undefined

  if (isReactable(descriptor.value)) return descriptor.value as Reactive<T[K]>

  const freezed = !(descriptor.writable ?? descriptor.set)
  const node = new Node(descriptor.value)

  this.subscribe((_, value) => {
    node.set(value[property])
  })
  node.subscribe((_, value) => {

  })

  return reactorFromNode(node, freezed, false)
}
