import { Reactive, Reactor } from "../types/app"
import { NoConditionalComponent } from "../types/components"
import { DefineCustomElementOption, HElement, Props } from "../types/web"
import { createComputed, createReactor, isReactor } from "./app"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL } from "./constantes"
import { generateList } from "./dom"
import { DirectiveError, ModifierError } from "./errors"
import { createComponentContext, getValue, GLOBAL_CONTEXT, isDefined, isEvent, isSVGTag, setCurrentContext, setContextParent, stringify, toArray, getCurrentContext, isDirective, isSVGCamelCaseAttr, kebabCase, directives, modifiers as modifiersMap } from "./helpers"
import { ComponentCaller, ComponentContext, ElementCaller } from "./types"
import { unique } from "./utils"

type CustomAttribute<T> = T & { ref?: HTMLElement }

export function define<T>(name: string, component: NoConditionalComponent<CustomAttribute<T>>, { reactiveAttributes, shadowed }: DefineCustomElementOption = {}) {
  class Component extends HTMLElement {
    private props: CustomAttribute<any> = {}
    #context: ComponentContext
    #parent: this | ShadowRoot
    #reactiveProps: Record<string, Reactor<string | undefined>>

    static get observedAttributes() { return reactiveAttributes ?? [] }

    constructor() {
      super()
      this.#context = createComponentContext()
      this.#context.element = this
      this.#context.parent = undefined
      this.#parent = shadowed ? this.attachShadow({ mode: shadowed }) : this
      this.#reactiveProps = {}
    }

    connectedCallback() {
      for (const reactiveAttribute of reactiveAttributes ?? []) {
        this.#reactiveProps[reactiveAttribute] = createReactor<string>((component.defaultProps as any)?.[reactiveAttribute] ?? undefined)
      }

      for (let i = 0; i < this.attributes.length; i++) {
        const name = this.attributes[i].nodeName
        const value = this.attributes[i].nodeValue
        if (component.attributeTypes && reactiveAttributes && reactiveAttributes.includes(name)) {
          if (name in component.attributeTypes) this.props[name] = this.#reactiveProps[name].compute((value) => {
            if ([Number, BigInt].includes(component.attributeTypes![name] as any)) return component.attributeTypes![name](value)
            else if (component.attributeTypes![name] === Boolean) return this.hasAttribute(name)
            return component.attributeTypes![name](this, value)
          })
          else this.props[name] = this.#reactiveProps[name].reader()
        } else if (component.attributeTypes && name in component.attributeTypes) {
          if ([Number, BigInt].includes(component.attributeTypes[name] as any)) this.props[name] = component.attributeTypes[name](value)
          else if (component.attributeTypes[name] === Boolean) this.props[name] = true
          else this.props[name] = component.attributeTypes[name](this, value)
        } else this.props[name] = value
      }

      for (const name in this.#reactiveProps) {
        if (name in this.props) continue

        if (component.attributeTypes && name in component.attributeTypes) this.props[name] = this.#reactiveProps[name].compute((value) => {
          if ([Number, BigInt].includes(component.attributeTypes![name] as any)) return component.attributeTypes![name](value)
          else if (component.attributeTypes![name] === Boolean) return this.hasAttribute(name)
          return component.attributeTypes![name](this, value)
        })
        else this.props[name] = this.#reactiveProps[name].reader()
      }

      this.props.ref = this

      this.#parent.append(...generateList(
        [],
        this.#parent as Element,
        toArray(
          component(
            this.props,
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

      this.#reactiveProps[propName](curr)
    }
  }

  customElements.define(name, Component)

  return () => new Component()
}

export function children(callback: () => Array<JSX.Element>) {
  return () => generateList(
    [],
    document.createElement("div"),
    callback()
  )
}

