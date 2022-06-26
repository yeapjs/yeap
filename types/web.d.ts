import { Component } from "./app"

interface Props { [key: string]: EventListenerOrEventListenerObject | any }

export function define<T>(name: string, component: Component<T & { ref: HTMLElement }>): void

export function h(tag: Component | string, props: Props | null, ...children: Array<JSX.Element>): JSX.Element

export function render(children: Array<JSX.Element>, container: HTMLElement): void