/**
 * El catálogo del rollo — <ProductReel>.
 *
 * Seis zapatos de dos marcas — tres adidas Samba y tres Nike Dunk Low. Las
 * fotos las arma `scripts/build-sneakers.py`.
 *
 * FUERON CATORCE, de cuatro marcas. Se cayeron las cinco New Balance 9060 y los
 * tres Veja Campo: 20 Avenida no vende esas dos marcas, así que su sitio no era
 * «apagadas» ni «pendientes» sino fuera del fichero. Con ellas se fueron también
 * sus recortes del acordeón (`nb-*` en `colorways.js`) y sus dos entradas de
 * `brands.js`, que era lo que las mantenía vivas.
 *
 * LA CAJA UNIÓN CAMBIÓ CON ELLAS: era 1160×599 y ahora es 1160×550, porque la
 * altura la marcaba el 9060, que es el más alto del grupo. Los seis que quedan
 * están reencuadrados más ajustados — la caja tiene que ser la unión de lo que
 * se enseña, no de lo que se enseñó una vez.
 *
 * POR QUÉ VIVE AQUÍ Y NO EN `colorways.js`, que es donde se esperaría:
 *
 * `colorways.js` describe un producto por su COLOR — es lo que pinta el
 * escaparate y el acordeón, y por eso sus entradas llevan `surface`, `word`,
 * `ink` y compañía: un plano de marca completo. Este fichero describe otra cosa:
 * el ENCUADRE del rollo. Los seis comparten caja unión (1160×550, normalizada
 * por LARGO) porque la regla de la pieza es «un rollo, un encuadre» — si los
 * assets no comparten caja, el zapato pega un salto de tamaño justo al girar.
 *
 * HUBO AQUÍ UN `reencuadra()` y se fue con las New Balance. Servía para lo
 * siguiente, que sigue siendo verdad y hará falta el día que un mismo producto
 * salga en las dos piezas: una zapatilla que esté en el acordeón Y en el rollo
 * necesita DOS recortes —cada pieza tiene su caja— y un `frames` no puede ser
 * dos cosas a la vez; así que se importaba la entrada de `colorways.js` entera y
 * sólo se le cambiaba el `frames`. Hoy no hay solape: el acordeón lleva Puma y
 * el rollo, Samba y Dunk. Cuando lo haya, el patrón está aquí escrito.
 *
 * LOS PRECIOS. Verificados donde se pudo: el Dunk Low son 115$ de tarifa y el
 * Samba OG está por debajo de 120 — se le ponen los 100$ de siempre, y 110$ al
 * XLG, que es el de suela gruesa.
 *
 * TRES SON IMAGEN ESPEJO y se dejan así a propósito — los Samba, con el «SAMBA»
 * del lateral leyéndose al revés. Voltearlas arregla el texto y rompe la
 * dirección: los seis apuntan la puntera a la izquierda, y en un carrusel que
 * intercambia posiciones, tres mirando al otro lado se lee como un fallo de
 * montaje en cada giro. Está anotado también en el script.
 */

/* Diez tallas — no hay stock de verdad, es un placeholder. El tramo es el de un
   zapato de horma normal, que es lo que son los seis. */
const TALLAS = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5]

/** El encuadre del rollo. Un solo sitio que sepa dónde viven estas fotos. */
const foto = (id, label) => [{ src: `/products/sneakers/${id}.webp`, label }]

