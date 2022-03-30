
export function wait (timeoutOrPromise: number | Promise<unknown> = 10): Promise<void> {
  if (timeoutOrPromise && typeof timeoutOrPromise === 'object' && typeof timeoutOrPromise.then === 'function') {
    return timeoutOrPromise.then(() => wait())
  }

  return new Promise(resolve => setTimeout(resolve, typeof timeoutOrPromise === 'number' ? timeoutOrPromise : 10))
}
