import { Component, Reactive } from "./app"

type Props = Record<string, EventListenerOrEventListenerObject | Reactive<any> | any>

interface DefineCustomElementOption {
  reactiveAttributes: string[]
  shadowed: "closed" | "open" | false
}

/**
 * transforms a functional component into a web component
 */
export function define<T>(name: string, component: Component<T & { ref: Element }>, options: DefineCustomElementOption): void

/**
 * JSX to HTML element
 */
export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>): JSX.Element

/**
 * render JSX in a HTML element
 */
export function render(children: Array<JSX.Element>, container: Element): void