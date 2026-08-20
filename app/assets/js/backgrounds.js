/**
 * 20 Avenida — fondos de marca
 *
 * Las paradas se guardan COMO DATO, no como texto: el mismo array pinta el CSS
 * y alimenta el muestreador de luminancia del glifo adaptativo. Si se tocan los
 * colores, las dos cosas quedan sincronizadas solas.
 *
 * Una sola rampa lineal de 9 paradas a 157°. Nada de radiales: un radial cierra
 * su borde dentro del encuadre y se lee como mancha en la esquina.
 *
 * Valores tomados del artefacto 02 (`20av-liquid-glass.html`, const GRADS), que
 * es la referencia de verdad. La tabla de docs/02-liquid-glass.md §2 traía una
 * versión anterior de `negro` — ver la nota de ese documento.
 */

export const BACKGROUNDS = [
  {
    id: 'negro',
    name: 'Negro',
    note: 'grafito limpio, sin color',
    dark: true,
    angle: 157,
    stops: [
      [0, '#050506'], [0.14, '#08080A'], [0.28, '#0C0C0F'], [0.41, '#111114'],
      [0.54, '#161619'], [0.67, '#1C1C21'], [0.79, '#232329'], [0.90, '#2A2A31'],
      [1, '#32323A'],
    ],
  },
  {
    id: 'amanecer',
    name: 'Amanecer',
    note: 'papel → amarillo · default de tienda',
    dark: false,
    angle: 157,
    stops: [
      [0, '#FFFFFF'], [0.14, '#FFFEFA'], [0.28, '#FFFCEF'], [0.41, '#FFF8DF'],
      [0.54, '#FFF3CB'], [0.67, '#FFECB2'], [0.79, '#FFE494'], [0.90, '#FFDC72'],
      [1, '#FFD53F'],
    ],
  },
  {
    id: 'oro',
    name: 'Negro + oro',
    note: 'la variante cálida',
    dark: true,
    angle: 157,
    stops: [
      [0, '#070708'], [0.14, '#0B0A0B'], [0.28, '#121010'], [0.41, '#1B160D'],
      [0.54, '#261D0C'], [0.67, '#34270A'], [0.79, '#453208'], [0.90, '#573E06'],
      [1, '#6B4B03'],
    ],
  },
  {
    id: 'blanco',
    name: 'Blanco',
    note: 'control — aquí el vidrio desaparece',
    dark: false,
    angle: 157,
    stops: [[0, '#FFFFFF'], [1, '#FFFFFF']],
  },
]

export const DEFAULT_BACKGROUND = 'negro'

export function backgroundById(id) {
  return BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0]
}

/** → `background-image` para un elemento. */
export function toGradientCss(bg) {
  return `linear-gradient(${bg.angle}deg, ${bg.stops.map(s => `${s[1]} ${(s[0] * 100).toFixed(0)}%`).join(', ')})`
}

/**
 * Grano. Va DEBAJO del vidrio en orden de pintado; si va encima, el
 * backdrop-filter no lo recoge.
 *
 * Sobre `negro` hace además un segundo trabajo: le da al vidrio algo que
 * refractar. Sobre un negro plano la lente no tiene detalle que doblar y el
 * material desaparece aunque los parámetros estén bien.
 */
export const GRAIN_URL = "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='170' height='170'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/** 0–100. 3–6 % es donde el banding de una rampa de 8 bits deja de verse. */
export const GRAIN_DEFAULT = 4
