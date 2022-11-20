import { test, expect, vi } from "vitest"
import { batch, equals } from "../src/helpers"
import { next } from "../src/runtimeLoop"

import "./polyfill"

test("equal", () => {
  expect(equals(null, [])).toBeFalsy()
  expect(equals(null, undefined)).toBeFalsy()
  expect(equals(null, null)).toBeTruthy()
  expect(equals(NaN, NaN)).toBeTruthy()
  expect(equals(0, 0)).toBeTruthy()
  expect(equals(1, 0)).toBeFalsy()
  expect(equals("a", "a")).toBeTruthy()
  expect(equals([], [])).toBeTruthy()
  expect(equals(["a"], [0])).toBeFalsy()
  expect(equals(["a", { a: "" }], ["a", { a: "" }])).toBeTruthy()
  expect(equals({}, {})).toBeTruthy()
  expect(equals({ a: "" }, { a: "" })).toBeTruthy()
  expect(equals({ a: "" }, { b: "" })).toBeFalsy()
  expect(equals(/a/, /a/)).toBeTruthy()
  expect(equals(/a/, /a/g)).toBeFalsy()
  expect(equals(new Date(), new Date())).toBeTruthy()
})

test("batch", async () => {
  const fn = vi.fn()
  const batchedFn = batch(fn)

  batchedFn()
  batchedFn()
  batchedFn()

  await next()

  expect(fn).toBeCalledTimes(1)

  batchedFn()
  batchedFn()
  batchedFn()

  await next()

  expect(fn).toBeCalledTimes(2)
})
