import { Children, Component, ComponentMetadata, NoConditionalComponent } from "../types/components"
import { CaseProps } from "../types/components"
import { createContext, createReactor, isReactor, useContext } from "./app"
import { generateDOM } from "./dom"
import { getCurrentContext, isComponent } from "./helpers"
import { h } from "./web"

interface MatchContextValue {
  when: any,
  matched: boolean
}

const MatchContext = createContext<MatchContextValue>()

export function getComponentParent(): NoConditionalComponent | null {
  return getCurrentContext().parent?.component ?? null
}

export function children(callback: () => Array<any>): Children {
  return callback().map((element) =>
    isComponent(element) ? {
      isComponent: true,
      key: element.key,
      props: element.props,
      component: element.component,
      children: element.children,
      element
    } : {
      isComponent: false,
      element
    }
  )
}

export function noconditional<T>(comp: NoConditionalComponent<T>): NoConditionalComponent<T> {
  if (!comp.metadata) comp.metadata = {} as ComponentMetadata
  comp.metadata.noconditional = true
  return comp
}

export const Dynamic: Component<{
  component?: Component<any> | string
}> = ({ component, ...props }, children) => {
  return h(component!, props, children)
}

export const Fragment: Component<{}> = (_, children) => {
  return children
}

export function lazy(callback: (...args: Array<any>) => Promise<any>): Component<{ fallback: any }> {
  return ({ fallback, ...props }, children) => {
    const reactor = createReactor(false)
    let content: any

    Promise.all([callback(props, children)]).then((value) => {
      content = value
      reactor(true)
    })

    return reactor.when(() => content, fallback)
  }
}

export const Portal: Component<{ mount: Element }> = noconditional(({ mount = document.body, when, fallback }, children) => {
  mount.append(...generateDOM([h(Fragment, { when, fallback }, children)], mount))

  return []
})

export const Match: NoConditionalComponent<{ when: any }> = noconditional(({ when }, children) => {
  const value: MatchContextValue = { when, matched: false }

  if (isReactor(when)) when.subscribe(() => {
    value.matched = false
  })

  return h(MatchContext.Provider, { value }, children)
})

export const Case: NoConditionalComponent<CaseProps> = noconditional((props, consequent) => {
  const parent = getComponentParent()
  if (parent !== MatchContext.Provider) {
    throw new Error("A <Case> has to be wrap into a <Match>")
  }

  const match = useContext(MatchContext)

  const isMatch = (v: any) => !match.matched &&
    (props.default ||
      (typeof props.test === "function" ? props.test(v) : props.test === v) ||
      (props.tests?.length && props.tests.some((curr) => typeof curr === "function" ? curr(v) : curr === v)))

  const empty = ""

  if (!isReactor(match.when)) {
    if (isMatch(match.when)) {
      match.matched = true
      return consequent
    }
    return empty
  }

  return match.when.when((v) => isMatch(v), () => {
    match.matched = true
    return consequent
  }, empty)
})
