import { isDefined } from "./utils";

interface stringify { toString(...args: Array<any>): string }
interface Props { [key: string]: stringify }
type ReccursiveArray<T> = Array<T | ReccursiveArray<T>>

export function h(tag: string, props: Props | null, ...children: ReccursiveArray<HTMLElement | stringify>) {
  if (!isDefined(props)) props = {}
  const is = props?.is?.toString()
  const element = document.createElement(tag, { is })

  for (const prop in props) {
    if (prop === "is") continue
    element.setAttribute(prop, props[prop].toString())
  }

  append(element, children)

  return element
}

function append(parent: HTMLElement, children: ReccursiveArray<HTMLElement | stringify>) {
  for (const child of children) {
    if (child instanceof HTMLElement) parent.appendChild(child)
    else if (child instanceof Array) append(parent, child)
    else {
      const text = document.createTextNode(child.toString())
      parent.appendChild(text)
    }
  }
}
