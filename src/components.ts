import { Component } from "../types/app"
import { createReactor, onMounted, onUnmounted } from "./app"
import { generateList } from "./dom"
import { h } from "./web"

export const Dynamic: Component<{
  component?: Component<any> | string
}> = ({ component, ...props }, children) => {
  return h(component!()!, props, children)
}

export const Fragment: Component<{}> = (_, children) => {
  return children
}

export function lazy(callback: (...args: Array<any>) => Promise<any>): Component<{ fallback: JSX.Element }> {
  return ({ fallback, ...props }, children) => {
    const reactor = createReactor(false)
    let content: any

    Promise.all([callback(props, children)]).then((value) => {
      content = value
      reactor(true)
    })

    return reactor.when!(() => content, fallback)
  }
}

export const Portal: Component<{ mount: HTMLElement }> = ({ mount }, children) => {
  const childs = generateList([], children)

  onMounted(() => {
    mount().append(...childs)
  })
  onUnmounted(() => {
    childs.forEach((child) => child.remove())
  })

  return ""
}

Portal.defaultProps = {
  mount: document.body
}
