import { test, expect, vi } from "vitest"
import { batch, equal } from "../src/helpers"
import { next } from "../src/runtimeLoop"

import "./polyfill"

test("equal", () => {
  expect(equal(null, [])).toBeFalsy()
  expect(equal(null, undefined)).toBeFalsy()
  expect(equal(null, null)).toBeTruthy()
  expect(equal(NaN, NaN)).toBeTruthy()
  expect(equal(0, 0)).toBeTruthy()
  expect(equal(1, 0)).toBeFalsy()
  expect(equal("a", "a")).toBeTruthy()
  expect(equal([], [])).toBeTruthy()
  expect(equal(["a"], [0])).toBeFalsy()
  expect(equal(["a", { a: "" }], ["a", { a: "" }])).toBeTruthy()
  expect(equal({}, {})).toBeTruthy()
  expect(equal({ a: "" }, { a: "" })).toBeTruthy()
  expect(equal({ a: "" }, { b: "" })).toBeFalsy()
  expect(equal(/a/, /a/)).toBeTruthy()
  expect(equal(/a/, /a/g)).toBeFalsy()
  expect(equal(new Date(), new Date())).toBeTruthy()
})

test("batch", async () => {
  const fn = vi.fn()
  const batchedFn = batch(fn)

  batchedFn()
  batchedFn()
  batchedFn()

  await next()

  expect(fn).toBeCalledTimes(1)
})
