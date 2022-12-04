import { Reactive, Reactor } from "../types/app"
import { NoConditionalComponent } from "../types/components"
import { ARRAY_METHOD, COMPONENT_SYMBOL, ELEMENT_SYMBOL, SVG_CAMELCASE_ATTR, SVG_TAGS } from "./constantes"
import { DeepObservable } from "./Observable"
import { Recorder } from "./Recorder"
import { cancelRuntimeCallback, requestRuntimeCallback } from "./runtimeLoop"
import { ComponentContext, ComponentCaller, ElementCaller } from "./types"

function makeMap(str: string): (key: string) => boolean {
  const map: Record<string, boolean> = {}
  const list: Array<string> = str.split(",")
  for (let i = 0; i < list.length; i++) {
    map[list[i].toLowerCase()] = true
  }
  return val => typeof val === "string" && !!map[val.toLocaleLowerCase()]
}

export const recordReactor: Recorder<Reactive<any>> = new Recorder()
export const modifiers = new Map<string, Function | AddEventListenerOptions>([
  ["prevent", (e: Event) => {
    e.preventDefault()
  }],
  ["stop", (e: Event) => {
    e.stopPropagation()
  }],
  ["capture", {
    capture: true
  }],
  ["once", {
    once: true
  }],
  ["passive", {
    passive: true
  }]
])
export const directives = new Map<string, Function>([
  ["model", (el: HTMLInputElement | HTMLTextAreaElement, reactor: Reactor<string>) => {
    el.value = reactor()
    el.addEventListener("input", (e) => reactor(el.value))
  }]
])


let current: ComponentContext
let parent: ComponentContext

export const GLOBAL_CONTEXT = createComponentContext(null)
GLOBAL_CONTEXT.element = document.head
GLOBAL_CONTEXT.yeapContext = { recordObserverValueMethod: false, recordObserverCompute: false }
setContextParent(GLOBAL_CONTEXT)

export const isArrayMethod = makeMap(ARRAY_METHOD)
export const isSVGTag = makeMap(SVG_TAGS)
export const isSVGCamelCaseAttr = makeMap(SVG_CAMELCASE_ATTR)
export function kebabCase(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .join('-')
    .toLowerCase()
}

export function createComponentContext(component: NoConditionalComponent<any, any> | null): ComponentContext {
  const context: ComponentContext = {
    parent,
    topContext: parent?.topContext ?? parent,
    condition: true,
    component,
    htmlConditions: [],
    contexts: {},
    mounted: null,
    unmounted: null,
    hooks: [],
    hookIndex: 0,
    props: {}
  }

  current = context

  return context
}

export function setCurrentContext(context: ComponentContext) {
  current = context
}

export function setContextParent(context: ComponentContext) {
  parent = context
}

export function getCurrentContext(): ComponentContext {
  return current
}

export function isJSXElement(arg: any): arg is ElementCaller | ComponentCaller {
  return !!arg?.[ELEMENT_SYMBOL] || !!arg?.[COMPONENT_SYMBOL]
}

export function stringify(v: unknown): string {
  if (typeof v === "string") return v
  if (typeof v === "object" && v !== null) return JSON.stringify(v)
  if (typeof v === "boolean" || typeof v === "undefined" || v === null) return ""

  return String(v)
}

export function cap(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getValue<T>(a: Reactive<T> | T | undefined): T | undefined {
  return DeepObservable.isObservable(a) ? a() : a
}

export function toArray<T>(value: T | Array<T>): Array<T> {
  return value instanceof Array ? value : [value]
}

export function isDefined(v: any): boolean {
  return v !== null && v !== undefined
}

export function isEvent(v: string): boolean {
  return v.startsWith("on")
}

export function isDirective(v: string): boolean {
  return v.startsWith("use:")
}

export function batch<A extends Array<any>>(cb: Function): (...args: A) => void {
  let timer: number | null = null
  return (...args: A) => {
    if (timer) cancelRuntimeCallback(timer)

    timer = requestRuntimeCallback(() => {
      cancelRuntimeCallback(timer!)
      timer = null

      cb(...args)
    })
  }
}

export function equals(a: any, b: any) {
  if (a === b) return true
  if (!isDefined(a) || !isDefined(b)) return false
  // test if is nan
  if (a !== a && b !== b) return true
  if (typeof a !== typeof b) return false
  if (typeof a === "symbol") return false
  if (typeof a !== "object") return false
  if (a instanceof RegExp) return a.flags === b.flags && a.source === b.source
  if (Array.isArray(a) && a.length !== b.length) return false

  for (const key in a) {
    if (!b.hasOwnProperty(key)) return false
    if (!equals(a[key], b[key])) return false
  }
  return true
}

export function diff(obj1: Record<string, [any, any]>, obj2: Record<string, [any, any]>): Record<string, { old: any, new: any, action: "add" | "del" | "update" }> | null {
  const result: Record<any, any> = {}

  if (Object.is(obj1, obj2)) return null
  if (!obj2 || typeof obj2 !== 'object') return obj2;

  [...Object.keys(obj1), ...Object.keys(obj2)].forEach((key) => {
    if (key in result) return
    if (obj2?.[key]?.[0] !== obj1?.[key]?.[0] || obj2?.[key]?.[1] !== obj1?.[key]?.[1]) result[key] = {
      old: obj1?.[key],
      new: obj2?.[key],
      action: obj2?.[key] === undefined ? "del" : obj1?.[key] === undefined ? "add" : "update"
    }
  })

  return result
}

export function hash(str: string): string {
  return str.split("").map((char) => {
    return char.charCodeAt(0)
  }).reduce((a, b) => a * b).toString(16).slice(0, 8)
}
