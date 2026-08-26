/**
 * Las marcas — el primer rollo.
 *
 * Una marca es un NOMBRE y una lista de colorways. Nada más: la marca no tiene
 * color propio ni foto propia, porque lo que se enseña de ella son sus
 * productos. Si algún día tiene logo, entra aquí y el componente no se entera.
 *
 * `items` son ids de `colorways.js`. La marca no duplica producto: lo apunta.
 *
 * ESTA LISTA ES EL CATÁLOGO DE MARCAS DE LA CASA, y de ella sale la columna
 * «Marcas» del pie. Si una marca no está aquí, 20 Avenida no la vende.
 *
 * SE FUERON NEW BALANCE Y VEJA. Estuvieron, con producto y todo, y se han
 * quitado enteras porque la tienda no las vende: no basta con sacarlas del
 * rollo, porque mientras estuvieran aquí seguirían saliendo en el pie. Con
 * ellas se fueron sus entradas de `sneakers.js` y los `nb-*` de `colorways.js`.
 *
 * FALTA UNDER ARMOUR, que sí se vende, y no está porque no hay ni una foto suya
 * en `public/products/`. Se añade el día que la haya — una marca sin producto
 * aquí es un enlace del pie que lleva a una página vacía.
 *
 * Hubo un campo `pendiente: true` justo para eso: enseñar la marca sin dejar
 * entrar. El componente todavía sabe qué hacer con él, pero hoy no lo lleva
 * ninguna, así que si Under Armour entra antes que sus fotos, ése es el camino.
 *
 * ⚠️ LOS IDS VIENEN DE DOS CATÁLOGOS y conviene saberlo antes de tocar `items`:
 *
 *   `colorways.js`  el del escaparate y el acordeón — `mind-001`, `samba-*`,
 *                   `suede-*`, `jordan-*`. Trae el plano de color completo.
 *   `sneakers.js`   el del rollo y el díptico — seis zapatos con el encuadre
 *                   común, que es OTRO. Hoy ningún producto está en los dos; si
 *                   alguno lo estuviera, necesitaría un recorte por pieza.
 *
 * Aquí se apunta al que tiene el producto de verdad. Nadie consume `items`
 * todavía —el pie sólo usa `name` e `id`—, así que si el día que se consuma hace
 * falta un id space único, éste es el sitio donde resolverlo.
 */

export const MARCAS = [
  {
    id: 'adidas',
    name: 'Adidas',
    /* Los dos primeros son de `colorways.js` —los del escaparate viejo— y los
       tres siguientes, del catálogo del rollo. */
    items: ['samba-green', 'samba-night',
            'samba-bosque', 'samba-canamo', 'samba-tiza'],
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
    /* El Mind 001 es el zapato del escaparate; los tres Dunk, del rollo. */
    items: ['mind-001', 'dunk-universidad', 'dunk-carmin', 'dunk-niebla'],
  },
  {
    id: 'puma',
    name: 'Puma',
    /* Los cuatro del acordeón. Son de `colorways.js` y no de `sneakers.js`: el
       Suede sólo sale en el acordeón, así que tiene un encuadre y no dos. */
    items: ['suede-miel', 'suede-arena', 'suede-pecana', 'suede-hueso'],
  },
]

export const MARCA_IDS = MARCAS.map(m => m.id)

export function marcaPorId(id) {
  return MARCAS.find(m => m.id === id) || null
}
