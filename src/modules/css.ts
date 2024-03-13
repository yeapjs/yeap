import { CSSError } from "../errors"
import { getContext } from "./index"

export function css(value: string) {
    const context =  getContext()
    if (context === null || context.webComponent === null)
        throw new CSSError("The css module is usable only in a web component.")

    const style = document.createElement("style")
    style.innerText = value;

    context.webComponent.element.appendChild(style)
}
