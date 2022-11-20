import { Component, ComponentMetadata } from "../types/app"
import { createContext, createReactor, isReactor, onMounted, onUnmounted, useContext } from "./app"
import { generateList } from "./dom"
import { h } from "./web"

interface MatchContextValue {
  when: any,
  matched: boolean
}

const MatchContext = createContext<MatchContextValue>()

export function noconditional<T>(comp: Component<T>): Component<T> {
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

export const Portal: Component<{ mount: Element }> = ({ mount = document.body }, children) => {
  const childs = generateList([], mount, children)

  onMounted(() => {
    mount.append(...childs)
  })
  onUnmounted(() => {
    childs.forEach((child) => child.remove())
  })

  return []
}

export const Match: Component<{}> = noconditional(({ when }, children) => {
  const value: MatchContextValue = { when, matched: false }

  if (isReactor(when)) when.subscribe(() => {
    value.matched = false
  })

  return h(MatchContext.Provider, { value }, children)
})

export const Case: Component<{ default: false, test: any } | { default: true }> = noconditional((props, consequent) => {
  const match = useContext(MatchContext)

  if (!match) {
    throw new Error("A <Case> has to be wrap into a <Match>")
  }

  const empty = ""

  if (!isReactor(match.when)) {
    if ((props.default || match.when == props.test) && !match.matched) {
      match.matched = true
      return consequent
    }
    return empty
  }

  return match.when.when((v) => (props.default || v === props.test) && !match.matched, () => {
    match.matched = true
    return consequent
  }, empty)
})