export const SNEAKERS = {
  /* ── adidas Samba ────────────────────────────────────────────────────── */
  'samba-bosque': {
    name: 'adidas Samba OG',
    short: 'Bosque',
    line: 'Collegiate Green · Off White · Gum',
    surface: '#22382D',
    word: '#2F4B3C',
    wordShadow: 'rgba(0, 0, 0, .22)',
    ink: '#F2F6F1',
    inkSoft: 'rgba(242, 246, 241, .62)',
    hair: 'rgba(242, 246, 241, .24)',
    accent: '#784A29',
    blurb: 'Ante verde bosque, tres bandas en hueso y puntera de goma en topo. El Samba de siempre sobre suela de caramelo: nació en el hielo y lleva sesenta años sin salir de la calle.',
    sizes: TALLAS,
    frames: foto('samba-bosque', 'Perfil exterior'),
    price: '100$',
  },
  'samba-canamo': {
    name: 'adidas Samba XLG',
    short: 'Cáñamo',
    line: 'Hemp · Cream White · Gum',
    surface: '#4A4034',
    word: '#5E5243',
    wordShadow: 'rgba(0, 0, 0, .20)',
    ink: '#F7F3EC',
    inkSoft: 'rgba(247, 243, 236, .62)',
    hair: 'rgba(247, 243, 236, .24)',
    accent: '#B48758',
    blurb: 'El Samba con suela XLG — la misma silueta baja montada sobre una plataforma de caramelo que le sube el perfil entero. Ante de cáñamo, bandas en crema.',
    sizes: TALLAS,
    frames: foto('samba-canamo', 'Perfil exterior'),
    price: '110$',
  },
  'samba-tiza': {
    name: 'adidas Samba OG',
    short: 'Tiza',
    line: 'Cloud White · Core Black · Gum',
    surface: '#33322F',
    word: '#44423E',
    wordShadow: 'rgba(0, 0, 0, .24)',
    ink: '#F6F5F3',
    inkSoft: 'rgba(246, 245, 243, .62)',
    hair: 'rgba(246, 245, 243, .24)',
    accent: '#463C33',
    blurb: 'Piel blanca, tres bandas negras y suela de caramelo. Es el Samba que todo el mundo tiene en la cabeza cuando dice Samba, y el que no se puede hacer mal.',
    sizes: TALLAS,
    frames: foto('samba-tiza', 'Perfil exterior'),
    price: '100$',
  },

  /* ── Nike Dunk Low ───────────────────────────────────────────────────── */
  'dunk-universidad': {
    name: 'Nike Dunk Low',
    short: 'Universidad',
    line: 'University Blue · White',
    surface: '#1E3A52',
    word: '#2A5175',
    wordShadow: 'rgba(0, 0, 0, .20)',
    ink: '#EFF5FA',
    inkSoft: 'rgba(239, 245, 250, .62)',
    hair: 'rgba(239, 245, 250, .24)',
    accent: '#67A7D8',
    blurb: 'Azul universidad sobre piel blanca. El Dunk salió de una campaña de baloncesto universitario en el 85 y este es el par que más se parece a aquello.',
    sizes: TALLAS,
    frames: foto('dunk-universidad', 'Perfil exterior'),
    price: '115$',
  },
  'dunk-carmin': {
    name: 'Nike Dunk Low',
    short: 'Carmín',
    line: 'University Red · White',
    surface: '#4A1414',
    word: '#6B1C1B',
    wordShadow: 'rgba(0, 0, 0, .24)',
    ink: '#FBF1F0',
    inkSoft: 'rgba(251, 241, 240, .62)',
    hair: 'rgba(251, 241, 240, .24)',
    accent: '#C91615',
    blurb: 'Rojo universidad y blanco, el bloque de color más directo del catálogo. Sin degradados ni materiales raros: dos piezas de piel y una suela.',
    sizes: TALLAS,
    frames: foto('dunk-carmin', 'Perfil exterior'),
    price: '115$',
  },
  'dunk-niebla': {
    name: 'Nike Dunk Low',
    short: 'Niebla',
    line: 'Wolf Grey · Summit White',
    surface: '#3A3A38',
    word: '#4C4C4A',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F5F5F4',
    inkSoft: 'rgba(245, 245, 244, .62)',
    hair: 'rgba(245, 245, 244, .24)',
    accent: '#999A98',
    blurb: 'Gris lobo sobre blanco cumbre. El Dunk sin color, para quien quiere la silueta y no el bloque — el par que combina con todo porque no discute con nada.',
    sizes: TALLAS,
    frames: foto('dunk-niebla', 'Perfil exterior'),
    price: '115$',
  },

}

/**
 * EL ORDEN DEL ROLLO, y va escrito a mano porque el orden dice algo.
 *
 * Se alternan las marcas en vez de agruparlas: agrupadas, el rollo enseña tres
 * Dunk seguidos y parece que la tienda sólo vende eso. Alternadas, cada giro
 * cambia de marca y de silueta — que es lo que un escaparate tiene que hacer.
 * Es el mismo orden del script que arma las fotos.
 *
 * SEIS ES EL MÍNIMO PRÁCTICO de esta pieza y conviene saberlo antes de quitar
 * otro: el rollo enseña CINCO a la vez —foco, dos lados y dos extremos— así que
 * con seis se ve casi el catálogo entero de una y el giro deja de descubrir
 * nada. Por debajo de cinco, además, la rueda tendría que repetir un zapato en
 * dos puestos a la vez. Si la lista se queda corta, lo que hay que hacer es
 * añadir producto, no bajar el número de puestos.
 */
export const SNEAKER_IDS = [
  'dunk-universidad', 'samba-bosque',
  'dunk-carmin', 'samba-canamo',
  'dunk-niebla', 'samba-tiza',
]
