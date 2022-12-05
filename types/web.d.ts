import { Reactive } from "./app"
import { NoConditionalComponent } from "./components"

type Props = Record<string, EventListenerOrEventListenerObject | Reactive<any> | any>
export type HElement<E = HTMLElement> = () => E

interface DefineCustomElementOption {
  reactiveAttributes?: string[]
  shadowed?: "closed" | "open" | false
}

/**
 * transforms a functional component into a web component
 */
export function define<T>(name: string, component: NoConditionalComponent<T & { ref: Element }>, options?: DefineCustomElementOption): () => HTMLElement

/**
 * JSX to HTML element
 */
export function h<T extends keyof JSX.IntrinsicElements, P = JSX.IntrinsicElements[T]>(tag: T, props: JSX.IntrinsicElements[T] | null, ...children: Array<JSX.Element>): HElement<
  P extends JSX.ReactivableHTMLAttributes<infer H>
  ? H : P extends JSX.ReactivableSVGAttributes<infer S>
  ? S : never
>
export function h(tag: string, props: Props | null, ...children: Array<JSX.Element>): HElement<HTMLElement>
export function h<C extends NoConditionalComponent | Function>(
  tag: C,
  props: (C extends NoConditionalComponent<infer P> ? P : C extends (props: infer A) => any ? A : {}) | null,
  ...children: (C extends NoConditionalComponent<any, infer H> ? H : C extends (_: any, children: infer H) => any ? H extends Array<any> ? H : [H] : never)
): HElement<HTMLElement | (() => HTMLElement)>

/**
 * render JSX in a HTML element
 */
export function render(children: JSX.Element, container: Element): void