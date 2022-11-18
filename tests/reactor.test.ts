import { describe, test, expect, vi } from "vitest"

import { createComputed, createEffect, createReactor, createRef, isReactor, isReadOnlyReactor } from "../src/app"
import { next } from "../src/runtimeLoop"
import { untrack } from "../src/utils"
import { h } from "../src/web"
import "./polyfill"

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

  test("if the reactor is properly updated", () => {
    const reactor = createReactor(0)

    expect(reactor()).toBe(0)
    expect(reactor(1)).toBe(0)
    expect(reactor()).toBe(1)
  })

  test("the recursive reactivite", () => {
    const reactor = createReactor({ a: 0, get b() { return 1 } })

    expect(reactor.a).toBeTypeOf("function")
    expect(reactor.a(3)).toBe(0)
    expect(isReadOnlyReactor(reactor.a)).toBeFalsy()
    expect(isReadOnlyReactor(reactor.b)).toBeTruthy()
    expect(reactor.a()).toBe(3)

    reactor.a = 4 as any
    expect(reactor.a()).toBe(4)
    // @ts-ignore
    expect(() => reactor.b = 5 as any).toThrow()
  })

  test("the recursive reactivite with the methods", () => {
    const reactor = createReactor([0, 1])

    const map = reactor.map((v) => v + 1)

    expect(reactor()).toStrictEqual([0, 1])
    expect(reactor.map).toBeTypeOf("function")
    expect(map).toBeTypeOf("function")
    expect(map()).toStrictEqual([1, 2])

    reactor([0, 3, 2])

    expect(map()).toStrictEqual([1, 4, 3])
  })

  test("the overwrites array method", () => {
    const reactor = createReactor([0, 1])
    const mock = vi.fn()

    reactor.mapReactor((v) => expect(isReactor(v)).toBeTruthy())

    reactor.subscribe(mock)

    reactor.push(2)
    expect(mock).toBeCalled()
    expect(reactor()).toStrictEqual([0, 1, 2])
    reactor.pop()
    expect(mock).toBeCalled()
    expect(reactor()).toStrictEqual([0, 1])
    reactor.unshift(2)
    expect(mock).toBeCalled()
    expect(reactor()).toStrictEqual([2, 0, 1])
    reactor.shift()
    expect(mock).toBeCalled()
    expect(reactor()).toStrictEqual([0, 1])

    expect(mock).toBeCalledTimes(4)
  })

  test("delete property on a reactor", () => {
    const reactor = createReactor({ a: 0 })

    expect(reactor()).toStrictEqual({ a: 0 })
    expect(reactor.a()).toBe(0)

    // @ts-ignore
    delete reactor.a

    expect(reactor()).toStrictEqual({})
    expect(reactor.a).toBe(undefined)
  })

  test("the 'copy' method", () => {
    const reactor = createReactor({ a: "foo" })
    const reactorCopy = reactor.copy()

    expect(reactor.a()).toBe("foo")
    expect(reactorCopy.a()).toBe("foo")

    reactor.a("bar")
    reactorCopy.a("baz")

    expect(reactor.a()).toBe("bar")
    expect(reactorCopy.a()).toBe("baz")
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

    // @ts-ignore
    expect(() => readOnlyReactor("baz")).toThrow()
  })

  test("the 'when' and 'compute' methods", async () => {
    const reactor = createReactor("foo")
    const computeReactor = reactor.compute((x) => x + x)

    const boolReactor = createReactor(true)
    const whenReactor = boolReactor.when("Hello", "Good bye")

    expect(computeReactor()).toBe("foofoo")
    expect(whenReactor()).toBe("Hello")

    reactor("bar")
    await next()

    expect(computeReactor()).toBe("barbar")
    expect(whenReactor()).toBe("Hello")

    boolReactor(false)
    await next()

    expect(whenReactor()).toBe("Good bye")
  })

  test("array with a reactor", () => {
    const reactor = createReactor([0, 1])

    expect(reactor()).toStrictEqual([0, 1])
    expect(reactor[0]).toBeTypeOf("function")
    expect(reactor[0]()).toStrictEqual(0)
  })

  test("recursive reactivite on existing property with the value null or undefined", () => {
    const reactor = createReactor({ a: null, b: undefined })
    const reactor2 = createReactor(null)

    expect(reactor2).toBeTypeOf("function")
    expect(reactor.a).toBeTypeOf("function")
    expect(reactor.b).toBeTypeOf("function")
    expect(reactor2()).toBe(null)
    expect(reactor.a()).toBe(null)
    expect(reactor.b()).toBe(undefined)
  })

  test("return undefined for unknown value", () => {
    const reactor = createReactor({})

    // @ts-ignore
    expect(reactor.a).toBe(undefined)
  })
})

