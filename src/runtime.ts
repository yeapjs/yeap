import { autoid } from "./utils"

const callbacks = new Map<number, Function>()
let idleId: number | null = null
const runtimeId = autoid()

function loop(deadline: IdleDeadline) {
  for (const callback of callbacks.values()) {
    if (deadline.timeRemaining() < 1) break
    callback()
  }

  if (callbacks.size) idleId = window.requestIdleCallback(loop)
  else idleId = null
}

export function next() {
  return new Promise((res) => {
    requestRuntimeCallback(res)
  })
}

export function requestRuntimeCallback(callback: Function): number {
  const id = runtimeId()

  callbacks.set(id, () => {
    callback()
    cancelRuntimeCallback(id)
  })

  if (!idleId) idleId = window.requestIdleCallback(loop)

  return id
}

export function cancelRuntimeCallback(handle: number) {
  callbacks.delete(handle)
}
