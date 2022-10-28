// @ts-ignore
window.requestIdleCallback = (cb: (deadline: IdleDeadline) => void) => {
  return setImmediate(cb, {
    timeRemaining() {
      return 2
    },
    didTimeout: false
  })
}
// @ts-ignore
window.cancelIdleCallback = clearImmediate
