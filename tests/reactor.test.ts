import { describe, test, expect, vi } from "vitest"

import { createReactor } from "../src/app"

describe("createReactor", () => {
  test("if a reactor is a function", () => {
    const reactor = createReactor(0)

    expect(reactor).toBeTypeOf("function")
    expect(reactor()).toBe(0)
  })
})
