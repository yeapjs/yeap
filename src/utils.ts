import { Context, Reactive } from "../types/app"
import { isReactor } from "./app"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL, SVG_TAGS } from "./constantes"

interface ProvidedContext<T> {
  id: symbol
  value?: T
}

export interface ComponentContext {
  element?: Element
  parent?: ComponentContext
  condition: Reactive<boolean> | boolean
  htmlConditions: Array<Reactive<boolean>>,
  contexts: Record<symbol, { context?: Context<any> | null, provider: ProvidedContext<any> | null }>
  mounted: Array<Function> | null
  unmounted: Array<Function> | null
  hooks: Array<any>
  hookIndex: number
  props: Record<PropertyKey, any>
}

function makeMap(str: string): (key: string) => boolean {
  const map: Record<string, boolean> = {}
  const list: Array<string> = str.split(",")
  for (let i = 0; i < list.length; i++) {
    map[list[i].toLowerCase()] = true
  }
  return val => !!map[val.toLocaleLowerCase()]
}

let current: ComponentContext
let parent: ComponentContext
export const GLOBAL_CONTEXT = createComponentContext()
setContextParent(GLOBAL_CONTEXT)

export const isSVGTag = makeMap(SVG_TAGS)

export function createComponentContext(): ComponentContext {
  const context: ComponentContext = {
    parent,
    condition: true,
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

export function isElement(arg: any): arg is Function {
  return !!arg?.[ELEMENT_SYMBOL]
}

export function isComponent(arg: any): arg is Function {
  return !!arg?.[COMPONENT_SYMBOL]
}

export function stringify(v: unknown): string {
  if (typeof v === "string") return v
  if (typeof v === "object" && v !== null) return JSON.stringify(v)
  if (typeof v === "undefined") return "undefined"
  if (v === null) return "null"

  return String(v)
}

export function cap(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getValue<T>(a: Reactive<T> | T | undefined): T | undefined {
  if (isReactor(a)) return (a as Reactive<T>)()
  return a as T
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
