/**
 * 20 Avenida — el material, en datos.
 *
 * ATENCIÓN: la fuente de verdad del material es `assets/css/glass.css`. La
 * lente lee los valores del CSS computado del elemento, no de aquí. Este módulo
 * existe sólo para las cosas que el CSS no puede hacer:
 *
 *   · el puente a Figma (`toFigmaGlass` / `toFigmaShadow`)
 *   · los colores de marca, para el JS que los necesite
 *
 * Si un número cambia, cambia en `glass.css` y luego aquí. Están duplicados a
 * conciencia y en un solo sitio de cada lado; no hay una tercera copia.
 *
 * UN material. Los cinco que hubo antes (nav · clear · regular · dock · sheet)
 * quedaron superados por «Velo negro»: uno estandarizado para todo. El mapa
 * histórico está en docs/03-mapa-materiales.md, que ya no describe el código.
 */

/** Velo negro — los valores exactos del panel. Espejo de `.av-glass`. */
export const VELO_NEGRO = {
  radius: 18,
  lens: 26,        // --lg-edge
  compress: 82,    // --lg-scale (va NEGATIVO al feDisplacementMap)
  aberr: 0,
  blur: 3,
  sat: 1.12,
  bri: 0.85,
  veil: '#0E0E0F',
  veilAlpha: 0.35,
  veilCover: 1,
  spec: 0.85,
  elev: 0.80,
}

/** Marca — amarillo muestreado del letrero (12,766 px, moda #FFD600). */
export const BRAND = { yellow: '#FFD600', ink: '#0E0E0F', paper: '#FBFAF7' }

/**
 * Los dos topes de seguridad, para el lado JS (Figma).
 * La lente aplica los mismos en runtime leyendo del CSS.
 */
export function clamp(w, h, m = VELO_NEGRO) {
  const lens = Math.min(m.lens, Math.min(w, h) * 0.34)
  const compress = Math.min(m.compress, lens * 3.2)
  return { ...m, lens, compress }
}

/**
 * → efecto GLASS nativo de Figma (Plugin API).
 * `sat` y `bri` NO cruzan: Figma no expone saturate/brightness sobre el
 * backdrop. Es la única pérdida real del salto prototipo → Figma, y la razón
 * por la que el HTML sigue siendo la referencia de verdad.
 *
 * `lightAngle` es fijo, y ya lo es en los dos lados: el prototipo tenía un
 * `pointermove` que lo movía por elemento y se quitó — el filo saltaba con los
 * gestos rápidos y parecía un fallo. Los 135° de aquí son los mismos que los de
 * `--lg-ang`.
 */
export function toFigmaGlass(w, h, lightAngle = 135) {
  const m = clamp(w, h)
  return {
    type: 'GLASS',
    visible: true,
    refraction: m.compress / 100,
    depth: m.lens,
    dispersion: m.aberr / 100,
    radius: m.blur,
    lightIntensity: m.spec,
    lightAngle,
  }
}

export function toFigmaShadow() {
  const e = VELO_NEGRO.elev
  return {
    type: 'DROP_SHADOW',
    visible: true,
    blendMode: 'NORMAL',
    color: { r: 20 / 255, g: 14 / 255, b: 0, a: e * 0.42 },
    offset: { x: 0, y: Math.round(e * 26) },
    radius: Math.round(e * 52),
    spread: Math.round(e * -22),
  }
}
