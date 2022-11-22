// @ts-ignore it fix React not found error for the JSX
import type React from "react"

import { test, expect } from "vitest"
import { createReactor } from "../src/app"
import { Match, Case } from "../src/components"
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
