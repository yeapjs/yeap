import { Reactor, ReccursiveArray } from "../types/global";
import { generateList } from "./dom";
import { isDefined, isEvent, stringify } from "./utils";

interface Props { [key: string]: EventListenerOrEventListenerObject | any }

export function h(tag: string, props: Props | null, ...children: ReccursiveArray<HTMLElement | Reactor<any> | any>) {
  if (!isDefined(props)) props = {}
  const is = props?.is?.toString()
  const element = document.createElement(tag, { is })

  for (const prop in props) {
    if (prop === "is") continue
    if (isEvent(prop)) {
      element.addEventListener(prop.slice(2).toLowerCase(), props[prop] as EventListenerOrEventListenerObject)
    } else {
      element.setAttribute(prop, stringify(props[prop]))
    }
  }

  render(children, element)

  return element
}

export function render(children: ReccursiveArray<HTMLElement | Reactor<any> | any>, container: HTMLElement) {
  container.append(...generateList([], children))
}
