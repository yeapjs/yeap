import { Component, Function, Reactive } from "./app"

type Props = Record<string, EventListenerOrEventListenerObject | Reactive<any> | any>

interface DefineCustomElementOption {
  reactiveAttributes?: string[]
  shadowed?: "closed" | "open" | false
}

/**
 * transforms a functional component into a web component
 */
export function define<T>(name: string, component: Component<T & { ref: Element }>, options?: DefineCustomElementOption): void

/**
 * transforms a array into a list of elements
 */
export function children(callback: () => Array<JSX.Element>): Array<Element | Text>

/**
 * JSX to HTML element
 */
export function h<T extends keyof JSX.IntrinsicElements, P = JSX.IntrinsicElements[T]>(tag: T, props: JSX.IntrinsicElements[T] | null, ...children: Array<JSX.Element>): () =>
  P extends JSX.ReactivableHTMLAttributes<infer H>
  ? H : P extends JSX.ReactivableSVGAttributes<infer S>
  ? S : never
export function h(tag: string, props: Props | null, ...children: Array<JSX.Element>): () => HTMLElement
export function h<C extends Component | Function>(
  tag: C,
  props: (C extends Component<infer P> ? P : C extends Function<[infer A]> ? A : {}) | null,
  ...children: Array<JSX.Element>
): () => (HTMLElement | (() => HTMLElement))

/**
 * render JSX in a HTML element
 */
export function render(children: JSX.Element, container: Element): void