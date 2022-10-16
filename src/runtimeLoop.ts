const callbacks = new Map()
let idleId: number | null = null
let i = 0

function loop() {
  callbacks.forEach((callback) => {
    callback()
  })

  if (callbacks.size) idleId = requestIdleCallback(loop)
  else idleId = null
}

export function requestRuntimeCallback(callback: Function): number {
  const id = i++

  callbacks.set(id, () => {
    callback()
    cancelRuntimeCallback(id)
  })

  if (!idleId) idleId = requestIdleCallback(loop)

  return id
}
export function cancelRuntimeCallback(handle: number) {
  callbacks.delete(handle)
}
