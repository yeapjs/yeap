import { Component, Function, Reactive } from "../types/app"
import { DefineCustomElementOption, Props } from "../types/web"
import { createComputed, createReactor, isReactor } from "./app"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL } from "./constantes"
import { generateList } from "./dom"
import { ModifierError } from "./errors"
import { ComponentContext, createComponentContext, getValue, GLOBAL_CONTEXT, isDefined, isEvent, isSVGTag, setCurrentContext, setContextParent, stringify, toArray, getCurrentContext } from "./utils"

type CustomAttribute<T> = T & { ref?: HTMLElement }
export type ComponentCaller = Function & {
  key: any
  [COMPONENT_SYMBOL]: true
}
export type ElementCaller = Function & {
  key: any
  [ELEMENT_SYMBOL]: true
}

export function define<T>(name: string, component: Component<CustomAttribute<T>>, { reactiveAttributes, shadowed }: DefineCustomElementOption = {}) {
  class Component extends HTMLElement {
    private props: CustomAttribute<Props> = {}
    #context: ComponentContext
    #parent: this | ShadowRoot

    static get observedAttributes() { return reactiveAttributes ?? [] }

    constructor() {
      super()
      this.#context = createComponentContext()
      this.#context.element = this
      this.#context.parent = undefined
      this.#parent = shadowed ? this.attachShadow({ mode: shadowed }) : this
    }

    connectedCallback() {
      for (const reactiveAttribute of reactiveAttributes ?? []) {
        this.props[reactiveAttribute] = createReactor((component.defaultProps as any)?.[reactiveAttribute] ?? null)
      }

      for (let i = 0; i < this.attributes.length; i++) {
        const name = this.attributes[i].nodeName
        if (reactiveAttributes && reactiveAttributes.includes(name)) continue
        else this.props[name] = this.attributes[i].nodeValue
      }

      this.props.ref = this

      this.#parent.append(...generateList(
        [],
        this.#parent as Element,
        toArray(
          component(
            this.props as CustomAttribute<T>,
            Array.from(this.childNodes)
          )
        )
      ))
      if (isDefined(this.#context.mounted)) this.#context.mounted!.forEach((handle) => handle())
      this.#context.mounted = null
    }

    disconnectedCallback() {
      if (isDefined(this.#context.unmounted)) this.#context.unmounted!.forEach((handle) => handle())
      this.#context.unmounted = null
    }

    attributeChangedCallback(propName: string, prev: string, curr: string) {
      if (prev === curr) return
      if (!(propName in this.props)) this.props[propName] = createReactor()

      this.props[propName](curr)
    }
  }

  customElements.define(name, Component)
}

export function children(callback: () => Array<JSX.Element>) {
  return () => generateList(
    [],
    document.createElement("div"),
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
    if (!isDefined(props[prop]) || prop === "key" || prop === "is" || prop === "fallback" || prop === "when") continue
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
    } else if (prop === "dangerouslySetInnerHTML") {
      const value = props[prop]?.__html
      if (!value) continue

      if (isReactor(value)) value.subscribe((_, curr) => element.innerHTML = curr)
      element.innerHTML = getValue(value)
    } else if (prop === "style") {
      const style = props[prop]
      for (const item in style) {
        if (isReactor(style[item])) style[item].subscribe((_: any, curr: any) => element.style.setProperty(item, curr))
        element.style.setProperty(item, getValue<string>(style[item])!)
      }
    } else if (isEvent(prop)) {
      const [eventName, ...modifiers] = prop.slice(2).toLowerCase().split(":")

      let option = {}
      for (const modifierName of modifiers) {
        if (!GLOBAL_CONTEXT.modifiers?.has(modifierName)) throw new ModifierError(`the event modifier ${modifierName} does not exist`)

        const modifier = GLOBAL_CONTEXT.modifiers?.get(modifierName)
        if (typeof modifier === "object") option = { ...option, ...modifier }
      }

      element.addEventListener(eventName, (e) => {
        for (const modifierName of modifiers) {
          if (!GLOBAL_CONTEXT.modifiers?.has(modifierName)) throw new ModifierError(`the event modifier ${modifierName} does not exist`)

          const modifier = GLOBAL_CONTEXT.modifiers?.get(modifierName)
          if (typeof modifier === "function") modifier(e)
        }
        props![prop](e)
      }, option)
    } else {
      if (isReactor(props[prop])) props[prop].subscribe((_: any, curr: any) => {
        if (prop in element) {
          if (isDefined(curr) && curr !== false) (element as any)[prop] = curr === true ? "" : stringify(curr)
          else (element as any)[prop] = undefined
        }
        if (isDefined(curr) && curr !== false) element.setAttribute(prop, curr === true ? "" : stringify(curr))
        else element.removeAttribute(prop)
      })

      if (isDefined(getValue(props[prop])) && getValue(props[prop]) !== false) {
        if (prop in element) (element as any)[prop] = getValue(props[prop]) === true ? "" : stringify(getValue(props[prop]))
        element.setAttribute(prop, getValue(props[prop]) === true ? "" : stringify(getValue(props[prop])))
      }
    }
  }

  const createElement: ElementCaller = function createElement() {
    const context = getCurrentContext()
    context.htmlConditions.push(display)
    element.append(...generateList([], element, toArray(children)))

    if ("when" in props! && isReactor(props["when"])) return display.when(element, fallback)
    return display() ? element : fallback
  } as any

  createElement.key = props!["key"]
  createElement[ELEMENT_SYMBOL] = true

  return createElement
}

function hComp(
  component: Component,
  props: Props | null,
  fallback: any,
  children: Array<JSX.Element>
) {
  const properties = Object.assign({}, component.defaultProps, props)
  let reactive: Reactive<any>

  const createComponent: ComponentCaller = function createComponent() {
    if (reactive) return reactive

    const context = createComponentContext()
    context.props = properties
    if ("when" in props!) context.condition = props["when"]

    const allConditions: Array<Reactive<boolean>> = []
    let currentContext = context

    while (currentContext.parent) {
      if (currentContext.condition === false) return fallback
      if (isReactor(currentContext.condition)) allConditions.push(currentContext.condition)
      allConditions.push(...currentContext.htmlConditions)
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

  createComponent.key = props!["key"]
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
  container.append(...generateList([], container, toArray(children)))

  if (isDefined(GLOBAL_CONTEXT.mounted)) GLOBAL_CONTEXT.mounted!.forEach((handle) => handle())
  GLOBAL_CONTEXT.mounted = null
}
