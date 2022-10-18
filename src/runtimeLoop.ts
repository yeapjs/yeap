const callbacks = new Map()
let idleId: number | null = null
let i = 0

function loop() {
  callbacks.forEach((callback) => {
    callback()
  })

  if (callbacks.size) idleId = window.requestIdleCallback(loop)
  else idleId = null
}

export function next() {
  return new Promise((res) => {
    requestRuntimeCallback(res)
  })
}

export function requestRuntimeCallback(callback: Function): number {
  const id = i++

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
