/**
 * 20 Avenida — materiales liquid-glass
 * FUENTE ÚNICA. De aquí salen: las custom properties CSS, las variables de Figma
 * y los props de <GlassSurface>. Si un valor cambia, cambia aquí y solo aquí.
 *
 * `clear` lleva los valores exactos del panel del artefacto 02 tal como quedaron
 * ajustados: velo 0.42, desenfoque 3, saturación 1.00, brillo 0.85, aberración 0.
 */

export const MATERIALS = {
  clear:   { blur: 3,  lens: 26, compress: 82, sat: 1.00, bri: 0.85, veil: 0.42, cover: 1.00, aberr: 0, spec: 0.50, elev: 0.80, radius: 20 },
  regular: { blur: 14, lens: 20, compress: 52, sat: 1.30, bri: 1.00, veil: 0.12, cover: 1.00, aberr: 2, spec: 0.50, elev: 0.80, radius: 20 },
  dock:    { blur: 6,  lens: 32, compress: 96, sat: 1.18, bri: 1.00, veil: 0.05, cover: 1.00, aberr: 4, spec: 0.50, elev: 0.80, radius: 20 },
  sheet:   { blur: 32, lens: 14, compress: 24, sat: 1.32, bri: 1.00, veil: 0.34, cover: 1.00, aberr: 1, spec: 0.50, elev: 0.80, radius: 20 },
}

/** Velo adaptativo: fondo claro → blanco, fondo oscuro → tinta. Es un token, no dos componentes. */
export const VEIL = { light: '255,255,255', dark: '10,10,13' }

/** Color del glifo. El panel quedó en `white` fijo, no en `adaptive`. */
export const INK = {
  mode: 'white',            // 'adaptive' | 'ink' | 'white' | 'difference'
  threshold: 0.80,          // umbral de luminancia (adaptive)
  hysteresis: 0.035,        // banda muerta, evita parpadeo al cruzar un filo
  sampleHz: 14,             // el muestreo es decisión de color, no animación
}

export const LIGHT = { followsCursor: true, angle: 157 }

/** Marca — amarillo muestreado del letrero (12,766 px, moda #FFD600). */
export const BRAND = { yellow: '#FFD600', ink: '#0E0E0F', paper: '#FBFAF7' }

/**
 * Los dos topes de seguridad. Sin ellos una píldora de 40px se deforma entera
 * y el número deja de leerse.
 */
export function clamp(m, w, h) {
  const lens = Math.min(m.lens, Math.min(w, h) * 0.34)
  const compress = Math.min(m.compress, lens * 3.2)
  return { ...m, lens, compress }
}

/** → custom properties CSS. `scale` va NEGATIVO al feDisplacementMap. */
export function toCss(name, w, h, dark = true) {
  const m = clamp(MATERIALS[name], w, h)
  return {
    '--lg-r': `${m.radius}px`,
    '--lg-blur': `${m.blur}px`,
    '--lg-edge': `${m.lens}px`,
    '--lg-scale': `${-m.compress}`,
    '--lg-aberr': `${m.aberr}%`,
    '--lg-sat': m.sat,
    '--lg-bri': m.bri,
    '--lg-tint-a': m.veil,
    '--lg-tint-cover': m.cover,
    '--lg-spec': m.spec,
    '--lg-elev': m.elev,
    '--veil': dark ? VEIL.dark : VEIL.light,
  }
}

/**
 * → efecto GLASS nativo de Figma (Plugin API).
 * `sat` y `bri` NO cruzan: Figma no expone saturate/brightness sobre el backdrop.
 * Es la única pérdida real del salto artefacto → Figma.
 */
export function toFigmaGlass(name, w, h) {
  const m = clamp(MATERIALS[name], w, h)
  return {
    type: 'GLASS',
    visible: true,
    refraction: m.compress / 100,
    depth: m.lens,
    dispersion: m.aberr / 100,
    radius: m.blur,
    lightIntensity: m.spec,
    lightAngle: LIGHT.angle,
  }
}

export function toFigmaShadow(name) {
  const e = MATERIALS[name].elev
  return {
    type: 'DROP_SHADOW',
    visible: true,
    blendMode: 'NORMAL',
    color: { r: 0, g: 0, b: 0, a: e * 0.45 },
    offset: { x: 0, y: Math.round(e * 20) },
    radius: Math.round(e * 48),
    spread: 0,
  }
}