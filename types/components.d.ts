import { Component, ToReactive } from "./app"

export function Dynamic<T>(props: ToReactive<T & {
  component?: Component<T> | string | keyof JSX.IntrinsicElements
}>, children: Array<JSX.Element>): JSX.Element

export const Fragment: Component<{}>

export function lazy<T>(callback: (props: ToReactive<T>, children: Array<JSX.Element>) => Promise<any>): Component<T & { fallback: JSX.Element }>

export const Portal: Component<{ mount: HTMLElement }>
