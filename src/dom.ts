import { Reactive } from "../types/app"
import { Child } from "../types/components"
import { isReactor } from "./app"
import { SEND_EVENT_SYMBOL } from "./constantes"
import { batch, diff, isJSXElement, isManipulable, stringify, toArray } from "./helpers"
import { ComponentCaller, ElementCaller } from "./types"

function generateTextNode(data: any): Element | Text {
  return document.createTextNode(stringify(data))
}

function generateSensibleDOM(reactor: Reactive<any>, parent: Element, previousSibling?: Element | Text): Array<Element | Text> {
  let currentValues = toArray(reactor())
  let currentElements: Array<Element | Text> = generateDOM(currentValues, parent)

  const reconciler = batch((_: any, newValues: any) => {
    const nextValues = toArray(newValues)
    const currentValuesObject = toArrayObject(currentValues)
    const nextValuesObject = toArrayObject(nextValues)

    const diffsObject = diff(currentValuesObject, nextValuesObject)

    let prevIndex = -1
    let prevSize = -1

    for (const key in diffsObject) {
      const diffObject = diffsObject[key]

      const action = diffObject.action
      const i = diffObject.new?.[0] ?? diffObject.old[0]
      const values = toArray(diffObject.new?.[1])

      if (action === "del") {
        currentElements[i].remove()
        if (isReactor(currentValues[i])) currentValues[i][SEND_EVENT_SYMBOL]("delete_dom")
        delete currentElements[i]
      } else if (action === "add") {
        const newElements = generateDOM(values, parent)

        if (i < prevIndex || prevIndex === -1) {
          if (i > 0) currentElements[i - 1].after(...newElements)
          else if (previousSibling) previousSibling.after(...newElements)
          else parent.prepend(...newElements)
        } else {
          currentElements[i + prevSize - 2].after(...newElements)
        }

        currentElements.splice(i, 0, ...newElements)
        prevSize = newElements.length
        prevIndex = i
      } else if (action === "update") {
        const actualElement = currentElements[i]
        const newElements = generateDOM(values, parent)

        actualElement.replaceWith(...newElements)
        actualElement.remove()

        currentElements.splice(i, 1, ...newElements)
        prevSize = newElements.length
        prevIndex = i
      }
    }

    currentValues = nextValues
  })

  reactor.subscribe(reconciler, "dom_reconciler")

  return currentElements
}

export function generateDOM(jsxElements: Array<JSX.Element | ElementCaller | ComponentCaller>, parent: Element, previousSibling?: Element | Text): Array<Element | Text> {
  let elements: Array<Element | Text> = []
  for (const jsxElement of jsxElements) {
    if (jsxElement instanceof Element || jsxElement instanceof Text) elements = [...elements, jsxElement]
    else if (jsxElement instanceof Array) elements = [...elements, ...generateDOM(jsxElement, parent, elements[elements.length - 1] ?? previousSibling)]
    else if (isManipulable(jsxElement)) elements = [...elements, ...generateDOM([jsxElement.element], parent, elements[elements.length - 1] ?? previousSibling)]
    else if (isReactor(jsxElement)) elements = [...elements, ...generateSensibleDOM(jsxElement, parent, elements[elements.length - 1] ?? previousSibling)]
    else if (isJSXElement(jsxElement)) elements = [...elements, ...generateDOM(toArray(jsxElement.apply(undefined, [parent, elements[elements.length - 1] ?? previousSibling])), parent, elements[elements.length - 1] ?? previousSibling)]
    else elements = [...elements, generateTextNode(jsxElement)]
  }
  return elements
}

function toArrayObject(obj: any) {
  const result: Record<any, any> = {}
  for (const i in obj) {
    const key = !isReactor(obj[i]) && isJSXElement(obj[i]) ? obj[i]?.key ?? i : i
    result[key] = [+i, obj[i]]
  }
  return result
}
