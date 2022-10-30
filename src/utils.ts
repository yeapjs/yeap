import { Reactive } from "../types/app"
import { getRecordReactor, resetRecordReactor } from "./helpers"

export function record<T>(callback: () => T): [value: T, recordedReactors: Array<Reactive<any>>] {
  resetRecordReactor()
  const value = callback()
  return [value, Array.from(getRecordReactor() ?? [])]
}
