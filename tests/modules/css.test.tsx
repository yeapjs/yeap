// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect, afterEach } from "vitest"
import { css } from "../../src/modules/index"
import { define, h, render } from "../../src/web"

/** @jsx h */

afterEach(() => {
  document.body.innerHTML = ""
})

test("css throw on non web-component", () => {
  const App = () => {
    css(`
        p {
            background: red;
        }
    `)

    return (
      <p>
        Hello <strong>World</strong>
      </p>
    )
  }

  expect(() => {
    render(<App />, document.body)
  }).toThrowError()
})

test("css add style element", () => {
  const component = () => {
    css(`p { background: red; }`)

    return (
      <p>
        Hello <strong>World</strong>
      </p>
    )
  }

  define("test-1", component)
  // @ts-ignore
  render(<test-1></test-1>, document.body)

  const test = document.body.querySelector("test-1")!
  expect(test).not.toBeNull()

  const style = test.querySelector("style")!
  expect(style).not.toBeNull()
  expect(style.innerHTML).toBe(`p { background: red; }`)
})
