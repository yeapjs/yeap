import { List, ListItem } from "css-tree"
import { Context, CSSProperties, Reactive } from "../types/app"
import { ComponentInfos, DataInfos, ElementInfos, NoConditionalComponent } from "../types/components"
import { YeapConfig } from "../types/utils"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL, MANIPULABLE_SYMBOL } from "./constantes"

interface ProvidedContext<T> {
  id: symbol
  value?: T
}

export interface ComponentContext {
  element?: Element
  parent?: ComponentContext
  condition: Reactive<boolean> | boolean
  component: NoConditionalComponent<object> | null
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
  props: any,
  component: NoConditionalComponent<object>,
  children: Array<JSX.Element>,
  [COMPONENT_SYMBOL]: true
}
export type ElementCaller = Function & {
  key: any
  [ELEMENT_SYMBOL]: true
}
export type Children = Array<{ [MANIPULABLE_SYMBOL]: true } & (ComponentInfos | DataInfos | ElementInfos)>
export interface CssTreeList<T> extends List<T> {
  head: ListItem<T> | null,
  tail: ListItem<T> | null,
}
