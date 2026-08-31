/**
 * El catálogo de la tienda — `/tienda`.
 *
 * ⚠️ TODO ESTE FICHERO ES PLACEHOLDER salvo las fotos. Nombres, precios,
 * descuentos, marcas y taxonomías están inventados para que la página se pueda
 * mirar y filtrar; el día que haya endpoint, lo que sobrevive es la FORMA de un
 * producto y las listas de facetas, no los valores.
 *
 * POR QUÉ VIVE AQUÍ Y NO EN `sneakers.js` NI EN `colorways.js`:
 *
 *   `colorways.js`  describe un producto por su COLOR — plano, tinta, acento.
 *                   Es lo que pintan el escaparate y el acordeón.
 *   `sneakers.js`   describe el ENCUADRE del rollo: seis zapatos que comparten
 *                   caja unión porque si no, el carrusel pega un salto al girar.
 *   `shop.js`       describe un producto de CATÁLOGO: lo que hace falta para
 *                   listarlo y filtrarlo — marca, género, categoría, color,
 *                   tallas, precio y descuento.
 *
 * Son tres vistas distintas del mismo negocio y por eso son tres ficheros. Un
 * único fichero con la unión de los tres campos obligaría a cada pieza a saber
 * de campos que no usa.
 *
 * LAS FOTOS SON LAS DEL PANAL, los 26 recortes de `public/products/panel/`, que
 * comparten caja unión 182×134. Se reutilizan a propósito: son los únicos 26
 * recortes que hay, y una tienda necesita variedad más que exactitud mientras no
 * haya catálogo.
 */

/* ── LAS FACETAS ─────────────────────────────────────────────────────────
   Cada lista es una faceta del filtro lateral. El orden es el que se pinta: de
   lo más usado a lo menos, no alfabético — nadie filtra por «Under Armour»
   antes que por «Nike». */

export const MARCAS = ['Nike', 'adidas', 'Puma', 'New Balance', 'Under Armour']

export const GENEROS = ['Hombre', 'Mujer', 'Unisex']

export const CATEGORIAS = ['Lifestyle', 'Running', 'Básquet', 'Fútbol', 'Entrenamiento']

export const ESTILOS = ['Retro', 'Bajo', 'Alto', 'Tacos', 'Placa']

/** Con muestra de color: una faceta de color sin color es una lista de palabras. */
export const COLORES = [
  { id: 'negro',   name: 'Negro',   hex: '#141416' },
  { id: 'blanco',  name: 'Blanco',  hex: '#F2F2EF' },
  { id: 'azul',    name: 'Azul',    hex: '#2C6FB5' },
  { id: 'rojo',    name: 'Rojo',    hex: '#C0182C' },
  { id: 'verde',   name: 'Verde',   hex: '#2E6B4A' },
  { id: 'gris',    name: 'Gris',    hex: '#8A8A8E' },
  { id: 'ocre',    name: 'Ocre',    hex: '#E9A825' },
  { id: 'morado',  name: 'Morado',  hex: '#7B4B9B' },
]

/** Diez tallas, escala US. Mismo tramo que el resto del sitio. */
export const TALLAS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5]

/** El tope del filtro de precio, en quetzales. */
export const PRECIO_MAX = 3000

/* ── EL CATÁLOGO ─────────────────────────────────────────────────────────
   Se GENERA en vez de escribirse a mano, y la diferencia importa: veintiséis
   entradas escritas una por una son veintiséis sitios donde equivocarse y un
   fichero de cuatrocientas líneas que nadie relee. Generado, el reparto de
   facetas es reproducible —siempre el mismo, porque depende del índice y no del
   azar— y cabe en una pantalla.

   ⚠️ EL SALTO DE CADA FACETA TIENE QUE SER COPRIMO CON SU LONGITUD, y no basta
   con que sea primo — que es el error que tuvo esto y costó encontrarlo porque no
   rompe nada: simplemente el filtro no filtraba.

   `(i * 3) % 3` es CERO para todo i, así que los veintiséis productos salían del
   mismo género; `(i * 5) % 5`, lo mismo con las categorías. El salto recorre la
   lista entera sólo si no comparte divisor con ella. Con 3 valores el salto va en
   2; con 5, en 3; con 8, en 3.

   Y los saltos son distintos entre facetas para que no se sincronicen: con el
   mismo, todos los Nike acabarían siendo del mismo color y el filtro no tendría
   nada que enseñar. */

const MODELOS = [
  'Air Zoom Pegasus', 'Dunk Low Retro', 'Air Force 1 Mid', 'Samba OG',
  'Gazelle Indoor', 'Suede Classic', 'RS-X Reinvent', '9060 Sea Salt',
  'Curry Flow 11', 'Mercurial Superfly', 'Metcon 7', 'Vomero Plus',
  'Air Max 97',
]

const foto = n => `/products/panel/panel-${String(n + 1).padStart(2, '0')}.webp`

/** Quetzales con separador de miles y dos decimales — «Q 1,350.00». */
export const quetzales = n =>
  'Q ' + n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const PRODUCTOS = Array.from({ length: 26 }, (_, i) => {
  const marca = MARCAS[i % MARCAS.length]
  const modelo = MODELOS[i % MODELOS.length]

  /* El precio sube en escalones de 90 y da la vuelta a los 2 600: así hay
     producto barato y caro en todas las marcas, que es lo que hace que el filtro
     de precio se note al moverlo. */
  const precio = 690 + ((i * 190) % 1900)

  /* Uno de cada tres lleva descuento. Suficiente para que la píldora aparezca en
     la retícula sin que deje de ser una excepción — si todo está rebajado, la
     rebaja no dice nada. */
  const rebaja = i % 3 === 0 ? [10, 15, 20][i % 3 === 0 ? (i / 3) % 3 : 0] : 0

  return {
    id: 'p' + String(i + 1).padStart(2, '0'),
    /* El SKU es decorativo — sale en la ficha de la card como en la referencia.
       Se arma del índice para que sea estable entre recargas. */
    sku: 'SKU ' + marca.slice(0, 2).toUpperCase() + (10000 + i * 137),
    brand: marca,
    name: `${marca} ${modelo}`.toUpperCase(),
    src: foto(i),

    genero: GENEROS[(i * 2) % GENEROS.length],
    categoria: CATEGORIAS[(i * 3) % CATEGORIAS.length],
    estilo: ESTILOS[(i * 7) % ESTILOS.length],
    color: COLORES[(i * 11) % COLORES.length].id,

    /* Nadie tiene el tramo entero: una talla filtra de verdad cuando deja fuera
       la mitad del catálogo. Cada producto se lleva seis consecutivas. */
    sizes: TALLAS.slice(i % 5, (i % 5) + 6),

    precio,
    /* El precio ANTES del descuento, que es el que va tachado. Se calcula del
       precio final para que los dos números no puedan contradecirse. */
    precioAntes: rebaja ? Math.round(precio / (1 - rebaja / 100) / 5) * 5 : 0,
    rebaja,
  }
})
