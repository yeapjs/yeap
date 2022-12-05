import { Reactor } from "./app"
import { Props } from "./web"

type Child = {
  isComponent: false
  element: any
} | {
  key: any
  props: Props
  children: Array<JSX.Element>
  isComponent: true
  component: NoConditionalComponent
  element: any
}
type Children = Array<Child>
export interface ComponentMetadata {
  noconditional: boolean
}

export type ComponentProps<T> = T & { fallback?: JSX.Element, when?: any | Reactor<any> }
export interface NoConditionalComponent<T = any, C extends Array<JSX.Element> = Array<JSX.Element>> {
  (props: T, children: C): JSX.Element
  metadata?: ComponentMetadata
  attributeTypes?: Record<string, NumberConstructor | BooleanConstructor | BigIntConstructor | ((el: HTMLElement, value?: string | null) => void)>
  defaultProps?: T
}

export type Component<T = object, C extends Array<JSX.Element> = Array<JSX.Element>> = NoConditionalComponent<ComponentProps<T>, C>

export type CaseProps = { default?: false, test: any, tests?: Array<any> } | { default?: false, test?: any, tests: Array<any> } | { default: true }

export function Dynamic<T>(props: ComponentProps<T & {
  component?: Component<T> | string | keyof JSX.IntrinsicElements
}>, children: Array<JSX.Element>): JSX.Element

export const Fragment: Component<{}>

export function noconditional<T>(comp: Component<T>): Component<T>

export function lazy<T>(callback: (props: ComponentProps<T>, children: Array<JSX.Element>) => Promise<any>): Component<T & { fallback: JSX.Element }>

/**
 * transforms a array of jsx element into a list of info elements
 */
export function children(callback: () => Array<JSX.Element>): Children

export const Portal: Component<{ mount: Element }>

export const Match: NoConditionalComponent<{ when: any }>

export const Case: NoConditionalComponent<CaseProps>
