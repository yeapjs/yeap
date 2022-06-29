import { Component, Reactive } from "./app"

declare global {
  // JSX type definitions for Yeap
  namespace JSX {
    type Element =
      | HTMLElement
      | SVGElement
      | Text
      | Array<Element>
      | Component<any>
      | any

    interface IntrinsicElements {
      // HTML
      a: HTMLAttributes<HTMLAnchorElement>
      abbr: HTMLAttributes<HTMLElement>
      address: HTMLAttributes<HTMLElement>
      area: HTMLAttributes<HTMLAreaElement>
      article: HTMLAttributes<HTMLElement>
      aside: HTMLAttributes<HTMLElement>
      audio: HTMLAttributes<HTMLAudioElement>
      b: HTMLAttributes<HTMLElement>
      base: HTMLAttributes<HTMLBaseElement>
      bdi: HTMLAttributes<HTMLElement>
      bdo: HTMLAttributes<HTMLElement>
      big: HTMLAttributes<HTMLElement>
      blockquote: HTMLAttributes<HTMLElement>
      body: HTMLAttributes<HTMLBodyElement>
      br: HTMLAttributes<HTMLBRElement>
      button: HTMLAttributes<HTMLButtonElement>
      canvas: HTMLAttributes<HTMLCanvasElement>
      caption: HTMLAttributes<HTMLElement>
      cite: HTMLAttributes<HTMLElement>
      code: HTMLAttributes<HTMLElement>
      col: HTMLAttributes<HTMLTableColElement>
      colgroup: HTMLAttributes<HTMLTableColElement>
      data: HTMLAttributes<HTMLElement>
      datalist: HTMLAttributes<HTMLDataListElement>
      dd: HTMLAttributes<HTMLElement>
      del: HTMLAttributes<HTMLElement>
      details: HTMLAttributes<HTMLElement>
      dfn: HTMLAttributes<HTMLElement>
      dialog: HTMLAttributes<HTMLElement>
      div: HTMLAttributes<HTMLDivElement>
      dl: HTMLAttributes<HTMLDListElement>
      dt: HTMLAttributes<HTMLElement>
      em: HTMLAttributes<HTMLElement>
      embed: HTMLAttributes<HTMLEmbedElement>
      fieldset: HTMLAttributes<HTMLFieldSetElement>
      figcaption: HTMLAttributes<HTMLElement>
      figure: HTMLAttributes<HTMLElement>
      footer: HTMLAttributes<HTMLElement>
      form: HTMLAttributes<HTMLFormElement>
      h1: HTMLAttributes<HTMLHeadingElement>
      h2: HTMLAttributes<HTMLHeadingElement>
      h3: HTMLAttributes<HTMLHeadingElement>
      h4: HTMLAttributes<HTMLHeadingElement>
      h5: HTMLAttributes<HTMLHeadingElement>
      h6: HTMLAttributes<HTMLHeadingElement>
      head: HTMLAttributes<HTMLHeadElement>
      header: HTMLAttributes<HTMLElement>
      hgroup: HTMLAttributes<HTMLElement>
      hr: HTMLAttributes<HTMLHRElement>
      html: HTMLAttributes<HTMLHtmlElement>
      i: HTMLAttributes<HTMLElement>
      iframe: HTMLAttributes<HTMLIFrameElement>
      img: HTMLAttributes<HTMLImageElement>
      input: HTMLAttributes<HTMLInputElement>
      ins: HTMLAttributes<HTMLModElement>
      kbd: HTMLAttributes<HTMLElement>
      keygen: HTMLAttributes<HTMLElement>
      label: HTMLAttributes<HTMLLabelElement>
      legend: HTMLAttributes<HTMLLegendElement>
      li: HTMLAttributes<HTMLLIElement>
      link: HTMLAttributes<HTMLLinkElement>
      main: HTMLAttributes<HTMLElement>
      map: HTMLAttributes<HTMLMapElement>
      mark: HTMLAttributes<HTMLElement>
      menu: HTMLAttributes<HTMLElement>
      menuitem: HTMLAttributes<HTMLElement>
      meta: HTMLAttributes<HTMLMetaElement>
      meter: HTMLAttributes<HTMLElement>
      nav: HTMLAttributes<HTMLElement>
      noindex: HTMLAttributes<HTMLElement>
      noscript: HTMLAttributes<HTMLElement>
      object: HTMLAttributes<HTMLObjectElement>
      ol: HTMLAttributes<HTMLOListElement>
      optgroup: HTMLAttributes<HTMLOptGroupElement>
      option: HTMLAttributes<HTMLOptionElement>
      output: HTMLAttributes<HTMLElement>
      p: HTMLAttributes<HTMLParagraphElement>
      param: HTMLAttributes<HTMLParamElement>
      picture: HTMLAttributes<HTMLElement>
      pre: HTMLAttributes<HTMLPreElement>
      progress: HTMLAttributes<HTMLProgressElement>
      q: HTMLAttributes<HTMLQuoteElement>
      rp: HTMLAttributes<HTMLElement>
      rt: HTMLAttributes<HTMLElement>
      ruby: HTMLAttributes<HTMLElement>
      s: HTMLAttributes<HTMLElement>
      samp: HTMLAttributes<HTMLElement>
      script: HTMLAttributes<HTMLElement>
      section: HTMLAttributes<HTMLElement>
      select: HTMLAttributes<HTMLSelectElement>
      slot: HTMLAttributes<HTMLSlotElement>
      small: HTMLAttributes<HTMLElement>
      source: HTMLAttributes<HTMLSourceElement>
      span: HTMLAttributes<HTMLSpanElement>
      strong: HTMLAttributes<HTMLElement>
      style: HTMLAttributes<HTMLStyleElement>
      sub: HTMLAttributes<HTMLElement>
      summary: HTMLAttributes<HTMLElement>
      sup: HTMLAttributes<HTMLElement>
      table: HTMLAttributes<HTMLTableElement>
      tbody: HTMLAttributes<HTMLTableSectionElement>
      td: HTMLAttributes<HTMLTableDataCellElement>
      textarea: HTMLAttributes<HTMLTextAreaElement>
      tfoot: HTMLAttributes<HTMLTableSectionElement>
      th: HTMLAttributes<HTMLTableHeaderCellElement>
      thead: HTMLAttributes<HTMLTableSectionElement>
      time: HTMLAttributes<HTMLElement>
      title: HTMLAttributes<HTMLTitleElement>
      tr: HTMLAttributes<HTMLTableRowElement>
      track: HTMLAttributes<HTMLTrackElement>
      u: HTMLAttributes<HTMLElement>
      ul: HTMLAttributes<HTMLUListElement>
      "var": HTMLAttributes<HTMLElement>
      video: HTMLAttributes<HTMLVideoElement>
      wbr: HTMLAttributes<HTMLElement>

      // SVG
      svg: SVGAttributes<SVGElement>

      animate: SVGAttributes<SVGElement>
      animateTransform: SVGAttributes<SVGElement>
      circle: SVGAttributes<SVGElement>
      clipPath: SVGAttributes<SVGElement>
      defs: SVGAttributes<SVGElement>
      desc: SVGAttributes<SVGElement>
      ellipse: SVGAttributes<SVGElement>
      feBlend: SVGAttributes<SVGElement>
      feColorMatrix: SVGAttributes<SVGElement>
      feComponentTransfer: SVGAttributes<SVGElement>
      feComposite: SVGAttributes<SVGElement>
      feConvolveMatrix: SVGAttributes<SVGElement>
      feDiffuseLighting: SVGAttributes<SVGElement>
      feDisplacementMap: SVGAttributes<SVGElement>
      feDistantLight: SVGAttributes<SVGElement>
      feFlood: SVGAttributes<SVGElement>
      feFuncA: SVGAttributes<SVGElement>
      feFuncB: SVGAttributes<SVGElement>
      feFuncG: SVGAttributes<SVGElement>
      feFuncR: SVGAttributes<SVGElement>
      feGaussianBlur: SVGAttributes<SVGElement>
      feImage: SVGAttributes<SVGElement>
      feMerge: SVGAttributes<SVGElement>
      feMergeNode: SVGAttributes<SVGElement>
      feMorphology: SVGAttributes<SVGElement>
      feOffset: SVGAttributes<SVGElement>
      fePointLight: SVGAttributes<SVGElement>
      feSpecularLighting: SVGAttributes<SVGElement>
      feSpotLight: SVGAttributes<SVGElement>
      feTile: SVGAttributes<SVGElement>
      feTurbulence: SVGAttributes<SVGElement>
      filter: SVGAttributes<SVGElement>
      foreignObject: SVGAttributes<SVGElement>
      g: SVGAttributes<SVGElement>
      image: SVGAttributes<SVGElement>
      line: SVGAttributes<SVGElement>
      linearGradient: SVGAttributes<SVGElement>
      marker: SVGAttributes<SVGElement>
      mask: SVGAttributes<SVGElement>
      metadata: SVGAttributes<SVGElement>
      path: SVGAttributes<SVGElement>
      pattern: SVGAttributes<SVGElement>
      polygon: SVGAttributes<SVGElement>
      polyline: SVGAttributes<SVGElement>
      radialGradient: SVGAttributes<SVGElement>
      rect: SVGAttributes<SVGElement>
      stop: SVGAttributes<SVGElement>
      switch: SVGAttributes<SVGElement>
      symbol: SVGAttributes<SVGElement>
      text: SVGAttributes<SVGElement>
      textPath: SVGAttributes<SVGElement>
      tspan: SVGAttributes<SVGElement>
      use: SVGAttributes<SVGElement>
      view: SVGAttributes<SVGElement>
    }

    interface EventHandler<T, E extends Event> {
      (e: E & { currentTarget: T }): void
    }

    interface YeapAtributes<T> {
      classList?: { [key: PropertyKey]: any | Reactive<any> }
      fallback?: JSX.Element
      ref?: (v: T) => any
      when?: any | Reactive<any>
    }

    interface DOMAttributes<T> extends YeapAtributes<T> {
      children?: Array<JSX.Element>

      // Clipboard Events
      onCopy?: EventHandler<T, ClipboardEvent>
      onCopyCapture?: EventHandler<T, ClipboardEvent>
      onCut?: EventHandler<T, ClipboardEvent>
      onCutCapture?: EventHandler<T, ClipboardEvent>
      onPaste?: EventHandler<T, ClipboardEvent>
      onPasteCapture?: EventHandler<T, ClipboardEvent>

      // Composition Events
      onCompositionEnd?: EventHandler<T, CompositionEvent>
      onCompositionEndCapture?: EventHandler<T, CompositionEvent>
      onCompositionStart?: EventHandler<T, CompositionEvent>
      onCompositionStartCapture?: EventHandler<T, CompositionEvent>
      onCompositionUpdate?: EventHandler<T, CompositionEvent>
      onCompositionUpdateCapture?: EventHandler<T, CompositionEvent>

      // Focus Events
      onFocus?: EventHandler<T, FocusEvent>
      onFocusCapture?: EventHandler<T, FocusEvent>
      onBlur?: EventHandler<T, FocusEvent>
      onBlurCapture?: EventHandler<T, FocusEvent>

      // Form Events
      onChange?: EventHandler<T, Event>
      onChangeCapture?: EventHandler<T, Event>
      onInput?: EventHandler<T, Event>
      onInputCapture?: EventHandler<T, Event>
      onReset?: EventHandler<T, Event>
      onResetCapture?: EventHandler<T, Event>
      onSubmit?: EventHandler<T, Event>
      onSubmitCapture?: EventHandler<T, Event>

      // Image Events
      onLoad?: EventHandler<T, Event>
      onLoadCapture?: EventHandler<T, Event>
      onError?: EventHandler<T, Event> // also a Media Event
      onErrorCapture?: EventHandler<T, Event> // also a Media Event

      // Keyboard Events
      onKeyDown?: EventHandler<T, KeyboardEvent>
      onKeyDownCapture?: EventHandler<T, KeyboardEvent>
      onKeyPress?: EventHandler<T, KeyboardEvent>
      onKeyPressCapture?: EventHandler<T, KeyboardEvent>
      onKeyUp?: EventHandler<T, KeyboardEvent>
      onKeyUpCapture?: EventHandler<T, KeyboardEvent>

      // Media Events
      onAbort?: EventHandler<T, Event>
      onAbortCapture?: EventHandler<T, Event>
      onCanPlay?: EventHandler<T, Event>
      onCanPlayCapture?: EventHandler<T, Event>
      onCanPlayThrough?: EventHandler<T, Event>
      onCanPlayThroughCapture?: EventHandler<T, Event>
      onDurationChange?: EventHandler<T, Event>
      onDurationChangeCapture?: EventHandler<T, Event>
      onEmptied?: EventHandler<T, Event>
      onEmptiedCapture?: EventHandler<T, Event>
      onEncrypted?: EventHandler<T, Event>
      onEncryptedCapture?: EventHandler<T, Event>
      onEnded?: EventHandler<T, Event>
      onEndedCapture?: EventHandler<T, Event>
      onLoadedData?: EventHandler<T, Event>
      onLoadedDataCapture?: EventHandler<T, Event>
      onLoadedMetadata?: EventHandler<T, Event>
      onLoadedMetadataCapture?: EventHandler<T, Event>
      onLoadStart?: EventHandler<T, Event>
      onLoadStartCapture?: EventHandler<T, Event>
      onPause?: EventHandler<T, Event>
      onPauseCapture?: EventHandler<T, Event>
      onPlay?: EventHandler<T, Event>
      onPlayCapture?: EventHandler<T, Event>
      onPlaying?: EventHandler<T, Event>
      onPlayingCapture?: EventHandler<T, Event>
      onProgress?: EventHandler<T, Event>
      onProgressCapture?: EventHandler<T, Event>
      onRateChange?: EventHandler<T, Event>
      onRateChangeCapture?: EventHandler<T, Event>
      onSeeked?: EventHandler<T, Event>
      onSeekedCapture?: EventHandler<T, Event>
      onSeeking?: EventHandler<T, Event>
      onSeekingCapture?: EventHandler<T, Event>
      onStalled?: EventHandler<T, Event>
      onStalledCapture?: EventHandler<T, Event>
      onSuspend?: EventHandler<T, Event>
      onSuspendCapture?: EventHandler<T, Event>
      onTimeUpdate?: EventHandler<T, Event>
      onTimeUpdateCapture?: EventHandler<T, Event>
      onVolumeChange?: EventHandler<T, Event>
      onVolumeChangeCapture?: EventHandler<T, Event>
      onWaiting?: EventHandler<T, Event>
      onWaitingCapture?: EventHandler<T, Event>

      // MouseEvents
      onClick?: EventHandler<T, MouseEvent>
      onClickCapture?: EventHandler<T, MouseEvent>
      onContextMenu?: EventHandler<T, MouseEvent>
      onContextMenuCapture?: EventHandler<T, MouseEvent>
      onDoubleClick?: EventHandler<T, MouseEvent>
      onDoubleClickCapture?: EventHandler<T, MouseEvent>
      onDrag?: EventHandler<T, DragEvent>
      onDragCapture?: EventHandler<T, DragEvent>
      onDragEnd?: EventHandler<T, DragEvent>
      onDragEndCapture?: EventHandler<T, DragEvent>
      onDragEnter?: EventHandler<T, DragEvent>
      onDragEnterCapture?: EventHandler<T, DragEvent>
      onDragExit?: EventHandler<T, DragEvent>
      onDragExitCapture?: EventHandler<T, DragEvent>
      onDragLeave?: EventHandler<T, DragEvent>
      onDragLeaveCapture?: EventHandler<T, DragEvent>
      onDragOver?: EventHandler<T, DragEvent>
      onDragOverCapture?: EventHandler<T, DragEvent>
      onDragStart?: EventHandler<T, DragEvent>
      onDragStartCapture?: EventHandler<T, DragEvent>
      onDrop?: EventHandler<T, DragEvent>
      onDropCapture?: EventHandler<T, DragEvent>
      onMouseDown?: EventHandler<T, MouseEvent>
      onMouseDownCapture?: EventHandler<T, MouseEvent>
      onMouseEnter?: EventHandler<T, MouseEvent>
      onMouseLeave?: EventHandler<T, MouseEvent>
      onMouseMove?: EventHandler<T, MouseEvent>
      onMouseMoveCapture?: EventHandler<T, MouseEvent>
      onMouseOut?: EventHandler<T, MouseEvent>
      onMouseOutCapture?: EventHandler<T, MouseEvent>
      onMouseOver?: EventHandler<T, MouseEvent>
      onMouseOverCapture?: EventHandler<T, MouseEvent>
      onMouseUp?: EventHandler<T, MouseEvent>
      onMouseUpCapture?: EventHandler<T, MouseEvent>

      // Selection Events
      onSelect?: EventHandler<T, Event>
      onSelectCapture?: EventHandler<T, Event>

      // Touch Events
      onTouchCancel?: EventHandler<T, TouchEvent>
      onTouchCancelCapture?: EventHandler<T, TouchEvent>
      onTouchEnd?: EventHandler<T, TouchEvent>
      onTouchEndCapture?: EventHandler<T, TouchEvent>
      onTouchMove?: EventHandler<T, TouchEvent>
      onTouchMoveCapture?: EventHandler<T, TouchEvent>
      onTouchStart?: EventHandler<T, TouchEvent>
      onTouchStartCapture?: EventHandler<T, TouchEvent>

      // UI Events
      onScroll?: EventHandler<T, UIEvent>
      onScrollCapture?: EventHandler<T, UIEvent>

      // Wheel Events
      onWheel?: EventHandler<T, WheelEvent>
      onWheelCapture?: EventHandler<T, WheelEvent>

      // Animation Events
      onAnimationStart?: EventHandler<T, AnimationEvent>
      onAnimationStartCapture?: EventHandler<T, AnimationEvent>
      onAnimationEnd?: EventHandler<T, AnimationEvent>
      onAnimationEndCapture?: EventHandler<T, AnimationEvent>
      onAnimationIteration?: EventHandler<T, AnimationEvent>
      onAnimationIterationCapture?: EventHandler<T, AnimationEvent>

      // Transition Events
      onTransitionEnd?: EventHandler<T, TransitionEvent>
      onTransitionEndCapture?: EventHandler<T, TransitionEvent>
    }

    interface HTMLAttributes<T> extends DOMAttributes<T> {
      // Standard HTML Attributes
      accept?: string
      acceptCharset?: string
      accessKey?: string
      action?: string
      allowFullScreen?: boolean
      allowTransparency?: boolean
      alt?: string
      async?: boolean
      autoComplete?: string
      autoFocus?: boolean
      autoPlay?: boolean
      capture?: boolean
      cellPadding?: number | string
      cellSpacing?: number | string
      charSet?: string
      challenge?: string
      checked?: boolean
      classID?: string
      className?: string
      class?: string
      cols?: number
      colSpan?: number
      content?: string
      contentEditable?: boolean
      contextMenu?: string
      controls?: boolean
      coords?: string
      crossOrigin?: string
      data?: string
      dateTime?: string
      default?: boolean
      defer?: boolean
      dir?: string
      disabled?: boolean
      download?: any
      draggable?: boolean
      encType?: string
      form?: string
      formAction?: string
      formEncType?: string
      formMethod?: string
      formNoValidate?: boolean
      formTarget?: string
      frameBorder?: number | string
      headers?: string
      height?: number | string
      hidden?: boolean
      high?: number
      href?: string
      hrefLang?: string
      htmlFor?: string
      for?: string
      httpEquiv?: string
      id?: string
      innerText?: string | number
      inputMode?: string
      integrity?: string
      is?: string
      keyParams?: string
      keyType?: string
      kind?: string
      label?: string
      lang?: string
      list?: string
      loop?: boolean
      low?: number
      manifest?: string
      marginHeight?: number
      marginWidth?: number
      max?: number | string
      maxLength?: number
      media?: string
      mediaGroup?: string
      method?: string
      min?: number | string
      minLength?: number
      multiple?: boolean
      muted?: boolean
      name?: string
      nonce?: string
      noValidate?: boolean
      open?: boolean
      optimum?: number
      pattern?: string
      placeholder?: string
      playsInline?: boolean
      poster?: string
      preload?: string
      radioGroup?: string
      readOnly?: boolean
      rel?: string
      required?: boolean
      reversed?: boolean
      role?: string
      rows?: number
      rowSpan?: number
      sandbox?: string
      scope?: string
      scoped?: boolean
      scrolling?: string
      seamless?: boolean
      selected?: boolean
      shape?: string
      size?: number
      sizes?: string
      slot?: string
      span?: number
      spellCheck?: boolean
      src?: string
      srcDoc?: string
      srcLang?: string
      srcSet?: string
      start?: number
      step?: number | string
      style?: Partial<CSSStyleDeclaration>
      summary?: string
      tabIndex?: number
      target?: string
      title?: string
      type?: string
      useMap?: string
      value?: string | string[] | number
      width?: number | string
      wmode?: string
      wrap?: string

      // RDFa Attributes
      about?: string
      datatype?: string
      inlist?: any
      prefix?: string
      property?: string
      resource?: string
      typeof?: string
      vocab?: string

      // Non-standard Attributes
      autoCapitalize?: string
      autoCorrect?: string
      autoSave?: string
      color?: string
      itemProp?: string
      itemScope?: boolean
      itemType?: string
      itemID?: string
      itemRef?: string
      results?: number
      security?: string
      unselectable?: boolean
    }

    interface SVGAttributes<T> extends HTMLAttributes<T> {
      accentHeight?: number | string
      accumulate?: "none" | "sum"
      additive?: "replace" | "sum"
      alignmentBaseline?: "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" |
      "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit"
      allowReorder?: "no" | "yes"
      alphabetic?: number | string
      amplitude?: number | string
      arabicForm?: "initial" | "medial" | "terminal" | "isolated"
      ascent?: number | string
      attributeName?: string
      attributeType?: string
      autoReverse?: number | string
      azimuth?: number | string
      baseFrequency?: number | string
      baselineShift?: number | string
      baseProfile?: number | string
      bbox?: number | string
      begin?: number | string
      bias?: number | string
      by?: number | string
      calcMode?: number | string
      capHeight?: number | string
      clip?: number | string
      clipPath?: string
      clipPathUnits?: number | string
      clipRule?: number | string
      colorInterpolation?: number | string
      colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit"
      colorProfile?: number | string
      colorRendering?: number | string
      contentScriptType?: number | string
      contentStyleType?: number | string
      cursor?: number | string
      cx?: number | string
      cy?: number | string
      d?: string
      decelerate?: number | string
      descent?: number | string
      diffuseConstant?: number | string
      direction?: number | string
      display?: number | string
      divisor?: number | string
      dominantBaseline?: number | string
      dur?: number | string
      dx?: number | string
      dy?: number | string
      edgeMode?: number | string
      elevation?: number | string
      enableBackground?: number | string
      end?: number | string
      exponent?: number | string
      externalResourcesRequired?: number | string
      fill?: string
      fillOpacity?: number | string
      fillRule?: "nonzero" | "evenodd" | "inherit"
      filter?: string
      filterRes?: number | string
      filterUnits?: number | string
      floodColor?: number | string
      floodOpacity?: number | string
      focusable?: number | string
      fontFamily?: string
      fontSize?: number | string
      fontSizeAdjust?: number | string
      fontStretch?: number | string
      fontStyle?: number | string
      fontVariant?: number | string
      fontWeight?: number | string
      format?: number | string
      from?: number | string
      fx?: number | string
      fy?: number | string
      g1?: number | string
      g2?: number | string
      glyphName?: number | string
      glyphOrientationHorizontal?: number | string
      glyphOrientationVertical?: number | string
      glyphRef?: number | string
      gradientTransform?: string
      gradientUnits?: string
      hanging?: number | string
      horizAdvX?: number | string
      horizOriginX?: number | string
      ideographic?: number | string
      imageRendering?: number | string
      in2?: number | string
      in?: string
      intercept?: number | string
      k1?: number | string
      k2?: number | string
      k3?: number | string
      k4?: number | string
      k?: number | string
      kernelMatrix?: number | string
      kernelUnitLength?: number | string
      kerning?: number | string
      keyPoints?: number | string
      keySplines?: number | string
      keyTimes?: number | string
      lengthAdjust?: number | string
      letterSpacing?: number | string
      lightingColor?: number | string
      limitingConeAngle?: number | string
      local?: number | string
      markerEnd?: string
      markerHeight?: number | string
      markerMid?: string
      markerStart?: string
      markerUnits?: number | string
      markerWidth?: number | string
      mask?: string
      maskContentUnits?: number | string
      maskUnits?: number | string
      mathematical?: number | string
      mode?: number | string
      numOctaves?: number | string
      offset?: number | string
      opacity?: number | string
      operator?: number | string
      order?: number | string
      orient?: number | string
      orientation?: number | string
      origin?: number | string
      overflow?: number | string
      overlinePosition?: number | string
      overlineThickness?: number | string
      paintOrder?: number | string
      panose1?: number | string
      pathLength?: number | string
      patternContentUnits?: string
      patternTransform?: number | string
      patternUnits?: string
      pointerEvents?: number | string
      points?: string
      pointsAtX?: number | string
      pointsAtY?: number | string
      pointsAtZ?: number | string
      preserveAlpha?: number | string
      preserveAspectRatio?: string
      primitiveUnits?: number | string
      r?: number | string
      radius?: number | string
      refX?: number | string
      refY?: number | string
      renderingIntent?: number | string
      repeatCount?: number | string
      repeatDur?: number | string
      requiredExtensions?: number | string
      requiredFeatures?: number | string
      restart?: number | string
      result?: string
      rotate?: number | string
      rx?: number | string
      ry?: number | string
      scale?: number | string
      seed?: number | string
      shapeRendering?: number | string
      slope?: number | string
      spacing?: number | string
      specularConstant?: number | string
      specularExponent?: number | string
      speed?: number | string
      spreadMethod?: string
      startOffset?: number | string
      stdDeviation?: number | string
      stemh?: number | string
      stemv?: number | string
      stitchTiles?: number | string
      stopColor?: string
      stopOpacity?: number | string
      strikethroughPosition?: number | string
      strikethroughThickness?: number | string
      string?: number | string
      stroke?: string
      strokeDasharray?: string | number
      strokeDashoffset?: string | number
      strokeLinecap?: "butt" | "round" | "square" | "inherit"
      strokeLinejoin?: "miter" | "round" | "bevel" | "inherit"
      strokeMiterlimit?: number | string
      strokeOpacity?: number | string
      strokeWidth?: number | string
      surfaceScale?: number | string
      systemLanguage?: number | string
      tableValues?: number | string
      targetX?: number | string
      targetY?: number | string
      textAnchor?: string
      textDecoration?: number | string
      textLength?: number | string
      textRendering?: number | string
      to?: number | string
      transform?: string
      u1?: number | string
      u2?: number | string
      underlinePosition?: number | string
      underlineThickness?: number | string
      unicode?: number | string
      unicodeBidi?: number | string
      unicodeRange?: number | string
      unitsPerEm?: number | string
      vAlphabetic?: number | string
      values?: string
      vectorEffect?: number | string
      version?: string
      vertAdvY?: number | string
      vertOriginX?: number | string
      vertOriginY?: number | string
      vHanging?: number | string
      vIdeographic?: number | string
      viewBox?: string
      viewTarget?: number | string
      visibility?: number | string
      vMathematical?: number | string
      widths?: number | string
      wordSpacing?: number | string
      writingMode?: number | string
      x1?: number | string
      x2?: number | string
      x?: number | string
      xChannelSelector?: string
      xHeight?: number | string
      xlinkActuate?: string
      xlinkArcrole?: string
      xlinkHref?: string
      xlinkRole?: string
      xlinkShow?: string
      xlinkTitle?: string
      xlinkType?: string
      xmlBase?: string
      xmlLang?: string
      xmlns?: string
      xmlnsXlink?: string
      xmlSpace?: string
      y1?: number | string
      y2?: number | string
      y?: number | string
      yChannelSelector?: string
      z?: number | string
      zoomAndPan?: string
    }
  }
}
