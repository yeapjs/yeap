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

    type ReactivableHTMLAttributes<T> = {
      [K in keyof HTMLAttributes<T>]: (K extends keyof DOMAttributes<T> ? HTMLAttributes<T>[K] : Reactive<HTMLAttributes<T>[K]> | HTMLAttributes<T>[K]) | null
    }

    type ReactivableSVGAttributes<T> = {
      [K in keyof SVGAttributes<T>]: (K extends keyof DOMAttributes<T> ? SVGAttributes<T>[K] : Reactive<SVGAttributes<T>[K]> | SVGAttributes<T>[K]) | null
    }

    interface IntrinsicElements {
      // HTML
      a: ReactivableHTMLAttributes<HTMLAnchorElement>
      abbr: ReactivableHTMLAttributes<HTMLElement>
      address: ReactivableHTMLAttributes<HTMLElement>
      area: ReactivableHTMLAttributes<HTMLAreaElement>
      article: ReactivableHTMLAttributes<HTMLElement>
      aside: ReactivableHTMLAttributes<HTMLElement>
      audio: ReactivableHTMLAttributes<HTMLAudioElement>
      b: ReactivableHTMLAttributes<HTMLElement>
      base: ReactivableHTMLAttributes<HTMLBaseElement>
      bdi: ReactivableHTMLAttributes<HTMLElement>
      bdo: ReactivableHTMLAttributes<HTMLElement>
      big: ReactivableHTMLAttributes<HTMLElement>
      blockquote: ReactivableHTMLAttributes<HTMLElement>
      body: ReactivableHTMLAttributes<HTMLBodyElement>
      br: ReactivableHTMLAttributes<HTMLBRElement>
      button: ReactivableHTMLAttributes<HTMLButtonElement>
      canvas: ReactivableHTMLAttributes<HTMLCanvasElement>
      caption: ReactivableHTMLAttributes<HTMLElement>
      cite: ReactivableHTMLAttributes<HTMLElement>
      code: ReactivableHTMLAttributes<HTMLElement>
      col: ReactivableHTMLAttributes<HTMLTableColElement>
      colgroup: ReactivableHTMLAttributes<HTMLTableColElement>
      data: ReactivableHTMLAttributes<HTMLElement>
      datalist: ReactivableHTMLAttributes<HTMLDataListElement>
      dd: ReactivableHTMLAttributes<HTMLElement>
      del: ReactivableHTMLAttributes<HTMLElement>
      details: ReactivableHTMLAttributes<HTMLElement>
      dfn: ReactivableHTMLAttributes<HTMLElement>
      dialog: ReactivableHTMLAttributes<HTMLElement>
      div: ReactivableHTMLAttributes<HTMLDivElement>
      dl: ReactivableHTMLAttributes<HTMLDListElement>
      dt: ReactivableHTMLAttributes<HTMLElement>
      em: ReactivableHTMLAttributes<HTMLElement>
      embed: ReactivableHTMLAttributes<HTMLEmbedElement>
      fieldset: ReactivableHTMLAttributes<HTMLFieldSetElement>
      figcaption: ReactivableHTMLAttributes<HTMLElement>
      figure: ReactivableHTMLAttributes<HTMLElement>
      footer: ReactivableHTMLAttributes<HTMLElement>
      form: ReactivableHTMLAttributes<HTMLFormElement>
      h1: ReactivableHTMLAttributes<HTMLHeadingElement>
      h2: ReactivableHTMLAttributes<HTMLHeadingElement>
      h3: ReactivableHTMLAttributes<HTMLHeadingElement>
      h4: ReactivableHTMLAttributes<HTMLHeadingElement>
      h5: ReactivableHTMLAttributes<HTMLHeadingElement>
      h6: ReactivableHTMLAttributes<HTMLHeadingElement>
      head: ReactivableHTMLAttributes<HTMLHeadElement>
      header: ReactivableHTMLAttributes<HTMLElement>
      hgroup: ReactivableHTMLAttributes<HTMLElement>
      hr: ReactivableHTMLAttributes<HTMLHRElement>
      html: ReactivableHTMLAttributes<HTMLHtmlElement>
      i: ReactivableHTMLAttributes<HTMLElement>
      iframe: ReactivableHTMLAttributes<HTMLIFrameElement>
      img: ReactivableHTMLAttributes<HTMLImageElement>
      input: ReactivableHTMLAttributes<HTMLInputElement>
      ins: ReactivableHTMLAttributes<HTMLModElement>
      kbd: ReactivableHTMLAttributes<HTMLElement>
      keygen: ReactivableHTMLAttributes<HTMLElement>
      label: ReactivableHTMLAttributes<HTMLLabelElement>
      legend: ReactivableHTMLAttributes<HTMLLegendElement>
      li: ReactivableHTMLAttributes<HTMLLIElement>
      link: ReactivableHTMLAttributes<HTMLLinkElement>
      main: ReactivableHTMLAttributes<HTMLElement>
      map: ReactivableHTMLAttributes<HTMLMapElement>
      mark: ReactivableHTMLAttributes<HTMLElement>
      menu: ReactivableHTMLAttributes<HTMLElement>
      menuitem: ReactivableHTMLAttributes<HTMLElement>
      meta: ReactivableHTMLAttributes<HTMLMetaElement>
      meter: ReactivableHTMLAttributes<HTMLElement>
      nav: ReactivableHTMLAttributes<HTMLElement>
      noindex: ReactivableHTMLAttributes<HTMLElement>
      noscript: ReactivableHTMLAttributes<HTMLElement>
      object: ReactivableHTMLAttributes<HTMLObjectElement>
      ol: ReactivableHTMLAttributes<HTMLOListElement>
      optgroup: ReactivableHTMLAttributes<HTMLOptGroupElement>
      option: ReactivableHTMLAttributes<HTMLOptionElement>
      output: ReactivableHTMLAttributes<HTMLElement>
      p: ReactivableHTMLAttributes<HTMLParagraphElement>
      param: ReactivableHTMLAttributes<HTMLParamElement>
      picture: ReactivableHTMLAttributes<HTMLElement>
      pre: ReactivableHTMLAttributes<HTMLPreElement>
      progress: ReactivableHTMLAttributes<HTMLProgressElement>
      q: ReactivableHTMLAttributes<HTMLQuoteElement>
      rp: ReactivableHTMLAttributes<HTMLElement>
      rt: ReactivableHTMLAttributes<HTMLElement>
      ruby: ReactivableHTMLAttributes<HTMLElement>
      s: ReactivableHTMLAttributes<HTMLElement>
      samp: ReactivableHTMLAttributes<HTMLElement>
      script: ReactivableHTMLAttributes<HTMLElement>
      section: ReactivableHTMLAttributes<HTMLElement>
      select: ReactivableHTMLAttributes<HTMLSelectElement>
      slot: ReactivableHTMLAttributes<HTMLSlotElement>
      small: ReactivableHTMLAttributes<HTMLElement>
      source: ReactivableHTMLAttributes<HTMLSourceElement>
      span: ReactivableHTMLAttributes<HTMLSpanElement>
      strong: ReactivableHTMLAttributes<HTMLElement>
      style: ReactivableHTMLAttributes<HTMLStyleElement>
      sub: ReactivableHTMLAttributes<HTMLElement>
      summary: ReactivableHTMLAttributes<HTMLElement>
      sup: ReactivableHTMLAttributes<HTMLElement>
      table: ReactivableHTMLAttributes<HTMLTableElement>
      tbody: ReactivableHTMLAttributes<HTMLTableSectionElement>
      td: ReactivableHTMLAttributes<HTMLTableDataCellElement>
      textarea: ReactivableHTMLAttributes<HTMLTextAreaElement>
      tfoot: ReactivableHTMLAttributes<HTMLTableSectionElement>
      th: ReactivableHTMLAttributes<HTMLTableHeaderCellElement>
      thead: ReactivableHTMLAttributes<HTMLTableSectionElement>
      time: ReactivableHTMLAttributes<HTMLElement>
      title: ReactivableHTMLAttributes<HTMLTitleElement>
      tr: ReactivableHTMLAttributes<HTMLTableRowElement>
      track: ReactivableHTMLAttributes<HTMLTrackElement>
      u: ReactivableHTMLAttributes<HTMLElement>
      ul: ReactivableHTMLAttributes<HTMLUListElement>
      var: ReactivableHTMLAttributes<HTMLElement>
      video: ReactivableHTMLAttributes<HTMLVideoElement>
      wbr: ReactivableHTMLAttributes<HTMLElement>

      // SVG
      svg: ReactivableSVGAttributes<SVGElement>

      animate: ReactivableSVGAttributes<SVGElement>
      animateTransform: ReactivableSVGAttributes<SVGElement>
      circle: ReactivableSVGAttributes<SVGElement>
      clipPath: ReactivableSVGAttributes<SVGElement>
      defs: ReactivableSVGAttributes<SVGElement>
      desc: ReactivableSVGAttributes<SVGElement>
      ellipse: ReactivableSVGAttributes<SVGElement>
      feBlend: ReactivableSVGAttributes<SVGElement>
      feColorMatrix: ReactivableSVGAttributes<SVGElement>
      feComponentTransfer: ReactivableSVGAttributes<SVGElement>
      feComposite: ReactivableSVGAttributes<SVGElement>
      feConvolveMatrix: ReactivableSVGAttributes<SVGElement>
      feDiffuseLighting: ReactivableSVGAttributes<SVGElement>
      feDisplacementMap: ReactivableSVGAttributes<SVGElement>
      feDistantLight: ReactivableSVGAttributes<SVGElement>
      feFlood: ReactivableSVGAttributes<SVGElement>
      feFuncA: ReactivableSVGAttributes<SVGElement>
      feFuncB: ReactivableSVGAttributes<SVGElement>
      feFuncG: ReactivableSVGAttributes<SVGElement>
      feFuncR: ReactivableSVGAttributes<SVGElement>
      feGaussianBlur: ReactivableSVGAttributes<SVGElement>
      feImage: ReactivableSVGAttributes<SVGElement>
      feMerge: ReactivableSVGAttributes<SVGElement>
      feMergeNode: ReactivableSVGAttributes<SVGElement>
      feMorphology: ReactivableSVGAttributes<SVGElement>
      feOffset: ReactivableSVGAttributes<SVGElement>
      fePointLight: ReactivableSVGAttributes<SVGElement>
      feSpecularLighting: ReactivableSVGAttributes<SVGElement>
      feSpotLight: ReactivableSVGAttributes<SVGElement>
      feTile: ReactivableSVGAttributes<SVGElement>
      feTurbulence: ReactivableSVGAttributes<SVGElement>
      filter: ReactivableSVGAttributes<SVGElement>
      foreignObject: ReactivableSVGAttributes<SVGElement>
      g: ReactivableSVGAttributes<SVGElement>
      image: ReactivableSVGAttributes<SVGElement>
      line: ReactivableSVGAttributes<SVGElement>
      linearGradient: ReactivableSVGAttributes<SVGElement>
      marker: ReactivableSVGAttributes<SVGElement>
      mask: ReactivableSVGAttributes<SVGElement>
      metadata: ReactivableSVGAttributes<SVGElement>
      path: ReactivableSVGAttributes<SVGElement>
      pattern: ReactivableSVGAttributes<SVGElement>
      polygon: ReactivableSVGAttributes<SVGElement>
      polyline: ReactivableSVGAttributes<SVGElement>
      radialGradient: ReactivableSVGAttributes<SVGElement>
      rect: ReactivableSVGAttributes<SVGElement>
      stop: ReactivableSVGAttributes<SVGElement>
      switch: ReactivableSVGAttributes<SVGElement>
      symbol: ReactivableSVGAttributes<SVGElement>
      text: ReactivableSVGAttributes<SVGElement>
      textPath: ReactivableSVGAttributes<SVGElement>
      tspan: ReactivableSVGAttributes<SVGElement>
      use: ReactivableSVGAttributes<SVGElement>
      view: ReactivableSVGAttributes<SVGElement>
    }

    interface EventHandler<T, E extends Event> {
      (e: E & { currentTarget: T }): void
    }

    interface YeapAtributes<T> {
      classList?: { [key: PropertyKey]: any | Reactive<any> }
      dangerouslySetInnerHTML?: { __html: any | Reactive<any> }
      fallback?: JSX.Element
      ref?: (v: T) => any
      when?: any | Reactive<any>
    }

    interface DOMAttributes<T> extends YeapAtributes<T> {
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
