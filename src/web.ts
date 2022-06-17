import { Reactor } from "../types/global";
import { DeepObservable } from "./Observable";
import { isDefined, isEvent, stringify } from "./utils";

interface Props { [key: string]: EventListenerOrEventListenerObject | any }
type ReccursiveArray<T> = Array<T | ReccursiveArray<T>>

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

  append(element, children)

  return element
}

function append(parent: HTMLElement, children: ReccursiveArray<HTMLElement | Reactor<any> | any>) {
  for (const child of children) {
    if (child instanceof HTMLElement) parent.appendChild(child)
    else if (child instanceof Array) append(parent, child)
    else if (DeepObservable.isObservable(child)) {
      let text = document.createTextNode(stringify(child()))
      child.subcribe((_: any, value: any) => {
        let newChild = document.createTextNode(stringify(child()))
        parent.replaceChild(newChild, text)
        text = newChild
      })
      parent.appendChild(text)
    }
    else {
      const text = document.createTextNode(stringify(child))
      parent.appendChild(text)
    }
  }
}
