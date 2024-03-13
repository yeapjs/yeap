import { ModuleContext } from "../../types/modules"
import { createPersistentReactor } from "../app"
import { ContextLevel, getCurrentInternalContext } from "../helpers"

export * from "./css"

export function getContext(): ModuleContext | null {
    const internalContext = getCurrentInternalContext()
    if (internalContext.level == ContextLevel.global) return null

    internalContext.moduleContext.extracted++
    return internalContext.moduleContext
}

export function onElementCreation(handler: (el: HTMLElement) => void) {
    const first = createPersistentReactor(true)

    if (!first(false)) return

    const internalContext = getCurrentInternalContext()
    internalContext.events.push("element-creation", handler)
}

export function onElementPopulate(handler: (el: HTMLElement) => void) {
    const first = createPersistentReactor(true)

    if (!first(false)) return

    const internalContext = getCurrentInternalContext()
    internalContext.events.push("element-populate", handler)
}
