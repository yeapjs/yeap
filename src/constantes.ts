export const COMPONENT_SYMBOL = Symbol("component")
export const ELEMENT_SYMBOL = Symbol("element")
export const MANIPULABLE_SYMBOL = Symbol("manipulable")
export const FORCE_SYMBOL = Symbol("forcedToSetValue")
export const OBSERVABLE_SYMBOL = Symbol("observable")
export const READONLY_OBSERVABLE_SYMBOL = Symbol("readOnlyObservable")
export const SEND_EVENT_SYMBOL = Symbol("sendEvent")
export const NULL = Symbol("null")
export type NULL = typeof NULL

export const ARRAY_METHOD = new Set<PropertyKey>(["mapReactor", "push", "pop", "unshift", "shift"])
export const SVG_TAGS = new Set(["svg", "animate", "animateMotion", "animateTransform", "circle", "clipPath", "color-profile", "defs", "desc", "discard", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistanceLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "hatch", "hatchpath", "image", "line", "linearGradient", "marker", "mask", "mesh", "meshgradient", "meshpatch", "meshrow", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "set", "solidcolor", "stop", "switch", "symbol", "text", "textPath", "title", "tspan", "unknown", "use", "view"])
export const SVG_CAMELCASE_ATTR = new Set(["attributeName", "attributeType", "baseFrequency", "baseProfile", "calcMode", "clipPathUnits", "contentScriptType", "contentStyleType", "diffuseConstant", "edgeMode", "filterRes", "filterUnits", "glyphRef", "gradientTransform", "gradientUnits", "kernelMatrix", "kernelUnitLength", "keyPoints", "keySplines", "keyTimes", "lengthAdjust", "limitingConeAngle", "markerHeight", "markerUnits", "markerWidth", "maskContentUnits", "maskUnits", "numOctaves", "pathLength", "patternContentUnits", "patternTransform", "patternUnits", "pointsAtX", "pointsAtY", "pointsAtZ", "preserveAlpha", "preserveAspectRatio", "primitiveUnits", "referrerPolicy", "refX", "refY", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "specularConstant", "specularExponent", "spreadMethod", "startOffset", "stdDeviation", "stitchTiles", "surfaceScale", "systemLanguage", "tableValues", "targetX", "targetY", "textLength", "viewBox", "viewTarget", "xChannelSelector", "yChannelSelector", "zoomAndPan"])
