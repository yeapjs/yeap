import { Reactive } from "../types/app"
import { isReactor } from "./app"
import { isDefined, stringify, toArray } from "./utils"

type HTMLContainer = Array<HTMLElement | Text>

export function generateDOM(content: any): HTMLElement | Text {
  if (content instanceof HTMLElement) return content
  return document.createTextNode(stringify(content))
}

export function generateList(container: HTMLContainer, children: Array<JSX.Element>): HTMLContainer {
  for (const child of children) {
    if (child instanceof HTMLElement || child instanceof Text) container = [...container, child]
    else if (child instanceof Array) container = [...generateList(container, child)]
    else if (isReactor(child)) container = [...container, ...insertReactor(child)]
    else container = [...container, generateDOM(child)]
  }

  return container
}

function insertReactor<T>(reactor: Reactive<T>) {
  const emptyNode = new Text()
  let values = toArray(reactor())
  let elements = generateList([], values)
  reactor.subscribe((prev, curr) => {
    if (prev === curr) return
    const newValues = toArray(curr)
    const length = Math.max(newValues.length, values.length)

    let newElements: HTMLContainer = []
    let prevElement: HTMLElement | Text = emptyNode
    for (let i = 0; i < length; i++) {
      const oldValue = values[i]
      const newValue = newValues[i]

      if (oldValue === newValue) {
        newElements = [...newElements, elements[i]]
      } else if (isDefined(oldValue) && isDefined(newValue)) {
        const oldElement = elements[i]
        const newElement = generateList([], [newValue])

        oldElement.replaceWith(...newElement)
        oldElement.remove()
        newElements = [...newElements, ...newElement]
      } else if (!isDefined(oldValue) && isDefined(newValue)) {
        const newElement = generateList([], [newValue])

        prevElement.after(...newElement)
        newElements = [...newElements, ...newElement]
      } else if (isDefined(oldValue) && !isDefined(newValue)) {
        const oldElement = elements[i]

        oldElement.remove()
        continue
      }
      prevElement = newElements[i]
    }
    elements = newElements
    values = newValues
  })
  return [emptyNode, ...elements]
}
