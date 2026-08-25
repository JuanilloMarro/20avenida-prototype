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

/**
 * `short` — la palabra del texto gigante del acordeon.
 *
 * No vale `name` para eso: los cuatro paneles son el MISMO modelo, asi que los
 * cuatro dirian «Samba OG» y el texto dejaria de distinguir nada. Lo que los
 * separa es el colorway, y eso es lo que se pinta grande.
 *
 * En caja de frase, regla R1: ni `text-transform` ni escrito en versales.
 *
 * OJO con el nombre: el campo `word` de aqui abajo YA existe y es un COLOR —
 * el del texto gigante del showcase. Por eso este se llama `short` y no `word`.
 */
/**
 * Las tallas del Air Jordan 1. PLACEHOLDER: hoy es un array literal y todos los
 * colorways comparten el mismo, porque el stock real no existe todavía. Cuando
 * llegue el backend, cada producto traerá las suyas — y con disponibilidad, que
 * es lo que de verdad falta: aquí todas se pintan como si hubiera de todo.
 */
const TALLAS_AJ1 = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5]

export const COLORWAYS = {
  'samba-green': {
    name: 'Samba OG',
    short: 'Verde',
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
    short: 'Noche',
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

  /* ── Air Jordan 1 ─ los cuatro del acordeón ─────────────────────────
     Cuatro colorways del MISMO modelo, que es lo que pide un acordeón: lo que
     se compara es el color, no el zapato. Las fotos venían ya con alfa de
     verdad — no hizo falta `cutout-bg.py` — y se recortaron a una CAJA UNIÓN de
     647×636 para los cuatro (la tinta mayor más 46 px de margen por lado). Eso es lo que hace que los cuatro se lean a la
     misma escala: recortar cada uno a su propia caja normalizaría cada zapato
     al mismo tamaño aparente y el salto se notaría al pasar de panel a panel.

     `surface` es el plano de color del panel y sale del tono dominante del
     propio zapato, muestreado de la foto. `ink` se invierte con él: claro sobre
     los tres oscuros, oscuro sobre el ocre — no es una excepción de estilo, es
     que el contraste manda y el ocre es claro.

     `frames` trae UNA sola entrada: el acordeón usa `frames[0]` y estos no
     tienen secuencia de scrollover. Si algún día la tienen, se añaden aquí y
     ningún componente se entera.

     PLACEHOLDER: el precio. 180$ es el de calle del modelo, no un precio de
     20 Avenida. */

  'jordan-pine': {
    name: 'Air Jordan 1',
    short: 'Pino',
    line: 'Gorge Green · White',
    surface: '#1E5B3E',
    word: '#2D7351',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F2F7F3',
    inkSoft: 'rgba(242, 247, 243, .62)',
    hair: 'rgba(242, 247, 243, .24)',
    accent: '#E8C547',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Camina con la leyenda. Verde bosque sobre piel blanca, la silueta que abrió el camino y sigue marcándolo. Comodidad de siempre, materiales de ahora.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-pine.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  /* PLACEHOLDER COMPLETO — el quinto Jordan.
     No es un colorway real: reutiliza la foto del «pino» y sólo existe para que
     el rollo pueda enseñar sus CINCO puestos ocupados, que con cuatro dejaba
     uno vacío. Cuando llegue una quinta foto de verdad, se cambia `frames`, el
     nombre de la línea y el `short`, y nada más. Y si no llega, esto se borra:
     un catálogo con un producto inventado es peor que uno corto. */
  'jordan-royal': {
    name: 'Air Jordan 1',
    short: 'Royal',
    line: 'Game Royal · Black',
    surface: '#1B2A63',
    word: '#2C3F8C',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F1F3FA',
    inkSoft: 'rgba(241, 243, 250, .62)',
    hair: 'rgba(241, 243, 250, .24)',
    accent: '#E8C547',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Azul de cancha sobre negro. La silueta de siempre en el par de colores que la sacó del parqué a la calle.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-pine.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  'jordan-brood': {
    name: 'Air Jordan 1',
    short: 'Orquídea',
    line: 'Brotherhood · Purple · Gold',
    surface: '#A8478E',
    word: '#BE5FA2',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#FBF3F8',
    inkSoft: 'rgba(251, 243, 248, .62)',
    hair: 'rgba(251, 243, 248, .24)',
    accent: '#F0A830',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Dos colores que no deberían funcionar juntos y llevan décadas haciendólo. Orquídea y oro sobre la silueta más reconocible del baloncesto.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-brood.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  'jordan-ochre': {
    name: 'Air Jordan 1',
    short: 'Ocre',
    line: 'Yellow Ochre · Sail · Black',
    surface: '#E9A825',
    word: '#F5BE4E',
    wordShadow: 'rgba(42, 28, 5, .14)',
    /* tinta OSCURA: el ocre es el único plano claro de los cuatro */
    ink: '#2A1C05',
    inkSoft: 'rgba(42, 28, 5, .62)',
    hair: 'rgba(42, 28, 5, .22)',
    accent: '#1A1A1A',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Ocre, hueso y negro. La combinación más cálida de la serie, en la piel volumétrica que le dio nombre al modelo.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-ochre.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  'jordan-chi': {
    name: 'Air Jordan 1',
    short: 'Chicago',
    line: 'Varsity Red · White · Black',
    surface: '#C0182C',
    word: '#D63A4C',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#FFF4F5',
    inkSoft: 'rgba(255, 244, 245, .62)',
    hair: 'rgba(255, 244, 245, .24)',
    accent: '#F5D547',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'El colorway que empezó todo. Rojo, blanco y negro en el orden exacto en que se vieron por primera vez en una cancha.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-chi.webp', label: 'Perfil exterior' }],
    price: '180$',
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
