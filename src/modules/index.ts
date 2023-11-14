import { ModuleContext } from "../../types/modules";
import { getCurrentInternalContext } from "../helpers";

export function getContext(): ModuleContext | null {
    const internalContext = getCurrentInternalContext()
    if (internalContext.global == 1) return null

    internalContext.moduleContext.extracted++
    return internalContext.moduleContext
}
