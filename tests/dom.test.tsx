import { describe, test, expect, vi, beforeEach } from "vitest"
import {
  createPersistor,
  createReactor,
  onMounted,
  onUnmounted,
} from "../src/app"
import { h, render } from "../src/web"

/** @jsx h */

describe("lifecycle", () => {
  let body
  beforeEach(() => {
    body = document.createElement("body")
  })

  test("onMounted in a component", () => {
    const reactor = createReactor(true)
    const mock = vi.fn()

    function App() {
      onMounted(mock)

      return <div />
    }

    expect(mock).toBeCalledTimes(0)
    render(<App when={reactor} />, body)
    expect(mock).toBeCalled()
    reactor(false)
    reactor(true)
    expect(mock).toBeCalledTimes(2)
  })

  test("onUnmounted in a component", () => {
    const reactor = createReactor(true)
    const mock = vi.fn()

    function App() {
      onUnmounted(mock)

      return <div />
    }

    expect(mock).toBeCalledTimes(0)
    render(<App when={reactor} />, body)
    expect(mock).toBeCalledTimes(0)
    reactor(false)
    expect(mock).toBeCalled()
  })

  test("createPersistor", () => {
    const reactor = createReactor(true)
    const mock = vi.fn()

    function App() {
      createPersistor(mock)

      return <div />
    }

    expect(mock).toBeCalledTimes(0)
    render(<App when={reactor} />, body)
    expect(mock).toBeCalledTimes(1)
    reactor(false)
    expect(mock).toBeCalledTimes(1)
  })
})

describe("dom/jsx", () => {
  let body
  beforeEach(() => {
    body = document.createElement("body")
  })

  test("h", () => {
    const div = <div />

    expect(div).toBeTypeOf("function")
    expect(div()).toBeInstanceOf(HTMLDivElement)
  })

  test("when and fallback attributes", () => {
    const reactor = createReactor(true)

    function App() {
      return (
        <div>
          <p when={reactor} fallback={<span>Good bye</span>}>
            Hello
          </p>
        </div>
      )
    }

    render(<App />, body)
    expect(body.querySelector("p")).not.toBeNull()
    expect(body.querySelector("span")).toBeNull()
    reactor(false)
    expect(body.querySelector("p")).toBeNull()
    expect(body.querySelector("span")).not.toBeNull()
  })
})
