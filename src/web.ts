import { Component } from "../types/app"
import { createReactor } from "./app"
import { generateList } from "./dom"
import { DeepObservable } from "./Observable"
import { getValue, isDefined, isEvent, stringify, toArray } from "./utils"

interface Props { [key: string]: EventListenerOrEventListenerObject | any }

export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>) {
  if (!isDefined(props)) props = {}

  const display = createReactor(true)

  const fallback = toArray(props!["fallback"] ?? [new Text()])
  if ("where" in props!) {
    if (DeepObservable.isObservable(props["where"])) props["where"].subscribe!((_: any, curr: any) => display(!!curr))
    display(!!getValue(props["where"]))
  }

  if (typeof tag === "function") {
    const reactiveProps = createReactor(props!)
    const element = () => tag(reactiveProps, children)

    if ("where" in props! && DeepObservable.isObservable(props["where"])) return display.where!(element, fallback)
    return display() ? element() : fallback
  }

  const is = props?.is?.toString()
  const element = document.createElement(tag, { is })

  for (const prop in props) {
    if (prop === "is" || prop === "fallback" || prop === "where") continue
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
    } else if (isEvent(prop)) {
      element.addEventListener(prop.slice(2).toLowerCase(), props[prop] as EventListenerOrEventListenerObject)
    } else {
      element.setAttribute(prop, stringify(props[prop]))
    }
  }

  render(children, element)

  if ("where" in props! && DeepObservable.isObservable(props["where"])) return display.where!(element, fallback)
  return display() ? element : fallback
}

export function render(children: Array<JSX.Element>, container: HTMLElement) {
  container.append(...generateList([], toArray(children)))
}
