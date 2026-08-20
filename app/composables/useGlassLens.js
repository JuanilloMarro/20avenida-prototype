/**
 * useGlassLens — la lente del material Velo negro.
 *
 * El mapa de desplazamiento: una rampa roja en X y una verde en Y con el centro
 * neutralizado (#808080), de modo que SÓLO el filo refracta. Se regenera por
 * instancia con un ResizeObserver porque depende de ancho, alto, radio y grosor.
 *
 * Los valores los lee del CSS computado del propio elemento: manda `glass.css`,
 * no un objeto de JavaScript. Así el material tiene una sola fuente, y es la
 * misma que se ve en devtools.
 *
 * Tres cosas que NO son opcionales, verificadas en Chromium:
 *
 *  1. `scale` va NEGATIVO. Con positivo el filo muestrea fuera del recorte del
 *     elemento, Chromium devuelve transparente y aparece una banda sin filtrar
 *     del grosor exacto de la lente. Con negativo la lente comprime hacia
 *     dentro, que además es lo que hace un bisel convexo real.
 *  2. `color-interpolation-filters="sRGB"`. Sin esto el filtro interpola en
 *     linearRGB, el 128 del mapa deja de ser el neutro y toda la superficie se
 *     desplaza en diagonal.
 *  3. Los dos topes. `lente ≤ 34% del lado corto` y `compresión ≤ 3.2 × lente`.
 *     Sin ellos una píldora pequeña se deforma entera y su contenido deja de
 *     leerse.
 *
 * Aberración cromática (aquí en 0): si algún día sube, son tres
 * feDisplacementMap con scale × (1±k), uno por canal, un feColorMatrix que deje
 * sólo R, G o B, y recomponer con dos feBlend mode="screen". Cuesta 3× el
 * filtro; por encima de ~12 instancias en pantalla, quitarla.
 */
import { onMounted, onBeforeUnmount, unref } from 'vue'

const NS = 'http://www.w3.org/2000/svg'
let uid = 0
let defs = null

function defsRoot() {
  if (defs) return defs
  defs = document.createElementNS(NS, 'svg')
  defs.setAttribute('aria-hidden', 'true')
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  document.body.appendChild(defs)
  return defs
}

const SUPPORTED = () =>
  typeof CSS !== 'undefined' &&
  CSS.supports('backdrop-filter', 'url(#a)') &&
  !/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)

function displacementMap(w, h, r, edge) {
  const e = Math.max(1, Math.min(edge, Math.min(w, h) / 2 - 1))
  const ri = Math.max(r - e, 1)
  const iw = Math.max(w - 2 * e, 1)
  const ih = Math.max(h - 2 * e, 1)
  const svg =
    '<svg xmlns="' + NS + '" width="' + w + '" height="' + h + '"><defs>' +
      '<linearGradient id="x" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/>' +
      '</linearGradient>' +
      '<linearGradient id="y" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<rect width="' + w + '" height="' + h + '" fill="#808080"/>' +
    '<rect width="' + w + '" height="' + h + '" rx="' + r + '" fill="url(#x)"/>' +
    '<rect width="' + w + '" height="' + h + '" rx="' + r + '" fill="url(#y)" style="mix-blend-mode:screen"/>' +
    '<rect x="' + e + '" y="' + e + '" width="' + iw + '" height="' + ih + '" rx="' + ri + '" fill="#808080"/>' +
    '</svg>'
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/** lee un token numérico del propio elemento: el CSS manda */
function token(cs, name, fallback) {
  const v = parseFloat(cs.getPropertyValue(name))
  return Number.isFinite(v) ? v : fallback
}

export function useGlassLens(elRef) {
  const id = 'av-lens-' + (++uid)
  let node = null
  let ro = null

  const sync = () => {
    const el = unref(elRef)
    if (!el || !node) return
    const w = Math.round(el.offsetWidth)
    const h = Math.round(el.offsetHeight)
    if (!w || !h) return

    const cs = getComputedStyle(el)
    const r = Math.min(token(cs, '--lg-r', 18), Math.min(w, h) / 2)
    // tope 1: la lente nunca se come la pieza
    const edge = Math.min(token(cs, '--lg-edge', 26), Math.min(w, h) * 0.34)
    // tope 2: la compresión nunca supera a la lente que la produce
    const scale = -Math.min(token(cs, '--lg-scale', 82), edge * 3.2)
    const soft = Math.max(edge * 0.70, 2).toFixed(2)
    const uri = displacementMap(w, h, r, edge)

    node.setAttribute('filterUnits', 'userSpaceOnUse')
    node.setAttribute('primitiveUnits', 'userSpaceOnUse')
    node.setAttribute('color-interpolation-filters', 'sRGB')  // ← obligatorio
    node.setAttribute('x', 0); node.setAttribute('y', 0)
    node.setAttribute('width', w); node.setAttribute('height', h)
    node.innerHTML =
      '<feImage href="' + uri + '" x="0" y="0" width="' + w + '" height="' + h + '" ' +
        'preserveAspectRatio="none" result="map"/>' +
      '<feGaussianBlur in="map" stdDeviation="' + soft + '" result="mapSoft"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="mapSoft" scale="' + scale + '" ' +
        'xChannelSelector="R" yChannelSelector="G"/>'
  }

  onMounted(() => {
    const el = unref(elRef)
    if (!el || !SUPPORTED()) return          // fallback: se queda en blur
    node = document.createElementNS(NS, 'filter')
    node.setAttribute('id', id)
    defsRoot().appendChild(node)
    el.style.setProperty('--lg-lens', 'url(#' + id + ')')
    el.classList.add('is-lensed')
    ro = new ResizeObserver(sync)
    ro.observe(el)
    sync()
  })

  onBeforeUnmount(() => {
    ro && ro.disconnect()
    node && node.remove()
  })

  return { sync }
}
