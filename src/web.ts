import { Component, Reactive } from "../types/app"
import { DefineCustomElementOption, Props } from "../types/web"
import { createComputed, createReactor, isReactor } from "./app"
import { COMPONENT_SYMBOL } from "./constantes"
import { generateList } from "./dom"
import { ComponentContext, createComponentContext, getValue, GLOBAL_CONTEXT, isDefined, isEvent, isSVGTag, setCurrentContext, setContextParent, stringify, toArray, getCurrentContext } from "./utils"

type CustomAttribute<T> = T & { ref?: HTMLElement }
export interface ComponentCaller extends Function {
  [COMPONENT_SYMBOL]: true
}

export function define<T>(name: string, component: Component<CustomAttribute<T>>, { reactiveAttributes, shadowed }: DefineCustomElementOption) {
  class Component extends HTMLElement {
    private props: CustomAttribute<Props> = {}
    #context: ComponentContext

    static get observedAttributes() { return reactiveAttributes ?? [] }

    constructor() {
      super()
      this.#context = createComponentContext()
      this.#context.parent = undefined
      const parent = shadowed ? this.attachShadow({ mode: shadowed }) : this

      for (const reactiveAttribute of reactiveAttributes ?? []) {
        if (component.defaultProps && reactiveAttribute in component.defaultProps) this.props[reactiveAttribute] = createReactor((component.defaultProps as any)[reactiveAttribute] ?? null)
      }

      for (let i = 0; i < this.attributes.length; i++) {
        const name = this.attributes[i].nodeName
        if (reactiveAttributes && reactiveAttributes.includes(name)) continue
        else this.props[name] = this.attributes[i].nodeValue
      }

      this.props.ref = this
      parent.append(...generateList(
        [],
        toArray(
          component(
            this.props as CustomAttribute<T>,
            Array.from(this.childNodes)
          )
        )
      ))
    }

    connectedCallback() {
      if (isDefined(this.#context.mounted)) this.#context.mounted!.forEach((handle) => handle())
      this.#context.mounted = null
    }

    disconnectedCallback() {
      if (isDefined(this.#context.unmounted)) this.#context.unmounted!.forEach((handle) => handle())
      this.#context.unmounted = null
    }

    attributeChangedCallback(propName: string, prev: string, curr: string) {
      if (prev === curr) return
      this.props[propName](curr)
    }
  }

  customElements.define(name, Component)
}

export function children(callback: () => Array<JSX.Element>) {
  return () => generateList(
    [],
    callback()
  )
}

export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>) {
  if (!isDefined(props)) props = {}

  const fallback = toArray(props!["fallback"] ?? [new Text()])

  if (typeof tag === "function") return hComp(tag, props, fallback, children)

  const display = createReactor(true)
  if ("when" in props!) {
    if (isReactor(props["when"])) props["when"].subscribe((_: any, curr: any) => display(!!curr))
    display(!!getValue(props["when"]))
  }

  const is = props?.is?.toString()
  const element = isSVGTag(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag, { is })

  for (const prop in props) {
    if (!isDefined(props[prop]) || prop === "is" || prop === "fallback" || prop === "when") continue
    else if (prop === "ref") {
      props[prop](element)
    } else if (prop === "class") {
      element.classList.add(props[prop].split(" "))
    } else if (prop === "classList") {
      const classList = props[prop]
      for (const item in classList) {
        if (isReactor(classList[item])) classList[item].subscribe((_: any, curr: any) => {
          if (!!curr) element.classList.add(item)
          else element.classList.remove(item)
        })

        if (!!getValue(classList[item])) element.classList.add(item)
      }
    } else if (prop === "style") {
      const style = props[prop]
      for (const item in style) {
        if (isReactor(style[item])) style[item].subscribe((_: any, curr: any) => element.style.setProperty(item, curr))
        element.style.setProperty(item, getValue<string>(style[item])!)
      }
    } else if (isEvent(prop)) {
      element.addEventListener(prop.slice(2).toLowerCase(), props[prop] as EventListenerOrEventListenerObject)
    } else {
      if (isReactor(props[prop])) props[prop].subscribe((_: any, curr: any) => {
        if (isDefined(curr) && curr !== false) element.setAttribute(prop, curr === true ? "" : stringify(curr))
        else element.removeAttribute(prop)
      })

      if (isDefined(getValue(props[prop])) && getValue(props[prop]) !== false) element.setAttribute(prop, getValue(props[prop]) === true ? "" : stringify(getValue(props[prop])))
    }
  }

  element.append(...generateList([], toArray(children)))

  if ("when" in props! && isReactor(props["when"])) return display.when(element, fallback)
  return display() ? element : fallback
}

function hComp(
  component: Component,
  props: Props | null,
  fallback: JSX.Element,
  children: Array<JSX.Element>
) {
  const properties = Object.assign({}, component.defaultProps, props)
  let reactive: Reactive<any>

  const createComponent: ComponentCaller = function createComponent() {
    if (reactive) return reactive

    const context = createComponentContext()
    if ("when" in props!) context.condition = props["when"]

    const allConditions: Array<Reactive<boolean>> = []
    let currentContext = context

    while (currentContext.parent) {
      if (currentContext.condition === false) return fallback
      if (isReactor(currentContext.condition)) allConditions.push(currentContext.condition)
      currentContext = currentContext.parent
    }

    let toMount = true

    reactive = createComputed(() => {
      setCurrentContext(context)
      if (!allConditions.some((reactive) => !reactive())) {
        setContextParent(context)
        context.hookIndex = 0
        const elements = component(properties, children)

        if (toMount) {
          mount(context)
          toMount = false
        }
        setCurrentContext(context.parent!)
        setContextParent(context.parent!)

        return elements
      } else {
        if (!toMount) {
          unmount(context)
          toMount = true
        }
        return fallback
      }
    }, { unsubscription: false }, ...allConditions)

    return reactive
  } as any

  createComponent[COMPONENT_SYMBOL] = true

  return createComponent
}

function mount(context: ComponentContext) {
  if (isDefined(context.mounted)) context.mounted!.forEach((handle) => handle())
}
function unmount(context: ComponentContext) {
  if (isDefined(context.unmounted)) context.unmounted!.forEach((handle) => handle())
}

export function render(children: Array<JSX.Element>, container: HTMLElement | SVGElement) {
  container.append(...generateList([], toArray(children)))

  if (isDefined(GLOBAL_CONTEXT.mounted)) GLOBAL_CONTEXT.mounted!.forEach((handle) => handle())
  GLOBAL_CONTEXT.mounted = null
}
