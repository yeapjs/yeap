// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect, vi, afterEach } from "vitest"
import { onElementCreation, onElementPopulate } from "../../src/modules/index"
import { h, render } from "../../src/web"

/** @jsx h */

afterEach(() => {
  document.body.innerHTML = ""
})

test("onElementCreation", () => {
  const mock = vi.fn((el: HTMLElement) => {
    expect(el.innerHTML).toBe("")
  })

  const App = () => {
    onElementCreation(mock)

    return (
      <p>
        Hello <strong>World</strong>
      </p>
    )
  }

  render(<App />, document.body)

  expect(document.body.innerHTML).toBe("<p>Hello <strong>World</strong></p>")
  expect(mock).toBeCalledTimes(2)
  expect(mock).toHaveBeenNthCalledWith(1, document.body.querySelector("strong"))
  expect(mock).toHaveBeenNthCalledWith(2, document.body.querySelector("p"))
})

test("onElementPopulate", () => {
  const inners = ["World", "Hello <strong>World</strong>"]
  let inner_id = 0
  const mock = vi.fn((el: HTMLElement) => {
    expect(el.innerHTML).toBe(inners[inner_id++])
  })

  const App = () => {
    onElementPopulate(mock)

    return (
      <p>
        Hello <strong>World</strong>
      </p>
    )
  }

  render(<App />, document.body)

  expect(document.body.innerHTML).toBe("<p>Hello <strong>World</strong></p>")
  expect(mock).toBeCalledTimes(2)
  expect(mock).toHaveBeenNthCalledWith(1, document.body.querySelector("strong"))
  expect(mock).toHaveBeenNthCalledWith(2, document.body.querySelector("p"))
})
