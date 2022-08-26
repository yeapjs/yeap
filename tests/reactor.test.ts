import { describe, test, expect, vi } from "vitest"

import { createReactor, isReadOnlyReactor } from "../src/app"

describe("createReactor", () => {
  test("if a reactor is a function", () => {
    const reactor = createReactor(0)

    expect(reactor).toBeTypeOf("function")
    expect(reactor()).toBe(0)
  })

  test("the recursive reactivite", () => {
    const reactor = createReactor("foo")

    expect(reactor.length).toBeTypeOf("function")
    expect(reactor.length()).toBe(3)
  })

  test("the 'subscribe' method", () => {
    const reactor = createReactor("foo")
    const readOnlyReactor = reactor.reader()
    const freezeReactor = reactor.freeze()

    const subMock = vi.fn()
    const readMock = vi.fn()
    const freezeMock = vi.fn()

    reactor.subscribe(subMock)
    readOnlyReactor.subscribe(readMock)
    freezeReactor.subscribe(freezeMock)

    expect(subMock).toBeCalledTimes(0)
    expect(isReadOnlyReactor(reactor)).toBeFalsy()
    expect(readMock).toBeCalledTimes(0)
    expect(isReadOnlyReactor(readOnlyReactor)).toBeTruthy()
    expect(freezeMock).toBeCalledTimes(0)
    expect(isReadOnlyReactor(freezeReactor)).toBeTruthy()

    reactor("bar")

    expect(subMock).toBeCalledTimes(1)
    expect(subMock).toBeCalledWith("foo", "bar")
    expect(readMock).toBeCalledTimes(1)
    expect(freezeMock).toBeCalledTimes(0)

    expect(() => readOnlyReactor("baz")).toThrow()
  })

  test("the 'when' and 'compute' methods", () => {
    const reactor = createReactor("foo")
    const computeReactor = reactor.compute((x) => x + x)

    const boolReactor = createReactor(true)
    const whenReactor = boolReactor.when("Hello", "Good bye")

    expect(computeReactor()).toBe("foofoo")
    expect(whenReactor()).toBe("Hello")

    reactor("bar")

    expect(computeReactor()).toBe("barbar")
    expect(whenReactor()).toBe("Hello")

    boolReactor(false)

    expect(whenReactor()).toBe("Good bye")
  })
})
