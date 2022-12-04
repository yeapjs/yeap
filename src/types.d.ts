import { Context, CSSProperties, Reactive } from "../types/app"
import { NoConditionalComponent } from "../types/components"
import { YeapConfig } from "../types/utils"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL } from "./constantes"

interface ProvidedContext<T> {
  id: symbol
  value?: T
}

export interface ComponentContext {
  id?: string
  style?: { [key: string]: CSSProperties }
  element?: Element
  parent?: ComponentContext
  condition: Reactive<boolean> | boolean
  component: NoConditionalComponent | null
  htmlConditions: Array<Reactive<boolean>>
  topContext?: ComponentContext
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