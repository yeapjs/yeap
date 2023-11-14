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
