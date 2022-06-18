import { Children, Component } from "../types/global";
import { createReactor } from "./app";
import { generateList } from "./dom";
import { isDefined, isEvent, stringify } from "./utils";

interface Props { [key: string]: EventListenerOrEventListenerObject | any }

export function h(tag: Component | string, props: Props | null, ...children: Children) {
  if (!isDefined(props)) props = {}
  let element
  if (typeof tag === "function") {
    const reactiveProps = createReactor(props || {})
    element = tag(reactiveProps, children)
  } else {
    const is = props?.is?.toString()
    element = document.createElement(tag, { is })
  }

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

export function render(children: Children, container: HTMLElement) {
  container.append(...generateList([], children))
}
