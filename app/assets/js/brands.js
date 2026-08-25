/**
 * Las marcas — el primer rollo.
 *
 * Una marca es un NOMBRE y una lista de colorways. Nada más: la marca no tiene
 * color propio ni foto propia, porque lo que se enseña de ella son sus
 * productos. Si algún día tiene logo, entra aquí y el componente no se entera.
 *
 * `items` son ids de `colorways.js`. La marca no duplica producto: lo apunta.
 *
 * PENDIENTES a propósito y marcados con `pendiente: true`: Nike y New Balance
 * están en el dibujo de la referencia pero no hay un solo recorte suyo en
 * `public/products/`. Se dejan visibles y sin catálogo en vez de esconderlas:
 * una tienda que enseña cuatro marcas y sólo deja entrar en dos es información
 * honesta; una que enseña dos es una tienda más pequeña de lo que es.
 *
 * Cuando lleguen sus fotos, se les rellena `items` y se les quita el
 * `pendiente`. El componente ya sabe qué hacer con las dos formas.
 */

export const MARCAS = [
  {
    id: 'adidas',
    name: 'Adidas',
    items: ['samba-green', 'samba-night'],
  },
  {
    id: 'jordan',
    name: 'Air Jordan',
    /* Cinco, para que el rollo pueda enseñar sus cinco puestos. El quinto
       —`jordan-royal`— es un PLACEHOLDER que reutiliza una foto; ver la nota en
       `colorways.js`. */
    items: ['jordan-pine', 'jordan-brood', 'jordan-royal', 'jordan-ochre', 'jordan-chi'],
  },
  {
    id: 'nike',
    name: 'Nike',
    items: [],
    pendiente: true,
  },
  {
    id: 'new-balance',
    name: 'New Balance',
    items: [],
    pendiente: true,
  },
  /* La quinta, para que el rollo de marcas también llene sus cinco puestos. */
  {
    id: 'veja',
    name: 'Veja',
    items: [],
    pendiente: true,
  },
]

export const MARCA_IDS = MARCAS.map(m => m.id)

export function marcaPorId(id) {
  return MARCAS.find(m => m.id === id) || null
}
