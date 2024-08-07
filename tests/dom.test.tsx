// @ts-ignore
import type React from "react"
import { describe, test, expect, vi, beforeEach } from "vitest"

import {
  createDirective,
  createPersistor,
  createReactor,
  createRef,
  onMounted,
  onUnmounted,
} from "../src/app"
import { DirectiveError, ModifierError } from "../src/errors"
import { next } from "../src/runtime"
import { h, render } from "../src/web"
import { ElementGiver } from "../types/web"
import "./polyfill"

/** @jsx h */

describe("directive", () => {
  test("createDirective", () => {
    const mock = vi.fn()
    createDirective("hello", mock)

    expect(mock).not.toBeCalled()
    // @ts-ignore
    const div = (<div use:hello={0} />) as ElementGiver<HTMLDivElement, never>

    expect(mock).toBeCalled()
    expect(mock).toBeCalledWith(div(), 0)
  })

  test("error", () => {
    // @ts-ignore
    expect(() => <div use:hello={0} />).not.toThrow()
    // @ts-ignore
    expect(() => <div use:hello2={0} />).toThrow(
      new DirectiveError("the directive hello2 does not exist"),
    )
    // @ts-ignore
    expect(() => <div {...{ "use:hello2:p": 0 }} />).toThrow(
      new DirectiveError('syntax error "use:" can be take only one directive'),
    )
  })
})

describe("lifecycle", () => {
  let body
  beforeEach(() => {
    body = document.createElement("body")
  })

  test("onMounted in a component", async () => {
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
    await next()
    reactor(true)
    await next()
    expect(mock).toBeCalledTimes(2)
  })

  test("onUnmounted in a component", async () => {
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
    await next()
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
      const div = (<div class="test test2" />) as ElementGiver<
        HTMLDivElement,
        never
      >
      const div2 = (<div className="test" />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(div().className).toBe("test test2")
      expect(div2().className).toBe("test")
      expect(div2().getAttribute("className")).toBe(null)
    })

    test("classList attribute", async () => {
      const test = createReactor(true)
      const div = (<div classList={{ test }} />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(div().className).toBe("test")
      test(false)
      await next()
      expect(div().className).toBe("")
    })

    test("dangerouslySetInnerHTML attribute", () => {
      const div = (
        <div dangerouslySetInnerHTML={{ __html: "<p></p>" }} />
      ) as ElementGiver<HTMLDivElement, never>

      expect(div().querySelector("p")).not.toBeNull()
    })

    test("style attribute", async () => {
      const color = createReactor("red")
      const div = (<div style={{ color }} />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(div().style.color).toBe("red")
      color("blue")
      await next()
      expect(div().style.color).toBe("blue")
    })

    test("style attribute on camel case inline style", async () => {
      const color = createReactor("red")
      const div = (<div style={{ backgroundColor: color }} />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(div().style.backgroundColor).toBe("red")
      color("blue")
      await next()
      expect(div().style.backgroundColor).toBe("blue")

      const color2 = createReactor("red")
      const div2 = (
        <div style={{ backgroundColor: color2 }} />
      ) as ElementGiver<HTMLDivElement, never>

      expect(div2().style.backgroundColor).toBe("red")
      color2("blue")
      await next()
      expect(div2().style.backgroundColor).toBe("blue")
    })

    test("style attribute on kebab case inline style (issue #17)", async () => {
      const color = createReactor("red")
      const div = (
        <div style={{ "background-color": color } as any} />
      ) as ElementGiver<HTMLDivElement, never>

      expect(div().style.backgroundColor).toBe("red")
      color("blue")
      await next()
      expect(div().style.backgroundColor).toBe("blue")

      const color2 = createReactor("red")
      const div2 = (
        <div style={{ backgroundColor: color2 }} />
      ) as ElementGiver<HTMLDivElement, never>

      expect(div2().style.backgroundColor).toBe("red")
      color2("blue")
      await next()
      expect(div2().style.backgroundColor).toBe("blue")
    })

    test("random attributes", async () => {
      const color = createReactor("red")
      const div = (<div id={color} />) as ElementGiver<HTMLDivElement, never>

      expect(div().id).toBe("red")
      color("blue")
      await next()
      expect(div().id).toBe("blue")
    })

    test("event", () => {
      const handleClick = vi.fn()
      const div = (<div onClick={handleClick} />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(handleClick).not.toBeCalled()
      div().click()
      expect(handleClick).toBeCalled()
    })

    test("event with an array", () => {
      const handleClick = vi.fn()
      const div = (<div onClick={[handleClick, 4]} />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(handleClick).not.toBeCalled()
      div().click()
      expect(handleClick).toBeCalled()
      expect(handleClick).toBeCalledWith(4)
    })

    test("event modifiers", () => {
      let e: MouseEvent | null = null
      const handleClick = vi.fn((ev: MouseEvent) => (e = ev))
      const div = (<div onClick:prevent={handleClick} />) as ElementGiver<
        HTMLDivElement,
        never
      >

      expect(handleClick).not.toBeCalled()
      expect(e).toBeNull()
      div().click()
      expect(handleClick).toBeCalled()
      expect(e).not.toBeNull()
      expect(e!.defaultPrevented).toBeTruthy()
    })

    test("error", () => {
      expect(() => <div onClick:stop={() => {}} />).not.toThrow()
      expect(() => <div onClick:no-once={() => {}} />).toThrow(ModifierError)
    })
  })

  let body: HTMLBodyElement
  beforeEach(() => {
    body = document.createElement("body")
  })

  test("h", () => {
    const div = (<div />) as ElementGiver<HTMLDivElement, never>

    expect(div).toBeTypeOf("function")
    expect(div()).toBeInstanceOf(HTMLDivElement)
  })

  test("reactor to text node", async () => {
    const reactor = createReactor(0)
    const div = (<div>{reactor}</div>) as ElementGiver<HTMLDivElement, never>

    expect(div().innerHTML).toBe("0")
    reactor(1)
    await next()
    expect(div().innerHTML).toBe("1")
  })

  test("function to text node without losing reactivity", async () => {
    const reactor = createReactor(0)
    const div = (<div>{() => reactor()}</div>) as ElementGiver<
      HTMLDivElement,
      never
    >

    expect(div().innerHTML).toBe("0")
    reactor(1)
    await next()
    expect(div().innerHTML).toBe("1")
  })

  test("when and fallback attributes", async () => {
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
    await next()
    expect(body.querySelector("p")).toBeNull()
    expect(body.querySelector("span")).not.toBeNull()
  })
})
