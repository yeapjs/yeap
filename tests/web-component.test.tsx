// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect, describe, vi, afterEach } from "vitest"
import { define, h, render } from "../src/web"
import { isReactor, onMounted, onUnmounted } from "../src/app"

import "./polyfill"
import { Reactor } from "../types/app"
import { next } from "../src/runtime"

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
      c: "",
    })
    expect(ref).not.toBeNull()
    return <p>Hello</p>
  }
  define("test-1", component)
  // @ts-ignore
  render(<test-1 a="a" b={0} c></test-1>, document.body)
})

test("reactive attribute", () => {
  let a: Reactor<string> | null = null
  const component = ({ ref, ...attributes }) => {
    expect(isReactor(attributes.a)).toBeTruthy()
    expect(attributes.b).toBe("0")
    expect(ref).not.toBeNull()

    a = attributes.a

    return <p>Hello</p>
  }
  define("test-1", component, {
    reactiveAttributes: ["a"],
  })

  expect(a).toBeNull()
  // @ts-ignore
  render(<test-1 a="a" b={0}></test-1>, document.body)
  expect(a).not.toBeNull()
  expect(a!()).toBe("a")

  const test_el = document.querySelector("test-1")!
  test_el.setAttribute("a", "b")
  expect(a!()).toBe("b")
})

test("casting attribute", () => {
  const values = [
    { a: true, b: 0, c: true },
    { a: false, b: 1, c: false },
  ]
  let i = 0
  const component = ({ ref, ...attributes }) => {
    expect(attributes).toMatchObject(values[i++])
    expect(ref).not.toBeNull()

    return <p>Hello</p>
  }
  define("test-1", component, {
    attributeCast: {
      a(el: HTMLElement, value: string) {
        return value == "a"
      },
      b: Number,
      c: Boolean,
    },
  })
  // @ts-ignore
  render(<test-1 a="a" b={0} c></test-1>, document.body)
  // @ts-ignore
  render(<test-1 a="b" b="1"></test-1>, document.body)
})

test("casted reactive attribute", async () => {
  let a: Reactor<number> | null = null
  let c: Reactor<number> | null = null
  const component = ({ ref, ...attributes }) => {
    expect(isReactor(attributes.a)).toBeTruthy()
    expect(isReactor(attributes.c)).toBeTruthy()
    expect(attributes.b).toBe("0")
    expect(ref).not.toBeNull()

    a = attributes.a
    c = attributes.c

    return <p>Hello</p>
  }
  define("test-1", component, {
    reactiveAttributes: ["a", "c"],
    attributeCast: {
      a: Number,
      c: Boolean,
    },
  })

  expect(a).toBeNull()
  expect(c).toBeNull()
  // @ts-ignore
  render(<test-1 a="0" b={0}></test-1>, document.body)
  expect(a).not.toBeNull()
  expect(c).not.toBeNull()
  expect(a!()).toBe(0)
  expect(c!()).toBeFalsy()

  const test_el = document.querySelector("test-1")!
  test_el.setAttribute("a", "2")
  test_el.setAttribute("c", "a")

  await next()

  expect(a!()).toBe(2)
  expect(c!()).toBeTruthy()
})

test("shadow dom open", () => {
  const component = vi.fn(() => {
    return <p>Hello</p>
  })
  define("test-1", component, {
    shadowed: "open",
  })

  expect(component).toBeCalledTimes(0)
  // @ts-ignore
  render(<test-1></test-1>, document.body)
  expect(component).toBeCalledTimes(1)
  expect(document.body.innerHTML).toBe("<test-1></test-1>")
  const test_el = document.querySelector("test-1")!
  expect(test_el.shadowRoot).not.toBeNull()
  expect(test_el.shadowRoot!.innerHTML).toBe("<p>Hello</p>")
})

test("shadow dom closed", () => {
  const component = vi.fn(() => {
    return <p>Hello</p>
  })
  define("test-1", component, {
    shadowed: "closed",
  })

  expect(component).toBeCalledTimes(0)
  // @ts-ignore
  render(<test-1></test-1>, document.body)
  expect(component).toBeCalledTimes(1)
  expect(document.body.innerHTML).toBe("<test-1></test-1>")
  const test_el = document.querySelector("test-1")!
  expect(test_el.shadowRoot).toBeNull()
})
