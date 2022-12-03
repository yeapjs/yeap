import { Reactive } from "../types/app"
import { isReactor } from "./app"
import { NULL } from "./constantes"
import { batch, diff, isJSXElement, stringify, toArray } from "./helpers"
import { ComponentCaller, ElementCaller } from "./types"

function generateTextNode(data: any): Element | Text {
  return document.createTextNode(stringify(data))
}

function generateSensibleDOM(reactor: Reactive<any>, parent: Element): Array<Element | Text> {
  let currentValues = toArray(reactor())
  let currentElements: Array<Element | Text> = generateDOM(currentValues, parent)

  const reconciler = (_: any, newValues: any) => {
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
        delete currentElements[i]
      } else if (action === "add") {
        const newElements = generateDOM(values, parent)

        if (i < prevIndex || prevIndex === -1) {
          if (i > 0) currentElements[i - 1].after(...newElements)
          else parent.prepend(...newElements)
        } else {
          console.log(i, prevSize)
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
  }

  reactor.subscribe(reconciler)

  return currentElements
}

export function generateDOM(jsxElements: Array<JSX.Element | ElementCaller | ComponentCaller>, parent: Element): Array<Element | Text> {
  let elements: Array<Element | Text> = []
  for (const jsxElement of jsxElements) {
    if (jsxElement instanceof Element || jsxElement instanceof Text) elements = [...elements, jsxElement]
    else if (jsxElement instanceof Array) elements = [...elements, ...generateDOM(jsxElement, parent)]
    else if (isReactor(jsxElement)) elements = [...elements, ...generateSensibleDOM(jsxElement, parent)]
    else if (isJSXElement(jsxElement)) elements = [...elements, ...generateDOM(toArray(jsxElement.apply(undefined)), parent)]
    else elements = [...elements, generateTextNode(jsxElement)]
  }
  return elements
}

function toArrayObject(obj: any) {
  const result: Record<any, any> = {}
  for (const i in obj) {
    const key = obj[i]?.key ?? i
    result[key] = [+i, obj[i]]
  }
  return result
}
