/**
 * html2canvas cannot parse modern CSS color functions (lab, oklch, color()).
 * After clone, rewrite computed colors to canvas-canonical RGB/hex and strip
 * complex properties that still embed unsupported color syntax.
 */

function needsModernColorSyntax(value: string): boolean {
  if (!value || value === 'none' || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') {
    return false
  }
  const v = value.toLowerCase()
  return (
    v.includes('lab(') ||
    v.includes('oklch(') ||
    v.includes('lch(') ||
    v.includes('color(')
  )
}

function canvasCanonicalColor(cssValue: string, ctx: CanvasRenderingContext2D): string | null {
  try {
    ctx.fillStyle = '#000000'
    ctx.fillStyle = cssValue
    const out = ctx.fillStyle
    return typeof out === 'string' ? out : null
  } catch {
    return null
  }
}

function applySolidColors(el: HTMLElement, cs: CSSStyleDeclaration, ctx: CanvasRenderingContext2D): void {
  const bg = cs.backgroundColor
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    const c = canvasCanonicalColor(bg, ctx)
    if (c) el.style.backgroundColor = c
  }

  const fg = cs.color
  if (fg) {
    const c = canvasCanonicalColor(fg, ctx)
    if (c) el.style.color = c
  }

  const borderPairs: [keyof CSSStyleDeclaration, string][] = [
    ['borderTopColor', 'border-top-color'],
    ['borderRightColor', 'border-right-color'],
    ['borderBottomColor', 'border-bottom-color'],
    ['borderLeftColor', 'border-left-color'],
  ]
  for (const [camel, kebab] of borderPairs) {
    const raw = cs[camel] as string
    if (!raw || raw === 'rgba(0, 0, 0, 0)') continue
    const c = canvasCanonicalColor(raw, ctx)
    if (c) el.style.setProperty(kebab, c)
  }

  const oc = cs.outlineColor
  if (oc && oc !== 'rgba(0, 0, 0, 0)') {
    const c = canvasCanonicalColor(oc, ctx)
    if (c) el.style.outlineColor = c
  }

  const tdc = cs.textDecorationColor
  if (tdc && tdc !== 'rgba(0, 0, 0, 0)') {
    const c = canvasCanonicalColor(tdc, ctx)
    if (c) el.style.textDecorationColor = c
  }
}

function stripComplexPropsIfNeeded(el: HTMLElement, cs: CSSStyleDeclaration): void {
  const boxShadow = cs.boxShadow
  if (boxShadow && boxShadow !== 'none' && needsModernColorSyntax(boxShadow)) {
    el.style.boxShadow = 'none'
  }
  const textShadow = cs.textShadow
  if (textShadow && textShadow !== 'none' && needsModernColorSyntax(textShadow)) {
    el.style.textShadow = 'none'
  }
  const filter = cs.filter
  if (filter && filter !== 'none' && needsModernColorSyntax(filter)) {
    el.style.filter = 'none'
  }
  const bgImage = cs.backgroundImage
  if (bgImage && bgImage !== 'none' && needsModernColorSyntax(bgImage)) {
    el.style.backgroundImage = 'none'
  }
}

/**
 * html2canvas always runs parseColor() on the clone's documentElement + body
 * backgrounds (see html2canvas dist/lib/index.js → parseBackgroundColor).
 * Tailwind / theme tokens often resolve to lab()/oklch() there → crash before
 * any per-node sanitizer runs. Force plain RGB backgrounds on the clone.
 */
function neutralizeCloneDocumentShell(clonedDocument: Document): void {
  const html = clonedDocument.documentElement
  const body = clonedDocument.body
  const reset = (el: HTMLElement) => {
    el.style.setProperty('background-color', '#ffffff', 'important')
    el.style.setProperty('background-image', 'none', 'important')
    el.style.setProperty('box-shadow', 'none', 'important')
  }
  if (html) reset(html)
  if (body) reset(body)
}

export function sanitizeClonedNodeForHtml2Canvas(clonedDocument: Document, clonedRoot: HTMLElement): void {
  neutralizeCloneDocumentShell(clonedDocument)

  const win = clonedRoot.ownerDocument.defaultView
  if (!win) return

  const canvas = clonedRoot.ownerDocument.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const walk = (node: Element) => {
    if (node instanceof HTMLElement) {
      const cs = win.getComputedStyle(node)
      applySolidColors(node, cs, ctx)
      stripComplexPropsIfNeeded(node, cs)
    }
    for (const child of node.children) {
      walk(child)
    }
  }

  walk(clonedRoot)
}
