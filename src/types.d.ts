import { Context, Reactive } from "../types/app"
import { YeapConfig } from "../types/utils"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL } from "./constantes"

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
  yeapContext?: YeapConfig
}

export type ComponentCaller = Function & {
  key: any
  [COMPONENT_SYMBOL]: true
}
export type ElementCaller = Function & {
  key: any
  [ELEMENT_SYMBOL]: true
}