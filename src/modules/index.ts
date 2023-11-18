import { ModuleContext } from "../../types/modules";
import { ContextLevel, getCurrentInternalContext } from "../helpers";

export function getContext(): ModuleContext | null {
    const internalContext = getCurrentInternalContext()
    if (internalContext.level == ContextLevel.global) return null

    internalContext.moduleContext.extracted++
    return internalContext.moduleContext
}
