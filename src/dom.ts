import { Reactive } from "../types/app"
import { isReactor } from "./app"
import { NULL } from "./constantes"
import { batch, diff, isJSXElement, stringify, toArray } from "./helpers"

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
    else if (isJSXElement(child)) container = [...generateList(container, parent, toArray((child as Function)()))]
    else container = [...container, generateDOM(child)]
  }

  return container
}

function toArrayObject(obj: any) {
  const result: Record<any, any> = {}
  for (const i in obj) {
    const key = obj[i]?.key ?? i
    result[key] = [i, obj[i]]
  }
  return result
}

function reconcileReactor<T extends JSX.Element>(parent: Element, reactor: Reactive<T>) {
  let values = toArray(reactor())
  let elements = generateList([], parent, values)

  let prevValue: T | NULL = NULL

  const callback = batch((prev: T, curr: T) => {
    prev = prevValue == NULL ? prev : prevValue
    prevValue = NULL

    if (prev === curr) return

    const prevValueObject = toArrayObject(toArray(prev))
    const currValueObject = toArrayObject(toArray(curr))

    const diffObject = diff(prevValueObject, currValueObject)

    for (const key in diffObject) {
      const { action, new: [i, value] } = diffObject[key]
      if (action === "del") {
        elements[i].remove()
        delete elements[i]
      } else if (action === "add") {
        const newElement = generateList([], parent, [value])

        if (i > 0) elements[i - 1].after(...newElement)
        else parent.prepend(...newElement)

        elements[i] = newElement as any
      } else if (action === "update") {
        const oldElement = elements[i]
        const newElement = generateList([], parent, [value])

        oldElement.replaceWith(...newElement)
        oldElement.remove()

        elements[i] = newElement as any
      }
    }

    elements = elements.flat()

    // const newValues = toArray(curr)
    // const length = Math.max(newValues.length, values.length)

    // let newElements: HTMLContainer = []
    // let prevElement: Element | Text | null = null
    // for (let i = 0; i < length; i++) {
    //   const oldValue = values[i]
    //   const newValue = newValues[i]

    //   const oldKey = (oldValue as any)?.key ?? oldValue
    //   const newKey = (newValue as any)?.key ?? newValue

    //   if (oldKey === newKey) {
    //     newElements = [...newElements, elements[i]]
    //   } else if (isDefined(oldKey) && isDefined(newKey)) {
    //     const oldElement = elements[i]
    //     const newElement = generateList([], parent, [newValue])

    //     oldElement.replaceWith(...newElement)
    //     oldElement.remove()
    //     newElements = [...newElements, ...newElement]
    //   } else if (!isDefined(oldKey) && isDefined(newKey)) {
    //   } else if (isDefined(oldKey) && !isDefined(newKey)) {
    //     const oldElement = elements[i]

    //     oldElement.remove()
    //     continue
    //   }
    //   prevElement = newElements[i]
    // }
    // elements = newElements
    // values = newValues
  })

  reactor.subscribe((prev, curr) => {
    if (prevValue == NULL) prevValue = prev

    callback(prev, curr)
  })

  return elements
}
