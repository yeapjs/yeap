// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect } from "vitest"
import { createReactor } from "../src/app"
import { Match, Case, Fragment, Portal } from "../src/components"
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
