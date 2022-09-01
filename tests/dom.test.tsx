import { describe, test, expect, vi, beforeEach } from "vitest"
import {
  createPersistor,
  createReactor,
  createRef,
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
  describe("attributes", () => {
    test("ref attribute", () => {
      const ref = createRef()
      const div = <div ref={ref} />

      expect(ref()).toBeInstanceOf(HTMLDivElement)
    })

    test("class attribute", () => {
      const div = <div class="test" />

      expect(div().className).toBe("test")
    })

    test("classList attribute", () => {
      const test = createReactor(true)
      const div = <div classList={{ test }} />

      expect(div().className).toBe("test")
      test(false)
      expect(div().className).toBe("")
    })

    test("dangerouslySetInnerHTML attribute", () => {
      const div = <div dangerouslySetInnerHTML={{ __html: "<p></p>" }} />

      expect(div().querySelector("p")).not.toBeNull()
    })

    test("style attribute", () => {
      const color = createReactor("red")
      const div = <div style={{ color }} />

      expect(div().style.color).toBe("red")
      color("blue")
      expect(div().style.color).toBe("blue")
    })

    test("random attributes", () => {
      const color = createReactor("red")
      const div = <div id={color} />

      expect(div().id).toBe("red")
      color("blue")
      expect(div().id).toBe("blue")
    })

    test("event", () => {
      const handleClick = vi.fn()
      const div = <div onClick={handleClick} />

      expect(handleClick).not.toBeCalled()
      div().click()
      expect(handleClick).toBeCalled()
    })
  })

  let body
  beforeEach(() => {
    body = document.createElement("body")
  })

  test("h", () => {
    const div = <div />

    expect(div).toBeTypeOf("function")
    expect(div()).toBeInstanceOf(HTMLDivElement)
  })
  // ref class classList dangerouslySetInnerHTML style

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
