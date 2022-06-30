import { Reactive } from "../types/app"
import { isReactor } from "./app"

export interface ComponentContext {
  parent?: ComponentContext
  mounted: Array<Function> | null
  unmounted: Array<Function> | null
  hooks: Array<any>
  hookIndex: number
}

function makeMap(str: string): (key: string) => boolean {
  const map: Record<string, boolean> = {}
  const list: Array<string> = str.split(",")
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return val => !!map[val]
}

let current: ComponentContext
let parent: ComponentContext
export const GLOBAL_CONTEXT = createComponentContext()
setContextParent(GLOBAL_CONTEXT)
export const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view"

export const isSVGTag = makeMap(SVG_TAGS)

export function createComponentContext(): ComponentContext {
  const context: ComponentContext = {
    parent,
    mounted: null,
    unmounted: null,
    hooks: [],
    hookIndex: 0
  }

  current = context

  return context
}

export function setCurrentContext(context: ComponentContext) {
  current = context
}

export function setContextParent(context: ComponentContext) {
  parent = context
}

export function getCurrentContext(): ComponentContext {
  return current
}

export function stringify(v: unknown): string {
  if (typeof v === "string") return v
  if (typeof v === "object" && v !== null) return JSON.stringify(v)
  if (typeof v === "undefined") return "undefined"
  if (v === null) return "null"

  return String(v)
}

export function getValue<T>(a: Reactive<T> | T | undefined): T | undefined {
  if (isReactor(a)) return (a as Reactive<T>)()
  return a as T
}

export function toArray<T>(value: T | Array<T>): Array<T> {
  return value instanceof Array ? value : [value]
}

export function isDefined(v: any): boolean {
  return v !== null && v !== undefined
}

export function isEvent(v: string): boolean {
  return v.startsWith("on")
}
