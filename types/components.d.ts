import { Component, ComponentProps } from "./app"

export function Dynamic<T>(props: ComponentProps<T & {
  component?: Component<T> | string | keyof JSX.IntrinsicElements
}>, children: Array<JSX.Element>): JSX.Element

export const Fragment: Component<{}>

export function noconditional<T>(comp: Component<T>): Component<T>

export function lazy<T>(callback: (props: ComponentProps<T>, children: Array<JSX.Element>) => Promise<any>): Component<T & { fallback: JSX.Element }>

export const Portal: Component<{ mount: Element }>

export const Match: Component<{ when: any }>

export const Case: Component<{ default?: false, test: any } | { default: true }>
