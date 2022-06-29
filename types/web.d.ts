import { Component, Reactive } from "./app"

type Props = Record<string, EventListenerOrEventListenerObject | Reactive<any> | any>

interface DefineCustomElementOption {
  reactiveAttribute: string[]
  shadowed: "closed" | "open" | false
}

export function define<T>(name: string, component: Component<T & { ref: Element }>, options: DefineCustomElementOption): void

export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>): JSX.Element

export function render(children: Array<JSX.Element>, container: Element): void