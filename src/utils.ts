import { Context, Reactive } from "../types/app"
import { isReactor } from "./app"
import { COMPONENT_SYMBOL, SVG_TAGS } from "./constantes"
import { ComponentCaller } from "./web"

interface ProvidedContext<T> {
  id: symbol
  value?: T
}

export interface ComponentContext {
  parent?: ComponentContext
  condition: Reactive<boolean> | boolean
  contexts: Record<symbol, { context?: Context<any> | null, provider: ProvidedContext<any> | null }>
  mounted: Array<Function> | null
  unmounted: Array<Function> | null
  hooks: Array<any>
  hookIndex: number
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
    contexts: {},
    mounted: null,
    unmounted: null,
    hooks: [],
    hookIndex: 0
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

export function isComponent(arg: any): arg is ComponentCaller {
  return !!arg?.[COMPONENT_SYMBOL]
}

export function stringify(v: unknown): string {
  if (typeof v === "string") return v
  if (typeof v === "object" && v !== null) return JSON.stringify(v)
  if (typeof v === "undefined") return "undefined"
  if (v === null) return "null"

  return String(v)
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