describe("boolean operators", () => {
  test("and", () => {
    const a = createReactor(true)
    const b = createReactor(false)

    expect(a.and(a)()).toBeTruthy()
    expect(a.and(b)()).toBeFalsy()
    expect(b.and(a)()).toBeFalsy()
    expect(b.and(b)()).toBeFalsy()
  })

  test("or", () => {
    const a = createReactor(true)
    const b = createReactor(false)

    expect(a.or(a)()).toBeTruthy()
    expect(a.or(b)()).toBeTruthy()
    expect(b.or(a)()).toBeTruthy()
    expect(b.or(b)()).toBeFalsy()
  })

  test("not", () => {
    const a = createReactor(true)
    const b = createReactor(false)

    expect(a.not()()).toBeFalsy()
    expect(b.not()()).toBeTruthy()
  })

  test("nullish", () => {
    const a = createReactor(false)
    const b = createReactor(null)
    const c = createReactor(3)

    expect(a.nullish(b)()).toBeFalsy()
    expect(b.nullish(c)()).toBe(3)
  })
})

describe("createComputed", () => {
  test("without option", async () => {
    const reactor = createReactor(0)
    const mock = vi.fn(() => reactor() + 1)

    const compute = createComputed(mock, reactor)

    expect(isReadOnlyReactor(compute)).toBeTruthy()
    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(1)

    reactor(1)
    await next()

    expect(compute()).toBe(2)
    expect(mock).toBeCalledTimes(2)
  })

  test("without dependencies arguments", async () => {
    const reactor = createReactor(0)
    const mock = vi.fn(() => reactor() + 1)

    const compute = createComputed(mock)

    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(1)

    reactor(1)
    await next()

    expect(compute()).toBe(2)
    expect(mock).toBeCalledTimes(2)
  })

  test("option.observableInitialValue", async () => {
    const reactor = createReactor(0)
    const mock = vi.fn(() => reactor)

    const compute = createComputed(mock, { observableInitialValue: true })

    expect(compute()).toBe(0)
    expect(mock).toBeCalledTimes(1)

    reactor(1)
    await next()

    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(2)
  })

  test("option.unsubscription", async () => {
    const when = createReactor(true)

    const reactor = createReactor(0)
    const mock = vi.fn(() => reactor() + 1)
    const mock2 = vi.fn(() => reactor() + 1)

    function App() {
      createComputed(mock, { unsubscription: true })
      createComputed(mock2, { unsubscription: false })

      return h("div", null)
    }
    h(App, { when })()

    expect(mock).toBeCalledTimes(1)
    expect(mock2).toBeCalledTimes(1)

    reactor(1)
    await next()

    expect(mock).toBeCalledTimes(2)
    expect(mock2).toBeCalledTimes(2)

    when(false)
    reactor(2)
    await next()

    expect(mock).toBeCalledTimes(2)
    expect(mock2).toBeCalledTimes(3)
  })

  test("untrack", async () => {
    const reactor = createReactor(0)
    const mock = vi.fn(() => reactor() + 1)

    const compute = createComputed(untrack(mock))

    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(1)

    reactor(1)
    await next()

    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(1)
  })

  test("untrack specific", async () => {
    const reactor = createReactor(0)
    const reactor2 = createReactor(1)
    const mock = vi.fn(() => reactor() + reactor2())

    const compute = createComputed(untrack(mock, reactor2))

    expect(compute()).toBe(1)
    expect(mock).toBeCalledTimes(1)

    reactor(1)
    await next()

    expect(compute()).toBe(2)
    expect(mock).toBeCalledTimes(2)

    reactor2(2)
    await next()

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

  test("option.immediate", async () => {
    const reactor = createReactor(0)
    const mock = vi.fn()

    createEffect(mock, {
      immediate: false
    }, reactor)

    expect(mock).toBeCalledTimes(0)
    reactor(1)
    await next()
    expect(mock).toBeCalledTimes(1)
  })

  test("option.record", async () => {
    const reactor = createReactor(0)
    const mock = vi.fn(() => { reactor() })

    createEffect(mock, {
      record: true
    })

    expect(mock).toBeCalledTimes(1)
    reactor(1)
    await next()
    expect(mock).toBeCalledTimes(2)
  })
})
