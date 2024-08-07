import { Context, Reactive } from "../types/app"
import { ComponentInfos, DataInfos, ElementInfos, NoConditionalComponent } from "../types/components"
import { ModuleContext } from "../types/modules"
import { MapList } from "./MapList"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL, MANIPULABLE_SYMBOL } from "./constantes"
import { ContextLevel } from "./helpers"

interface ProvidedContext<T> {
  id: symbol
  value?: T
}

export interface InternalContext {
  level: ContextLevel,
  element?: Element
  parent?: InternalContext
  assemblyCondition: Reactive<boolean> | boolean
  htmlConditions: Array<Reactive<boolean>>
  highestContext?: InternalContext
  contexts: Record<symbol, { context?: Context<any> | null, provider: ProvidedContext<any> | null }>
  events: MapList<string, Function>
  hooks: Array<any>
  hookIndex: number
  moduleContext: ModuleContext
  call(key: string, ...args: Array<any>): void
}

export type ComponentCaller = Function & {
  key: PropertyKey
  props: object,
  component: NoConditionalComponent<object>,
  children: Array<JSX.Element>,
  [COMPONENT_SYMBOL]: true
}
export type ElementCaller = Function & {
  key: PropertyKey
  [ELEMENT_SYMBOL]: true
}
export type Children = Array<{ [MANIPULABLE_SYMBOL]: true } & (ComponentInfos | DataInfos | ElementInfos)>
