import { Component, ComponentMetadata, ComponentProps, NoConditionalComponent } from "../types/components"
import { CaseProps } from "../types/components"
import { createContext, createReactor, isReactor, useContext } from "./app"
import { MANIPULABLE_SYMBOL } from "./constantes"
import { generateDOM } from "./dom"
import { getCurrentInternalContext, isComponent, isElement } from "./helpers"
import { Children } from "./types"
import { reactable } from "./utils"
import { h } from "./web"

interface MatchContextValue {
  when: any,
  matched: boolean
}

const MatchContext = createContext<MatchContextValue>()

export function getComponentParent(): NoConditionalComponent<any> | null {
  return getCurrentInternalContext().parent?.moduleContext.component ?? null
}

export function getChildrenInfos(callback: () => Array<unknown>): Children {
  let childrenInfos: Children = []
  for (const child of callback()) {
    if (isComponent(child)) childrenInfos = [...childrenInfos, {
      [MANIPULABLE_SYMBOL]: true,
      isComponent: true,
      isHTML: false,
      key: child.key,
      props: child.props,
      component: child.component,
      children: child.children,
      element: child
    }]
    else if (isElement(child)) childrenInfos = [...childrenInfos, {
      [MANIPULABLE_SYMBOL]: true,
      isComponent: false,
      isHTML: true,
      element: child
    }]
    else if (Array.isArray(child)) childrenInfos = [...childrenInfos, ...getChildrenInfos(() => child)]
    else childrenInfos = [...childrenInfos, {
      [MANIPULABLE_SYMBOL]: true,
      isComponent: false,
      isHTML: false,
      element: child
    }]
  }
  return childrenInfos
}

export function noconditional<T extends object>(comp: NoConditionalComponent<T>): NoConditionalComponent<T> {
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

export function lazy<T, U>(callback: (props: ComponentProps<T>, children: Array<JSX.Element>) => Promise<U>): Component<T & { fallback: JSX.Element }> {
  return ({ fallback, ...props }, children) => {
    const content = createReactor<U | null>(null)

    Promise.all([callback(props as ComponentProps<T>, children)]).then(([value]) => content(value))

    return content
  }
}

export const Portal: Component<{ mount: Element }> = noconditional(({ mount = document.body, when, fallback }, children) => {
  mount.append(...generateDOM([h(Fragment, { when, fallback }, children)], mount))

  return []
})

export const Match: NoConditionalComponent<{ when: any }> = noconditional(({ when }, children) => {
  const value: MatchContextValue = { when: reactable(when), matched: false }

  if (isReactor(when)) value.when.subscribe(() => {
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
