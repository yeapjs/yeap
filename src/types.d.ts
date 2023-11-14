import { Context, Reactive } from "../types/app"
import { ComponentInfos, DataInfos, ElementInfos, NoConditionalComponent } from "../types/components"
import { ModuleContext } from "../types/modules"
import { YeapConfig } from "../types/utils"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL, MANIPULABLE_SYMBOL } from "./constantes"

interface ProvidedContext<T> {
  id: symbol
  value?: T
}

export interface InternalContext {
  global: 0 /* local */ | 1 /* global */ | 2 /* web component */,
  element?: Element
  parent?: InternalContext
  assemblyCondition: Reactive<boolean> | boolean
  htmlConditions: Array<Reactive<boolean>>
  highestContext?: InternalContext
  contexts: Record<symbol, { context?: Context<any> | null, provider: ProvidedContext<any> | null }>
  mounted: Array<Function>
  unmounted: Array<Function>
  hooks: Array<any>
  hookIndex: number
  yeapContext?: YeapConfig
  moduleContext: ModuleContext
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
