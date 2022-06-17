import { Reactor } from "../types/global"
import { DeepObservable } from "./Observable"

export function createReactor<T>(initialValue: T): Reactor<T> {
  return new DeepObservable(initialValue, null) as any
}
