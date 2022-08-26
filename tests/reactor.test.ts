import { describe, test, expect, vi } from "vitest"

import { createComputed, createEffect, createReactor, createRef, isReadOnlyReactor } from "../src/app"

test("if createRef bacame a ReadOnlyReactor after update", () => {
  const ref = createRef(0)

  expect(isReadOnlyReactor(ref)).toBeFalsy()
  ref(1)
  expect(isReadOnlyReactor(ref)).toBeTruthy()
})

describe("createReactor", () => {
  test("if a reactor is a function", () => {
    const reactor = createReactor(0)

    expect(reactor).toBeTypeOf("function")
    expect(reactor()).toBe(0)
  })

  test("the recursive reactivite", () => {
    const reactor = createReactor({ a: 0, get b() { return 1 } })

    expect(reactor.a).toBeTypeOf("function")
    expect(reactor.a(3)).toBe(0)
    expect(isReadOnlyReactor(reactor.a)).toBeFalsy()
    expect(isReadOnlyReactor(reactor.b)).toBeTruthy()
    expect(reactor.a()).toBe(3)
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

describe("createComputed", () => {
  test("without option", () => {
    const reactor = createReactor(0)
    const mock = vi.fn(() => reactor() + 1)

    const compute = createComputed(mock, reactor)

    expect(isReadOnlyReactor(compute)).toBeTruthy()
    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(1)

    reactor(1)

    expect(compute()).toBe(2)
    expect(mock).toBeCalledTimes(2)
  })
})
describe("createEffect", () => {
  test("without option", () => {
    const reactor = createReactor(0)
    const mock = vi.fn()

    createEffect(mock, reactor)

    expect(mock).toBeCalledTimes(1)
  })

  test("option.immediate", () => {
    const reactor = createReactor(0)
    const mock = vi.fn()

    createEffect(mock, {
      immediate: false
    }, reactor)

    expect(mock).toBeCalledTimes(0)
    reactor(1)
    expect(mock).toBeCalledTimes(1)
  })
})
