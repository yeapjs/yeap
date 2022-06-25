import { Component, Reactor } from "../types/app"
import { createReactor } from "./app"
import { generateList } from "./dom"
import { DeepObservable } from "./Observable"
import { createContext, getValue, isDefined, isEvent, stringify, toArray } from "./utils"

interface Props { [key: string]: EventListenerOrEventListenerObject | any }

export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>) {
  if (!isDefined(props)) props = {}

  const display = createReactor(true)

  const fallback = toArray(props!["fallback"] ?? [new Text()])
  if ("when" in props!) {
    if (DeepObservable.isObservable(props["when"])) props["when"].subscribe!((_: any, curr: any) => display(!!curr))
    display(!!getValue(props["when"]))
  }

  if (typeof tag === "function") return hComp(tag, props, display, fallback, children)

  const is = props?.is?.toString()
  const element = document.createElement(tag, { is })

  for (const prop in props) {
    if (prop === "is" || prop === "fallback" || prop === "when") continue
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

  if ("when" in props! && DeepObservable.isObservable(props["when"])) return display.when!(element, fallback)
  return display() ? element : fallback
}

export function hComp(
  component: Component,
  props: Props | null,
  display: Reactor<boolean>,
  fallback: JSX.Element,
  children: Array<JSX.Element>
) {
  const reactiveProps = createReactor(props!)
  const element = () => component(reactiveProps, children)
  const context = createContext()

  setTimeout(() => {
    if (isDefined(context.mounted)) context.mounted!.forEach((handle) => handle())
    context.mounted = null
  }, 0)

  if ("when" in props! && DeepObservable.isObservable(props["when"])) {
    const reactor = display.when!(element, fallback)
    reactor.subscribe!((_, curr) => {
      if (curr !== fallback) {
        if (isDefined(context.mounted)) context.mounted!.forEach((handle) => handle())
        context.mounted = null
      } else {
        if (isDefined(context.unmounted)) context.unmounted!.forEach((handle) => handle())
        context.unmounted = null
      }
    })

    return reactor
  }

  return display() ? element() : fallback
}

export function render(children: Array<JSX.Element>, container: HTMLElement) {
  container.append(...generateList([], toArray(children)))
}
