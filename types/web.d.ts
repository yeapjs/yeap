import { Reactive } from "./app"
import { NoConditionalComponent } from "./components"

type Props = Record<string, EventListenerOrEventListenerObject | Reactive<any> | any>
type ElementGiver<E, F> = () => E | F | Reactive<E | F>

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
export function h<T extends keyof JSX.IntrinsicElements, P extends JSX.IntrinsicElements[T]>(tag: T, props: P | null, ...children: Array<JSX.Element>): ElementGiver<
  P extends JSX.ReactivableHTMLAttributes<infer H>
  ? H : P extends JSX.ReactivableSVGAttributes<infer S>
  ? S : never,
  P["fallback"]
>
export function h<P extends Props>(tag: string, props: P | null, ...children: Array<JSX.Element>): ElementGiver<HTMLElement, P["fallback"]>
export function h<T extends Function>(
  tag: T,
  props: (T extends NoConditionalComponent<infer P> ? P : T extends (props: infer A) => any ? A : {}) | null,
  ...children: (T extends NoConditionalComponent<any, infer H> ? H : T extends (_: any, children: infer H) => any ? H extends Array<any> ? H : [H] : never)
): ElementGiver<HTMLElement, T extends NoConditionalComponent<infer P extends Props> ? P["fallback"] : T extends (props: infer A extends Props, _: any) => any ? A["fallback"] : never>

/**
 * render JSX in a HTML element
 */
export function render(children: JSX.Element, container: Element): void