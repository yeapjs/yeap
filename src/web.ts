import { isDefined, isEvent, stringify } from "./utils";

interface Props { [key: string]: EventListenerOrEventListenerObject | any }
type ReccursiveArray<T> = Array<T | ReccursiveArray<T>>

export function h(tag: string, props: Props | null, ...children: ReccursiveArray<HTMLElement | any>) {
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

  append(element, children)

  return element
}

function append(parent: HTMLElement, children: ReccursiveArray<HTMLElement | any>) {
  for (const child of children) {
    if (child instanceof HTMLElement) parent.appendChild(child)
    else if (child instanceof Array) append(parent, child)
    else {
      const text = document.createTextNode(stringify(child))
      parent.appendChild(text)
    }
  }
}
