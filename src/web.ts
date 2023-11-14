import { Reactive, Reactor, ReadOnlyReactor } from "../types/app"
import { NoConditionalComponent } from "../types/components"
import { DefineCustomElementOption, Props } from "../types/web"
import { createComputed, createReactor } from "./app"
import { COMPONENT_SYMBOL, ELEMENT_SYMBOL, SVG_CAMELCASE_ATTR, SVG_TAGS } from "./constantes"
import { generateDOM } from "./dom"
import { DirectiveError, ModifierError } from "./errors"
import { extend } from "./functions"
import { createInternalContext, GLOBAL_CONTEXT, isDefined, isEvent, setCurrentInternalContext, setContextParent, stringify, toArray, getCurrentInternalContext, isDirective, kebabCase, directives, modifiers as modifiersMap, isReactable } from "./helpers"
import { InternalContext } from "./types"
import { reactable, unique, unwrap } from "./utils"

type CustomAttribute<T> = T & { ref?: HTMLElement }

export function define<T>(name: string, component: NoConditionalComponent<CustomAttribute<T>>, { reactiveAttributes, shadowed }: DefineCustomElementOption = {}) {
  class Component extends HTMLElement {
    private props: CustomAttribute<any> = {}
    #context: InternalContext
    #parent: this | ShadowRoot
    #reactiveProps: Record<string, Reactor<string | undefined>>

    static get observedAttributes() { return reactiveAttributes ?? [] }

    constructor() {
      super()
      this.#context = createInternalContext(component, {
        element: this,
        mode: shadowed ?? false
      })
      this.#context.global = 2
      this.#context.element = this
      this.#context.parent = undefined
      this.#context.highestContext = undefined
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
            if (component.attributeTypes![name] === Number || component.attributeTypes![name] === BigInt) return component.attributeTypes![name](value)
            else if (component.attributeTypes![name] === Boolean) return this.hasAttribute(name)
            return component.attributeTypes![name](this, value)
          })
          else this.props[name] = this.#reactiveProps[name].reader()
        } else if (component.attributeTypes && name in component.attributeTypes) {
          if (Number === component.attributeTypes[name] || BigInt === component.attributeTypes[name]) this.props[name] = component.attributeTypes[name](value)
          else if (component.attributeTypes[name] === Boolean) this.props[name] = true
          else this.props[name] = component.attributeTypes[name](this, value)
        } else this.props[name] = value
      }

      for (const name in this.#reactiveProps) {
        if (name in this.props) continue

        if (component.attributeTypes && name in component.attributeTypes) this.props[name] = this.#reactiveProps[name].compute((value) => {
          if (component.attributeTypes![name] === Number || component.attributeTypes![name] === BigInt) return component.attributeTypes![name](value)
          else if (component.attributeTypes![name] === Boolean) return this.hasAttribute(name)
          return component.attributeTypes![name](this, value)
        })
        else this.props[name] = this.#reactiveProps[name].reader()
      }

      this.props.ref = this

      setContextParent(this.#context)
      this.#parent.append(...generateDOM(
        toArray(hComp(component, this.props, null, Array.from(this.childNodes))),
        this.#parent as Element
      ))
      this.#context.mounted.forEach((handle) => handle())
    }

    disconnectedCallback() {
      this.#context.unmounted.forEach((handle) => handle())
    }

    attributeChangedCallback(propName: string, prev: string, curr: string) {
      if (prev === curr) return

      this.#reactiveProps[propName](curr)
    }
  }

  customElements.define(name, Component)

  return () => new Component()
}

type ElementGiver<E, F> = (...args: any[]) => E | F | ReadOnlyReactor<E | F>

