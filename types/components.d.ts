import { Component, ToReactive } from "./app"

export const Fragment: Component<{}>

export function lazy<T>(callback: (props: ToReactive<T>, children: Array<JSX.Element>) => Promise<any>): Component<{ fallback: JSX.Element } & T>
