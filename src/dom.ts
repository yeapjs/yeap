import { Reactive } from "../types/app"
import { isReactor } from "./app"
import { batch, isDefined, isJSXElement, stringify, toArray } from "./utils"

type HTMLContainer = Array<Element | Text>

export function generateDOM(content: any): Element | Text {
  if (content instanceof HTMLElement) return content
  return document.createTextNode(stringify(content))
}

export function generateList(container: HTMLContainer, parent: Element, children: Array<JSX.Element>): HTMLContainer {
  for (const child of children) {
    if (child instanceof Element || child instanceof Text) container = [...container, child]
    else if (child instanceof Array) container = [...generateList(container, parent, child)]
    else if (isReactor(child)) container = [...container, ...reconcileReactor(parent, child)]
    else if (isJSXElement(child)) container = [...generateList(container, parent, toArray(child()))]
    else container = [...container, generateDOM(child)]
  }

  return container
}

function reconcileReactor<T extends JSX.Element>(parent: Element, reactor: Reactive<T>) {
  let values = toArray(reactor())
  let elements = generateList([], parent, values)

  let prevValue: T | null = null

  const callback = batch((prev, curr) => {
    prev = prevValue ?? prev
    prevValue = null

    if (prev === curr) return

    const newValues = toArray(curr)
    const length = Math.max(newValues.length, values.length)

    let newElements: HTMLContainer = []
    let prevElement: Element | Text | null = null
    for (let i = 0; i < length; i++) {
      const oldValue = values[i]
      const newValue = newValues[i]

      const oldKey = (oldValue as any)?.key ?? oldValue
      const newKey = (newValue as any)?.key ?? newValue

      if (oldKey === newKey) {
        newElements = [...newElements, elements[i]]
      } else if (isDefined(oldKey) && isDefined(newKey)) {
        const oldElement = elements[i]
        const newElement = generateList([], parent, [newValue])

        oldElement.replaceWith(...newElement)
        oldElement.remove()
        newElements = [...newElements, ...newElement]
      } else if (!isDefined(oldKey) && isDefined(newKey)) {
        const newElement = generateList([], parent, [newValue])

        if (isDefined(prevElement)) prevElement!.after(...newElement)
        else parent.prepend(...newElement)
        newElements = [...newElements, ...newElement]
      } else if (isDefined(oldKey) && !isDefined(newKey)) {
        const oldElement = elements[i]

        oldElement.remove()
        continue
      }
      prevElement = newElements[i]
    }
    elements = newElements
    values = newValues
  })

  reactor.subscribe((prev, curr) => {
    if (!prevValue) prevValue = prev

    callback(prev, curr)
  })

  return elements
}
