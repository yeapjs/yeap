import { NoConditionalComponent } from "./components"

export interface ModuleContext {
    webComponent: {
        element: HTMLElement
        mode: "closed" | "open" | false
    } | null
    props: Record<string, any>
    component: NoConditionalComponent<object>,
    extracted: number
}

export function getContext(): ModuleContext | null
export function onElementCreation(handler: (el: HTMLElement) => void): void
export function onElementPopulate(handler: (el: HTMLElement) => void): void

// CSS MODULE
export function css(value: string): void
