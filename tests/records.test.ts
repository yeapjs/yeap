import { describe, test, expect } from "vitest"

import { Recorder } from "../src/Recorder"

describe("Recorder", () => {
  test("recording (start/stop)", () => {
    const recorder = new Recorder<number>()

    recorder.start()
    recorder.push(1)
    const list = recorder.stop()!

    expect(list.size).toBe(1)
    expect(list).toStrictEqual(new Set([1]))
    expect(recorder.stop()).toBeNull()
  })

  test("control (play/pause)", () => {
    const recorder = new Recorder<number>()

    recorder.start()
    recorder.push(1)
    recorder.pause()
    recorder.push(2)
    recorder.resume()
    recorder.push(3)
    const list = recorder.stop()!

    expect(list.size).toBe(2)
    expect(list).toStrictEqual(new Set([1, 3]))
  })

  test("sub recording", () => {
    const recorder = new Recorder<number>()

    // Record 1
    recorder.start()
    recorder.push(1)

    // Record 2
    recorder.start()
    recorder.push(2)
    const record2 = recorder.stop()!
    // End record 2
    recorder.push(3)
    // End record 1
    const record1 = recorder.stop()!

    expect(record1.size).toBe(2)
    expect(record2.size).toBe(1)
    expect(record1).toStrictEqual(new Set([1, 3]))
    expect(record2).toStrictEqual(new Set([2]))
    expect(recorder.stop()).toBeNull()
  })
})
