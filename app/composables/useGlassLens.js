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
 * Y dos más, que costaron sendos bugs de los caros:
 *
 *  4. `--lg-lens` y la clase `is-lensed` NO se ponen hasta que el filtro tiene
 *     primitivas dentro. Un `<filter>` VACÍO referenciado desde un
 *     `backdrop-filter` no es «un filtro que no hace nada»: la spec dice que el
 *     resultado es transparente, así que Chromium tira por la borda la cadena
 *     ENTERA — se pierde la lente y con ella el blur, el saturate y el
 *     brightness. La superficie deja de ser vidrio y pasa a ser un cristal
 *     limpio. Poner la clase antes de medir era justo eso.
 *
 *     Y hace falta porque el primer `sync()` puede no medir nada: un panel
 *     montado con `v-show` nace en `display: none`, y ahí `offsetWidth` es 0.
 *     El ResizeObserver NO rescata ese caso — comprobado en Chromium: con el
 *     elemento oculto no emite, y al volver a `display: flex` TAMPOCO. De ahí
 *     el IntersectionObserver de abajo, que es el que sí se entera de que la
 *     pieza pasó a verse.
 *
 *  5. El mapa desenfocado va compuesto SOBRE un gris neutro opaco, no suelto.
 *     El mapa codifica el desplazamiento en el canal: 128 es «no muevas nada»,
 *     0 empuja a un lado y 255 al otro. El `feGaussianBlur` difumina también
 *     hacia FUERA del mapa, y fuera no hay nada — y «nada» en SVG es negro
 *     transparente, o sea 0. No 128.
 *
 *     Consecuencia, y se ve a simple vista: el borde izquierdo vale 0 y el
 *     desenfoque no lo cambia, mientras el derecho vale 255 y el desenfoque lo
 *     arrastra hacia 0. Con `--lg-edge: 132` y `--lg-scale: 90` eso daba 45 px
 *     de deformación a la izquierda contra 0.2 px a la derecha: la pieza
 *     parecía doblar sólo por un lado. Lo mismo entre arriba y abajo, en el
 *     canal verde.
 *
 *     El `feFlood` + `feComposite operator="over"` rellenan ese «fuera» con
 *     128, que es lo que siempre debió ser: fuera de la pieza no hay
 *     desplazamiento. Los dos extremos se suavizan por igual.
 *
 *     El bug estuvo desde el principio, pero era invisible: con la lente de
 *     26 px el desenfoque es de 18 y la franja contaminada, estrecha. A 132 el
 *     desenfoque es de 89 y se come un lado entero.
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

/**
 * Detecta el MOTOR WebKit de Apple, no la marca «Safari».
 *
 * La versión anterior era `!/^((?!chrome|android|crios|fxios).)*safari/i` y
 * dejaba pasar a `CriOS` y `FxiOS` — o sea Chrome y Firefox en iPhone. Y eso
 * está justo al revés: en iOS y iPadOS **todos** los navegadores son WebKit,
 * se llamen como se llamen, porque la plataforma no permite otro motor.
 *
 * Importa que la excepción sea exacta y no aproximada. WebKit acepta la
 * GRAMÁTICA de `backdrop-filter: url(#f)` —así que `CSS.supports` dice que sí—
 * pero no resuelve la referencia al filtro. Y un `backdrop-filter` que apunta a
 * algo que el motor no resuelve no es «un filtro que no hace nada»: se lleva
 * por delante la cadena entera, o sea también el `blur`, el `saturate` y el
 * `brightness`. Es el mismo agujero de la nota 4 de arriba, por otra puerta:
 * el que se cuela por aquí no pierde la lente, pierde el vidrio.
 *
 * Con esto, en iPhone el material cae limpio al desenfoque —velo, saturación y
 * brillo intactos, sin refracción— que es lo que WebKit sabe pintar.
 */
