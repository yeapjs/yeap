import { test, expect, vi } from "vitest"
import { createReactor, isReactor } from "../src/app"
import { autoid, memo, reactable, record, unique, untrack } from "../src/utils"

test("autoid", () => {
  const a = autoid()
  expect(a()).toBe(0)
  expect(a()).toBe(1)
  expect(a()).toBe(2)

  const b = autoid()
  expect(b()).toBe(0)
  expect(a()).toBe(3)
  expect(b()).toBe(1)
})

test("record", () => {
  const a = createReactor(0)
  const b = createReactor(1)
  const c = createReactor(2)

  const [value, recordedReactors] = record(() => {
    return a() + b() + c()
  })

  expect(value).toBe(3)
  expect(recordedReactors).toStrictEqual([a, b, c])
})

test("untrack", () => {
  const a = createReactor(0)
  const b = createReactor(1)
  const c = createReactor(2)

  const [value, recordedReactors] = record(() => {
    return a() + untrack(() => {
      return b()
    })() + c()
  })

  expect(value).toBe(3)
  expect(recordedReactors).toStrictEqual([a, c])

  const [value2, recordedReactors2] = record(() => {
    return a() + untrack(() => {
      return b() + c()
    }, b)()
  })

  expect(value2).toBe(3)
  expect(recordedReactors2).toStrictEqual([a, c])
})

test("unique", async () => {
  const fn = vi.fn()
  const uniquedFn = unique(fn)

  uniquedFn()
  expect(fn).toBeCalledTimes(1)

  uniquedFn()
  expect(fn).toBeCalledTimes(1)
})

test("memo", async () => {
  const fn = vi.fn()
  const memoedFn = memo(fn)

  memoedFn()
  expect(fn).toBeCalledTimes(1)

  memoedFn()
  expect(fn).toBeCalledTimes(1)

  memoedFn([])
  expect(fn).toBeCalledTimes(2)

  memoedFn()
  expect(fn).toBeCalledTimes(3)
})

test("reactable", async () => {
  const a = createReactor(0)

  expect(reactable(a)).toBe(a)
  expect(reactable(() => a())).toBeTypeOf("function")
  expect(isReactor(reactable(() => a()))).toBeTruthy()
})
