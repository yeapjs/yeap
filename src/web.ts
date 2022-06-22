import { Component } from "../types/app"
import { createReactor } from "./app"
import { generateList } from "./dom"
import { DeepObservable } from "./Observable"
import { getValue, isDefined, isEvent, stringify, toArray } from "./utils"

interface Props { [key: string]: EventListenerOrEventListenerObject | any }

export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>) {
  if (!isDefined(props)) props = {}
  if (typeof tag === "function") {
    const reactiveProps = createReactor(props!)
    return tag(reactiveProps, children)
  }

  const is = props?.is?.toString()
  const element = document.createElement(tag, { is })

  const display = createReactor(true)

  for (const prop in props) {
    if (prop === "is" || prop === "fallback") continue
    else if (prop === "ref") {
      props[prop](element)
    } else if (prop === "class") {
      element.className = props[prop]
    } else if (prop === "classList") {
      const classList = props[prop]
      for (const item in classList) {
        if (DeepObservable.isObservable(classList[item])) classList[item].subscribe((_: any, curr: any) => {
          if (!!curr) element.classList.add(item)
          else element.classList.remove(item)
        })

        if (!!getValue(classList[item])) element.classList.add(item)
      }
    } else if (prop === "where") {
      if (DeepObservable.isObservable(props[prop])) props[prop].subscribe((_: any, curr: any) => display(!!curr))
      display(!!getValue(props[prop]))
    } else if (isEvent(prop)) {
      element.addEventListener(prop.slice(2).toLowerCase(), props[prop] as EventListenerOrEventListenerObject)
    } else {
      element.setAttribute(prop, stringify(props[prop]))
    }
  }

  render(children, element)

  if ("where" in props!) return display.where!(element, toArray(props!["fallback"] ?? [new Text()]))
  return element
}

export function render(children: Array<JSX.Element>, container: HTMLElement) {
  container.append(...generateList([], toArray(children)))
}