function appleWebKit() {
  const ua = navigator.userAgent
  if (/(iPhone|iPad|iPod)/.test(ua)) return true
  if (/(CriOS|FxiOS|EdgiOS|OPiOS)/.test(ua)) return true
  /* iPadOS 13+ se anuncia como «Macintosh»; lo delata el táctil */
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true
  /* Safari de escritorio: dice Safari y no dice ningún Chromium */
  return /Safari/.test(ua) && !/Chrom(e|ium)|Android|Edg\/|OPR\/|SamsungBrowser/.test(ua)
}

const SUPPORTED = () =>
  typeof CSS !== 'undefined' &&
  CSS.supports('backdrop-filter', 'url(#a)') &&
  !appleWebKit()

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
  let io = null
  let mo = null
  let lensed = false
  let sig = ''   // firma de la última construcción, para no rehacer el mapa en balde

  /** Devuelve `true` si consiguió medir y escribir el filtro. */
  const sync = () => {
    const el = unref(elRef)
    if (!el || !node) return false
    const w = Math.round(el.offsetWidth)
    const h = Math.round(el.offsetHeight)
    /* Oculto o sin medir todavía: NO se toca nada. Si aún no hay lente puesta,
       la pieza se queda en el fallback de desenfoque, que se ve bien; lo que no
       puede pasar es que apunte a un filtro vacío. */
    if (!w || !h) return false

    const cs = getComputedStyle(el)

    /* LA LENTE APAGADA A PROPÓSITO — la variante `sheet` y cualquiera que la
       herede. Se sale ANTES de construir el mapa, que es lo caro: un
       `feDisplacementMap` con su `data:` URI por instancia, contra un
       presupuesto medido de ≈9 piezas a la vez.

       `false` no es un error: es la señal de «no hay lente» que esta función ya
       devuelve cuando la pieza está oculta o sin medir, y quien la recibe deja
       la pieza en el fallback de desenfoque — que a tamaño de ficha se ve
       igual. Por eso no hace falta ninguna rama nueva arriba. */
    if (token(cs, '--lg-lens-on', 1) === 0) return false

    const r = Math.min(token(cs, '--lg-r', 18), Math.min(w, h) / 2)
    // tope 1: la lente nunca se come la pieza
    const edge = Math.min(token(cs, '--lg-edge', 26), Math.min(w, h) * 0.34)
    // tope 2: la compresión nunca supera a la lente que la produce
    const scale = -Math.min(token(cs, '--lg-scale', 82), edge * 3.2)

    /* Nada ha cambiado → no se rehace el mapa. Importa porque los tres
       observadores de abajo se pisan entre ellos: uno solo de los tres basta
       para que se reconstruya, y sin esta guarda el `data:` URI del mapa se
       regeneraba varias veces por gesto. */
    const signature = w + 'x' + h + ':' + r + ':' + edge + ':' + scale +
      ':' + token(cs, '--lg-soft', 0.30)
    if (signature === sig) return true
    sig = signature

    /* Cuánto se suaviza el mapa, en proporción al grosor de la lente. Era 0.70
       fijo y ese número se estaba comiendo el efecto: el desenfoque promedia la
       rampa con el gris neutro de los dos lados, así que los valores fuertes no
       sobreviven. Medido sobre el mapa ya desenfocado, en un panel de 375 con
       lente de 56: a 0.70 el desplazamiento real era de 21 px cuando el mapa
       crudo prometía 45. Bajarlo conserva la pendiente y con ella la
       refracción. Ver la tabla en docs/01-velo-negro.md. */
    const soft = Math.max(edge * token(cs, '--lg-soft', 0.30), 2).toFixed(2)
    const uri = displacementMap(w, h, r, edge)

    node.setAttribute('filterUnits', 'userSpaceOnUse')
    node.setAttribute('primitiveUnits', 'userSpaceOnUse')
    node.setAttribute('color-interpolation-filters', 'sRGB')  // ← obligatorio
    node.setAttribute('x', 0); node.setAttribute('y', 0)
    node.setAttribute('width', w); node.setAttribute('height', h)
    node.innerHTML =
      '<feImage href="' + uri + '" x="0" y="0" width="' + w + '" height="' + h + '" ' +
        'preserveAspectRatio="none" result="map"/>' +
      '<feGaussianBlur in="map" stdDeviation="' + soft + '" result="mapBlur"/>' +
      /* el «fuera» del mapa, en neutro — ver la nota 5 de arriba */
      '<feFlood flood-color="#808080" flood-opacity="1" result="neutral"/>' +
      '<feComposite in="mapBlur" in2="neutral" operator="over" result="mapSoft"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="mapSoft" scale="' + scale + '" ' +
        'xChannelSelector="R" yChannelSelector="G"/>'

    /* Sólo AHORA, con el filtro ya lleno, se enchufa. Ver la nota 4 de arriba. */
    if (!lensed) {
      el.style.setProperty('--lg-lens', 'url(#' + id + ')')
      el.classList.add('is-lensed')
      lensed = true
    }
    return true
  }

  onMounted(() => {
    const el = unref(elRef)
    if (!el || !SUPPORTED()) return          // fallback: se queda en blur

    /* LENTE APAGADA POR VARIANTE (`sheet`): se sale antes de crear NADA — ni el
       nodo `<filter>`, ni los tres observadores. La guarda de `sync()` sola ya
       ahorraba lo caro (el mapa `data:`), pero seguía dejando un `<filter>`
       vacío y tres observadores por pieza. En un panal de 26 celdas eso son 26
       nodos muertos y 78 observadores para nada.

       Se lee UNA vez, al montar. Una variante que encendiera la lente en
       caliente no la recuperaría — hoy ninguna se conmuta, `sheet` es una
       decisión por pieza. Si algún día hace falta, esto pasa a ser un `watch`
       sobre el prop `variant`. */
    if (token(getComputedStyle(el), '--lg-lens-on', 1) === 0) return

    node = document.createElementNS(NS, 'filter')
    node.setAttribute('id', id)
    defsRoot().appendChild(node)

    /* El de siempre: ancho, alto y radio cambian → el mapa se rehace. */
    ro = new ResizeObserver(sync)
    ro.observe(el)

    /* El que rescata a los paneles de `v-show`. Un elemento en `display: none`
       no interseca con nada; en cuanto se muestra, interseca, y ahí es cuando
       por fin se puede medir. Es el único observador que se entera de ese
       cambio — el ResizeObserver no emite ni al ocultarse ni al volver. */
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) sync()
      })
      io.observe(el)
    }

    /* Y el cinturón, además de los tirantes. Los dos observadores de arriba
       entregan sus callbacks dentro del ciclo de render del navegador: si la
       pestaña está en segundo plano ese ciclo no corre y ninguno de los dos
       dispara — comprobado. El MutationObserver no depende de eso, va por
       microtarea, y `v-show` es exactamente una mutación del atributo `style`.
       Con esto un panel de `v-show` recibe su lente en el mismo turno en que
       se muestra, pinte el navegador o no. */
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => sync())
      mo.observe(el, { attributes: true, attributeFilter: ['style', 'class'] })
    }

    /* Y el cuarto, para las piezas que aparecen por MEDIA QUERY.
       La barra de escritorio nace en `display: none` cuando la página carga en
       ancho de teléfono, así que su primer `sync()` no mide nada. Cuando la
       ventana se ensancha y la media query la muestra, no hay mutación de
       atributo que ver — el `display` lo cambia una regla CSS, no el DOM —, y
       los otros dos observadores entregan dentro del ciclo de render. El evento
       `resize` no depende de nada de eso y siempre acompaña al cambio de media
       query, que es exactamente cuando hay algo nuevo que medir.

       Es barato: la guarda de firma corta en seco si nada cambió. */
    window.addEventListener('resize', sync)

    sync()
  })

  onBeforeUnmount(() => {
    ro && ro.disconnect()
    io && io.disconnect()
    mo && mo.disconnect()
    window.removeEventListener('resize', sync)
    node && node.remove()
  })

  return { sync }
}
