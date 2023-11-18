// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect, describe, vi, afterEach } from "vitest"
import { define, h, render } from "../src/web"
import { onMounted, onUnmounted } from "../src/app"

import "./polyfill"

/** @jsx h */

afterEach(() => {
  document.body.innerHTML = ""
})

test("create a normal web-component via dom", () => {
  const component = vi.fn(() => {
    return <p>Hello</p>
  })
  define("test-1", component)

  expect(component).toBeCalledTimes(0)
  document.body.appendChild(document.createElement("test-1"))
  expect(component).toBeCalledTimes(1)
  expect(document.body.innerHTML).toBe("<test-1><p>Hello</p></test-1>")
})

test("create a normal web-component via yeap", () => {
  const component = vi.fn(() => {
    return <p>Hello</p>
  })
  define("test-1", component)

  expect(component).toBeCalledTimes(0)
  // @ts-ignore
  render(<test-1></test-1>, document.body)
  expect(component).toBeCalledTimes(1)
  expect(document.body.innerHTML).toBe("<test-1><p>Hello</p></test-1>")
})

test("web-component mounting", () => {
  const mock = vi.fn()
  const component = () => {
    onMounted(mock)
    return <p>Hello</p>
  }
  define("test-1", component)

  expect(mock).toBeCalledTimes(0)
  // @ts-ignore
  render(<test-1></test-1>, document.body)
  expect(mock).toBeCalledTimes(1)
  expect(document.body.innerHTML).toBe("<test-1><p>Hello</p></test-1>")
})

test("web-component unmounting", () => {
  const mock = vi.fn()
  const component = () => {
    onUnmounted(mock)
    return <p>Hello</p>
  }
  define("test-1", component)

  expect(mock).toBeCalledTimes(0)
  // @ts-ignore
  render(<test-1></test-1>, document.body)
  expect(mock).toBeCalledTimes(0)
  expect(document.body.innerHTML).toBe("<test-1><p>Hello</p></test-1>")

  const test_el = document.querySelector("test-1")!
  expect(test_el).not.toBeNull()
  test_el.remove()
  expect(mock).toBeCalledTimes(1)
  expect(document.body.innerHTML).toBe("")
})

test("passing the attribute", () => {
  const component = ({ ref, ...attributes }) => {
    expect(attributes).toMatchObject({
      a: "a",
      b: "0",
    })
    expect(ref).not.toBeNull()
    return <p>Hello</p>
  }
  define("test-1", component)
  // @ts-ignore
  render(<test-1 a="a" b={0}></test-1>, document.body)
})