export function h(tag: NoConditionalComponent<any> | (() => JSX.Element) | string, props: Props | null, ...children: Array<JSX.Element>): ElementGiver<HTMLElement | SVGElement, Array<any>> | ((...args: any[]) => ElementGiver<HTMLElement | SVGElement, Array<any>>) {
  if (!isDefined(props)) props = {}

  const fallback = toArray(props!["fallback"] ?? [new Text()])

  if (tag instanceof Function) return hComp(tag, props, fallback, children)

  const display = createReactor(true)
  if ("when" in props!) {
    if (isReactable(props["when"])) {
      reactable(props["when"]).subscribe((_: any, curr: any) => display(!!curr))
      display(!!props["when"]())
    } else display(!!props["when"])
  }

  const is = props?.is?.toString()
  const element = SVG_TAGS.has(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag, { is })

  for (const prop in props) {
    if (!isDefined(props[prop]) || prop === "key" || prop === "is" || prop === "fallback" || prop === "when") continue
    else if (prop === "ref") {
      props[prop](element)
    } else if (prop === "class" || prop === "className") {
      element.classList.add(...props[prop].split(" "))
    } else if (prop === "classList") {
      const classList = props[prop]
      for (const item in classList) {
        if (isReactable(classList[item])) reactable(classList[item]).subscribe((_: any, curr: any) => {
          if (!!curr) element.classList.add(item)
          else element.classList.remove(item)
        })

        if (!!unwrap(classList[item])) element.classList.add(item)
      }
    } else if (prop === "dangerouslySetInnerHTML") {
      const value = props[prop]?.__html
      if (!value) continue

      if (isReactable(value)) reactable<string>(value).subscribe((_, curr) => element.innerHTML = curr)
      element.innerHTML = unwrap(value)
    } else if (prop === "style") {
      const style = props[prop]
      for (const item in style) {
        if (isReactable(style[item])) reactable(style[item]).subscribe((_: any, curr: any) => {
          element.style.setProperty(item, curr)
          element.style[item as any] = curr
        })
        element.style.setProperty(item, unwrap<string>(style[item])!)
        element.style[item as any] = unwrap<string>(style[item])!
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
      const attributeName = SVG_TAGS.has(tag) && !SVG_CAMELCASE_ATTR.has(prop) ? kebabCase(prop) : prop
      if (isReactable(props[prop])) reactable(props[prop]).subscribe((_: any, curr: any) => {
        if (prop in element && writable) {
          if (isDefined(curr) && curr !== false) (element as any)[prop] = curr === true ? "" : stringify(curr)
          else (element as any)[prop] = undefined
        }
        if (isDefined(curr) && curr !== false) element.setAttribute(attributeName, curr === true ? "" : stringify(curr))
        else element.removeAttribute(prop)
      })

      if (isDefined(unwrap(props[prop])) && unwrap(props[prop]) !== false) {
        if (prop in element) try {
          (element as any)[prop] = unwrap(props[prop]) === true ? "" : stringify(unwrap(props[prop]))
        } catch (error) {
          writable = false
        }
        element.setAttribute(attributeName, unwrap(props[prop]) === true ? "" : stringify(unwrap(props[prop])))
      }
    }
  }

  return extend(unique(() => {
    const context = getCurrentInternalContext()
    context.htmlConditions.push(display)
    element.append(...generateDOM(children, element))

    if ("when" in props! && isReactable(props["when"])) return display.when(element, fallback)

    return display() ? element : fallback
  }), {
    [ELEMENT_SYMBOL]: true,
    key: props!["key"]
  })
}

function hComp(
  component: NoConditionalComponent<any>,
  props: Props | null,
  fallback: any,
  children: Array<JSX.Element>
): ElementGiver<HTMLElement, any> {
  const properties = Object.assign({}, component.defaultProps, props)

  component.metadata = {
    noconditional: false,
    ...component.metadata
  }

  return extend(unique((parent: Element, previousSibling?: Element | Text) => {
    const context = createInternalContext(component, null)

    context.moduleContext.props = properties
    if ("when" in props! && !component.metadata?.noconditional) context.assemblyCondition = props["when"]

    const allConditions: Array<Reactive<boolean>> = []
    let currentContext: InternalContext | undefined = context

    while (currentContext) {
      if (currentContext.assemblyCondition === false) return fallback
      if (isReactable(currentContext.assemblyCondition)) allConditions.push(reactable(currentContext.assemblyCondition))
      allConditions.push(...currentContext.htmlConditions)
      currentContext = currentContext.parent
    }

    let toMount = true
    let dom: Array<Element | Text>
    let domFallback: Array<Element | Text>

    const element = createComputed(() => {
      setCurrentInternalContext(context)
      if (!allConditions.some((reactive) => !reactive())) {
        if (dom) {
          if (toMount) {
            context.mounted.forEach((handle) => handle())
            toMount = false
          }

          return dom
        }

        setContextParent(context)
        context.hookIndex = 0
        const elements = toArray(component(properties, children))
        dom = generateDOM(elements, parent, previousSibling)

        context.mounted.forEach((handle) => handle())
        toMount = false

        setCurrentInternalContext(context.parent!)
        setContextParent(context.parent!)

        return dom
      } else {
        if (!toMount) {
          context.unmounted.forEach((handle) => handle())
          toMount = true
        }

        if (!domFallback) domFallback = generateDOM(toArray(fallback), parent, previousSibling)
        return domFallback
      }
    }, { unsubscription: false }, ...allConditions)

    return allConditions.length === 0 ? element() : element
  }), {
    key: props!["key"],
    [COMPONENT_SYMBOL]: true,
    props,
    component,
    children,
  })
}

export function render(children: JSX.Element, container: HTMLElement | SVGElement) {
  container.append(...generateDOM(toArray(children), container))

  GLOBAL_CONTEXT.mounted.forEach((handle) => handle())
  GLOBAL_CONTEXT.mounted = []
}
