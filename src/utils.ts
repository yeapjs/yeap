import { Reactive } from "../types/app"
import { isReactor } from "./app"

export interface ComponentContext {
  mounted: Array<Function> | null
  unmounted: Array<Function> | null
  hooks: Array<any>
  hookIndex: number
}

let current: ComponentContext
export const GLOBAL_CONTEXT = createComponentContext()

export function createComponentContext(): ComponentContext {
  const context: ComponentContext = {
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

export function getCurrentContext(): ComponentContext {
  return current
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
