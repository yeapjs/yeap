import { Context, Reactive } from "../types/app"
import { isReactor } from "./app"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL, SVG_CAMELCASE_ATTR, SVG_TAGS } from "./constantes"
import { ComponentCaller, ElementCaller } from "./web"

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
  directives?: Map<string, Function>
  modifiers?: Map<string, Function | AddEventListenerOptions>
}

function makeMap(str: string): (key: string) => boolean {
  const map: Record<string, boolean> = {}
  const list: Array<string> = str.split(",")
  for (let i = 0; i < list.length; i++) {
    map[list[i].toLowerCase()] = true
  }
  return val => !!map[val.toLocaleLowerCase()]
}

let recordReactor: Set<Reactive<any>> | null = null

let current: ComponentContext
let parent: ComponentContext
export const GLOBAL_CONTEXT = createComponentContext()
GLOBAL_CONTEXT.directives = new Map()
GLOBAL_CONTEXT.modifiers = new Map()
setContextParent(GLOBAL_CONTEXT)

export const isArrayMethod = (p: any) => typeof p === "string" && "iter,push,pop,unshift,shift".includes(p)
export const isSVGTag = makeMap(SVG_TAGS)
export const isSVGCamelCaseAttr = makeMap(SVG_CAMELCASE_ATTR)
export function kebabCase(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)!
    .join('-')
    .toLowerCase()
}

export function resetRecordReactor() {
  recordReactor = new Set()
}

export function addRecordReactor(item: Reactive<any>) {
  recordReactor?.add(item)
}

export function getRecordReactor() {
  let lastRecord = recordReactor
  recordReactor = null
  return lastRecord
}

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

export function isJSXElement(arg: any): arg is ElementCaller | ComponentCaller {
  return !!arg?.[ELEMENT_SYMBOL] || !!arg?.[COMPONENT_SYMBOL]
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
  return isReactor(a) ? a() : a
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