export function h(tag: NoConditionalComponent | Function | string, props: Props | null, ...children: Array<JSX.Element>): HElement<HTMLElement> | (() => HElement<HTMLElement>) {
  if (!isDefined(props)) props = {}

  const fallback = toArray(props!["fallback"] ?? [new Text()])

  if (tag instanceof Function) return hComp(tag as any, props, fallback, children)

  const display = createReactor(true)
  if ("when" in props!) {
    if (isReactor(props["when"])) {
      props["when"].subscribe((_: any, curr: any) => display(!!curr))
      display(!!props["when"]())
    }
    else if (props["when"] instanceof Function) {
      const when = createComputed(props["when"])
      when.subscribe((_: any, curr: any) =>
        display(!!curr)
      )
      display(!!when())
    } else display(!!props["when"])
  }

  const is = props?.is?.toString()
  const element = isSVGTag(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag, { is })

  for (const prop in props) {
    if (!isDefined(props[prop]) || prop === "key" || prop === "is" || prop === "fallback" || prop === "when") continue
    else if (prop === "ref") {
      props[prop](element)
    } else if (prop === "class" || prop === "className") {
      element.classList.add(...props[prop].split(" "))
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
        if (!modifiersMap.has(modifierName)) throw new ModifierError(`the event modifier ${modifierName} does not exist`)

        const modifier = modifiersMap.get(modifierName)
        if (typeof modifier === "object") option = { ...option, ...modifier }
      }

      element.addEventListener(eventName, (e: Event) => {
        for (const modifierName of modifiers) {
          const modifier = modifiersMap.get(modifierName)
          if (modifier instanceof Function) modifier(e)
        }

        if (props![prop] instanceof Function) props![prop](e)
        else {
          const [fn, ...args] = props![prop]

          fn(...args)
        }
      }, option)
    } else if (isDirective(prop)) {
      const [directiveName, ...rest] = prop.slice(4).toLowerCase().split(":")
      if (rest.length > 0) throw new DirectiveError('syntax error "use:" can be take only one directive')
      if (!directives.has(directiveName)) throw new DirectiveError(`the directive ${directiveName} does not exist`)

      const directive = directives.get(directiveName)!
      directive(element, props[prop])
    } else {
      let writable = true
      const attributeName = isSVGTag(tag) && !isSVGCamelCaseAttr(prop) ? kebabCase(prop) : prop
      if (isReactor(props[prop])) props[prop].subscribe((_: any, curr: any) => {
        if (prop in element && writable) {
          if (isDefined(curr) && curr !== false) (element as any)[prop] = curr === true ? "" : stringify(curr)
          else (element as any)[prop] = undefined
        }
        if (isDefined(curr) && curr !== false) element.setAttribute(attributeName, curr === true ? "" : stringify(curr))
        else element.removeAttribute(prop)
      })

      if (isDefined(getValue(props[prop])) && getValue(props[prop]) !== false) {
        if (prop in element) try {
          (element as any)[prop] = getValue(props[prop]) === true ? "" : stringify(getValue(props[prop]))
        } catch (error) {
          writable = false
        }
        element.setAttribute(attributeName, getValue(props[prop]) === true ? "" : stringify(getValue(props[prop])))
      }
    }
  }

  const createElement = unique(() => {
    const context = getCurrentContext()
    context.htmlConditions.push(display)
    element.append(...generateList([], element, toArray(children)))

    if ("when" in props! && (isReactor(props["when"]) || props["when"] instanceof Function)) return display.when(element, fallback)

    return display() ? element : fallback
  }) as ElementCaller

  createElement.key = props!["key"]
  createElement[ELEMENT_SYMBOL] = true

  return createElement as any
}

function hComp(
  component: NoConditionalComponent,
  props: Props | null,
  fallback: any,
  children: Array<JSX.Element>
): () => HElement<HTMLElement> {
  const properties = Object.assign({}, component.defaultProps, props)

  component.metadata = {
    noconditional: false,
    ...component.metadata
  }

  const createComponent = unique(() => {
    const context = createComponentContext()

    context.props = properties
    if ("when" in props! && !component.metadata?.noconditional) context.condition = props["when"]

    const allConditions: Array<Reactive<boolean>> = []
    let currentContext = context

    while (currentContext.parent) {
      if (currentContext.condition === false) return fallback
      if (isReactor(currentContext.condition)) allConditions.push(currentContext.condition)
      allConditions.push(...currentContext.htmlConditions)
      currentContext = currentContext.parent
    }

    let toMount = true

    const element = createComputed(() => {
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

        return [elements]
      } else {
        if (!toMount) {
          unmount(context)
          toMount = true
        }
        return fallback
      }
    }, { unsubscription: false }, ...allConditions)

    return allConditions.length === 0 ? element() : element
  }) as ComponentCaller

  createComponent.key = props!["key"]
  createComponent[COMPONENT_SYMBOL] = true

  return createComponent as any
}

function mount(context: ComponentContext) {
  if (isDefined(context.mounted)) context.mounted!.forEach((handle) => handle())
}
function unmount(context: ComponentContext) {
  if (isDefined(context.unmounted)) context.unmounted!.forEach((handle) => handle())
}

export function render(children: JSX.Element, container: HTMLElement | SVGElement) {
  container.append(...generateList([], container, toArray(children)))

  if (isDefined(GLOBAL_CONTEXT.mounted)) GLOBAL_CONTEXT.mounted!.forEach((handle) => handle())
  GLOBAL_CONTEXT.mounted = null
}
