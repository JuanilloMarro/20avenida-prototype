/**
 * Colorways — las variantes de <ProductShowcase>.
 *
 * Un colorway es UN objeto: el color solido del frame, el tono del texto
 * gigante del fondo, la tinta, el acento y la secuencia de frames del zapato.
 * Anadir un zapato es anadir una entrada aqui, no tocar el componente.
 *
 * Los tonos de `samba-green` estan muestreados de la foto del Samba OG:
 * ante verde colegial, tres bandas hueso, suela de goma y el «SAMBA» amarillo.
 */

/**
 * La secuencia del scrollover.
 *
 * El orden NO es el de los ficheros originales: es el de la rotacion. La camara
 * da la vuelta al zapato -- 3/4 delantero, perfil exterior, 3/4 trasero, perfil
 * interior -- y luego lo vuelca: cenital y suela. Cambiar el orden es reordenar
 * este array y nada mas.
 *
 * Las dos fotos `detail-view` que venian en resources/ NO estan aqui, y no es
 * una preferencia: son macros que sangran hasta el borde del encuadre (su caja
 * de contenido es la imagen entera). Metidas en la secuencia obligarian al
 * encuadre comun a ser el frame completo y encogerian los otros seis. Van en
 * `details`, para una galeria.
 */
const SAMBA_FRAMES = [
  { src: '/products/samba/01.webp', label: '3/4 delantero' },
  { src: '/products/samba/02.webp', label: 'Perfil exterior' },
  { src: '/products/samba/03.webp', label: '3/4 trasero' },
  { src: '/products/samba/04.webp', label: 'Perfil interior' },
  { src: '/products/samba/05.webp', label: 'Cenital' },
  { src: '/products/samba/06.webp', label: 'Suela' },
]

const SAMBA_DETAILS = [
  '/products/samba/detail-1.webp',
  '/products/samba/detail-2.webp',
]

export const COLORWAYS = {
  'samba-green': {
    name: 'Samba OG',
    line: 'Collegiate Green · Off White · Gum',
    /* el color sólido del frame */
    surface: '#DCE5DA',
    /* el texto gigante del frame de atrás — tonos verdes, como pediste */
    word: '#37624E',
    wordShadow: 'rgba(22, 38, 31, .10)',
    ink: '#16261F',
    inkSoft: 'rgba(22, 38, 31, .60)',
    hair: 'rgba(22, 38, 31, .22)',
    accent: '#F0D24B',
    frames: SAMBA_FRAMES,
    details: SAMBA_DETAILS,
    price: '120$',
  },

  /* La misma pieza en oscuro. Existe para demostrar que el componente es una
     plantilla y no un dibujo: cambia el colorway, no el template. */
  'samba-night': {
    name: 'Samba OG',
    line: 'Collegiate Green · Night',
    surface: '#16261F',
    word: '#2B4A3B',
    wordShadow: 'rgba(0, 0, 0, .25)',
    ink: '#E8EFE6',
    inkSoft: 'rgba(232, 239, 230, .58)',
    hair: 'rgba(232, 239, 230, .24)',
    accent: '#F0D24B',
    frames: SAMBA_FRAMES,
    details: SAMBA_DETAILS,
    price: '120$',
  },
}

export const COLORWAY_IDS = Object.keys(COLORWAYS)
export const DEFAULT_COLORWAY = 'samba-green'

/** → custom properties del frame. */
export function toCss(id) {
  const c = COLORWAYS[id] || COLORWAYS[DEFAULT_COLORWAY]
  return {
    '--ps-surface': c.surface,
    '--ps-word': c.word,
    '--ps-word-shadow': c.wordShadow,
    '--ps-ink': c.ink,
    '--ps-ink-soft': c.inkSoft,
    '--ps-hair': c.hair,
    '--ps-accent': c.accent,
  }
}
