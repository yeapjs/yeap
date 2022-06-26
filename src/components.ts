import { Component } from "../types/app"
import { createReactor } from "./app"

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
