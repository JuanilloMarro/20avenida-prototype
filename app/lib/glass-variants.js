/**
 * Las variantes del material, en un módulo aparte por una razón mecánica:
 * `defineProps()` se iza fuera del `setup()`, así que su validador no puede
 * leer una constante declarada en el mismo bloque — pero un import SÍ.
 *
 * Antes la lista iba escrita a mano dentro del validador. Funcionaba, pero era
 * el único sitio del material donde el conjunto cerrado vivía dentro de una
 * expresión: añadir una variante obligaba a acordarse de tocar `glass.css` y
 * además una línea perdida en medio de un `defineProps`.
 *
 * CONJUNTO CERRADO. Un nombre que no esté aquí avisa en desarrollo en vez de
 * fallar en silencio, que es como se cuelan los materiales nuevos.
 *
 * La regla para añadir una: sólo si VARIOS tokens tienen que moverse juntos y
 * quedarse sincronizados. Si sólo cambia el radio, eso es el prop `radius`.
 */
export const VARIANTES_GLASS = [
  /** a sangre: radio 0, lente ancha, sin marco */
  'panel',
  /** velo BLANCO y contenido a tinta sólida */
  'light',
  /** de lista: sin lente ni marco — para piezas que se repiten */
  'sheet',
  /** `panel` con esquina: el desplegable de escritorio */
  'dropdown',
]
