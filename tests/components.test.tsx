// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect } from "vitest"
import { createReactor } from "../src/app"
import { Match, Case, Fragment, Portal, children } from "../src/components"
import { next } from "../src/runtimeLoop"
import { h, render } from "../src/web"

import "./polyfill"

/** @jsx h */

test("Match", async () => {
  const body = document.createElement("body")
  const reactor = createReactor(0)

  function App() {
    return (
      <Match when={reactor}>
        <Case test={(v) => v == 0 || v == 3}>0</Case>
        <Case tests={[1, 4]}>1</Case>
        <Case default>default</Case>
      </Match>
    )
  }

  render(<App />, body)

  expect(body.innerHTML).toBe("0")

  reactor(1)
  await next()
  expect(body.innerHTML).toBe("1")

  reactor(2)
  await next()
  expect(body.innerHTML).toBe("default")

  reactor(3)
  await next()
  expect(body.innerHTML).toBe("0")

  reactor(4)
  await next()
  expect(body.innerHTML).toBe("1")
})

test("Fragment", async () => {
  const body = document.createElement("body")
  const reactor = createReactor(0)

  function App() {
    return (
      <Fragment>
        {reactor}
        <p>1</p>
      </Fragment>
    )
  }

  render(<App />, body)

  expect(body.innerHTML).toBe("0<p>1</p>")

  reactor(2)
  await next()

  expect(body.innerHTML).toBe("2<p>1</p>")
})

test("Portal", () => {
  const body = document.createElement("body")
  const body2 = document.createElement("body")

  function App() {
    return (
      <Portal mount={body2}>
        <p>1</p>
      </Portal>
    )
  }

  render(<App />, body)

  expect(body.innerHTML).toBe("")
  expect(body2.innerHTML).toBe("<p>1</p>")
})

test("Portal reactive", async () => {
  const body = document.createElement("body")
  const body2 = document.createElement("body")
  const reactor = createReactor(true)

  function App() {
    return (
      <Portal mount={body2} when={reactor}>
        <p>1</p>
      </Portal>
    )
  }

  render(<App />, body)

  expect(body.innerHTML).toBe("")
  expect(body2.innerHTML).toBe("<p>1</p>")

  reactor(false)
  await next()

  expect(body.innerHTML).toBe("")
  expect(body2.innerHTML).toBe("")
})

test("children manipulation", () => {
  function App(_: any, children) {
    return ""
  }

  const list = [<App a="" />]
  const listInfo = children(() => list)
  expect(listInfo).toBeInstanceOf(Array)
  expect(listInfo[0]).toStrictEqual({
    children: [],
    component: App,
    element: list[0],
    isComponent: true,
    key: undefined,
    props: {
      a: "",
    },
  })

  const p = <p>Hello</p>
  const list2 = [<App a="">{p}</App>]
  const list2Info = children(() => list2)
  expect(list2Info).toBeInstanceOf(Array)
  expect(list2Info).toStrictEqual([
    {
      isComponent: true,
      children: [p],
      component: App,
      element: list2[0],
      key: undefined,
      props: {
        a: "",
      },
    },
  ])
})
