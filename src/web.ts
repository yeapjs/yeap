import { Component, Reactor } from "../types/app"
import { DefineCustomElementOption } from "../types/web"
import { createReactor } from "./app"
import { generateList } from "./dom"
import { DeepObservable } from "./Observable"
import { ComponentContext, createComponentContext, getValue, globalContext, isDefined, isEvent, setCurrentContext, stringify, toArray } from "./utils"

interface Props { [key: string]: EventListenerOrEventListenerObject | any }
type CustomAttribute<T> = T & { ref?: HTMLElement }

export function define<T>(name: string, component: Component<CustomAttribute<T>>, { reactiveAttribute, shadowed }: DefineCustomElementOption) {
  class Component extends HTMLElement {
    private context: ComponentContext
    private props: CustomAttribute<Props> = {}

    static get observedAttributes() { return reactiveAttribute }

    constructor() {
      super()
      this.context = createComponentContext()
      const parent = shadowed ? this.attachShadow({ mode: shadowed }) : this

      for (let i = 0; i < this.attributes.length; i++) {
        const name = this.attributes[i].nodeName
        if (reactiveAttribute.includes(name)) this.props[name] = createReactor(this.attributes[i].nodeValue)
        else this.props[name] = this.attributes[i].nodeValue
      }
      this.props.ref = this
      parent.append(...generateList([], component(this.props as CustomAttribute<T>, Array.from(this.childNodes))))
    }

    connectedCallback() {
      if (isDefined(this.context.mounted)) this.context.mounted!.forEach((handle) => handle())
      this.context.mounted = null
    }

    disconnectedCallback() {
      if (isDefined(this.context.unmounted)) this.context.unmounted!.forEach((handle) => handle())
      this.context.unmounted = null
    }

    attributeChangedCallback(propName: string, prev: string, curr: string) {
      if (prev === curr) return
      this.props[propName](curr)
    }
  }

  customElements.define(name, Component)
}

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

function hComp(
  component: Component,
  props: Props | null,
  display: Reactor<boolean>,
  fallback: JSX.Element,
  children: Array<JSX.Element>
) {
  const properties = Object.assign({}, component.defaultProps, props)
  const context = createComponentContext()
  const element = () => {
    setCurrentContext(context)
    context.hookIndex = 0
    return component(properties, children)
  }

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

  if (isDefined(globalContext.mounted)) globalContext.mounted!.forEach((handle) => handle())
  globalContext.mounted = null
}
