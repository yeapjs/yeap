import { Reactor } from "../types/app";
import { DeepObservable } from "./Observable";
import { isDefined, stringify, toArray } from "./utils";

type HTMLContainer = Array<HTMLElement | Text>

export function generateDOM(content: any): Text {
  return document.createTextNode(stringify(content))
}

export function generateList(container: HTMLContainer, children: Array<JSX.Element>): HTMLContainer {
  for (const child of children) {
    if (child instanceof HTMLElement) container = [...container, child]
    else if (child instanceof Array) container = [...generateList(container, child)]
    else if (DeepObservable.isObservable(child)) container = [...container, ...insertReactor(container[container.length - 1], child)]
    else container = [...container, generateDOM(child)]
  }

  return container
}

function insertReactor<T>(previousSibling: HTMLElement | Text, reactor: Reactor<T>) {
  let values = toArray(reactor())
  let elements = generateList([], values)
  reactor.subscribe!((prev, curr) => {
    if (prev === curr) return
    const newValues = toArray(curr)
    const length = Math.max(newValues.length, values.length)

    let newElements: HTMLContainer = []
    let prevElement: HTMLElement | Text = previousSibling
    for (let i = 0; i < length; i++) {
      const oldValue = values[i];
      const newValue = newValues[i];

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
  return elements
}
