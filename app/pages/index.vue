<script setup>
/**
 * Landing.
 *
 * El recorrido, de arriba abajo: <ProductShowcase> con su scrollover, el
 * acordeón, el rollo, el panal y el díptico. Los tres últimos comparten plano
 * negro con el pie, así que el final de la página se lee como un bloque y no
 * como cuatro cortes. El pie NO está aquí — vive en el layout, detrás
 * de `</main>`, con la barra; ver la cabecera de <SiteFooter>.
 *
 * SE FUE EL BANCO DE PRUEBAS DEL SCROLL que cerraba la página. Era el héroe con
 * el letrero, y estaba puesto sólo para tener altura que scrollear mientras se
 * comprobaba que la barra fija aguantaba hasta abajo y que el velo negro no se
 * inmutaba al pasar de una sección clara a una oscura. Las dos cosas las
 * comprueban ya cuatro componentes reales; lo que faltaba era el cierre, y eso
 * es el pie.
 */

/* La ruta de producto todavía no existe, así que de momento el acordeón sólo
   dice a dónde iría. Cuando exista `/producto/:id`, esto es un `navigateTo`. */
function onProducto(id) {
  if (import.meta.dev) console.info('[acordeón] detalle abierto:', id)
}

/* El rollo lleva a la ficha, igual que el acordeón: los dos apuntan al mismo
   sitio y de momento ninguno de los dos tiene ruta a la que ir. */
function onRollo(id) {
  if (import.meta.dev) console.info('[rollo] detalle abierto:', id)
}


/* El panal aún no lleva ids reales — son 26 recortes sueltos, sin catálogo
   detrás— así que de momento sólo dice cuál se tocó por su posición. Cuando el
   backend mande ids, esto es el mismo `navigateTo` que el acordeón. */
function onPanal(id) {
  if (import.meta.dev) console.info('[panal] celda:', id)
}

/* El díptico todavía no tiene catálogo detrás — son dos fotos editoriales
   repartidas en seis celdas— así que sólo dice qué posición se tocó. Cuando
   haya ids reales, esto es el mismo `navigateTo` que el acordeón. */
function onDiptico(i) {
  if (import.meta.dev) console.info('[díptico] celda:', i)
}

/* Sin carrito todavía: de momento sólo se dice qué se compraría y en qué talla.
   Lo comparten el showcase, el acordeón y el rollo — los tres mandan lo mismo,
   `{ id, size }`, así que no hacen falta tres manejadores. El del showcase llega
   siempre sin talla (ahí no se elige), y por eso el `??` de abajo no es
   defensivo: es un caso real. Cuando exista la bolsa, esto es un `cart.add()`. */
function onComprar({ id, size }) {
  if (import.meta.dev) console.info('[comprar]', id, 'talla', size ?? '(sin elegir)')
}
</script>

<template>
  <div class="home">
    <ProductShowcase @buy="onComprar" />

    <!-- EL ACORDEÓN ENTRA JUSTO DEBAJO DEL SCROLLOVER, que se lleva 375vh de
         carril: cuando esto aparece, su `sticky` ya soltó. -->
    <ProductAccordion
      :items="['suede-miel', 'suede-arena', 'suede-pecana', 'suede-hueso']"
      @select="onProducto"
      @buy="onComprar"
    />

    <!-- EL CARTEL DE DOBLE COLUMNA, entre el acordeón y el bloque negro.
         Aquí y no al final por el color: el acordeón es un plano de color y el
         rollo abre la seguidilla de negros con la que cierra la página. Metido
         entre ellos, el cartel es la última pieza clara y la transición va de
         claro a claro a oscuro en vez de dar dos saltos. -->
    <ProductPoster />

    <!-- EL ROLLO, DESPUÉS DEL ACORDEÓN. Se probó al revés —rollo primero— y se
         volvió: el rollo abre su propia ficha a pantalla completa, y ponerlo
         pegado al scrollover encadenaba dos piezas que se comen el viewport y
         piden gesto antes de que la página haya enseñado nada que se pueda
         comparar.

         Su fondo es el negro del sistema, el mismo del panal y del díptico. Con
         el rollo pegado al escaparate llegó a pasársele el `surface` claro del
         colorway para que la costura no se notara; ya no hace falta y se quitó
         — el rollo es una de las tres piezas negras con las que cierra la
         página. -->
    <ProductReel @select="onRollo" @buy="onComprar" />

    <!-- El panal entra después del acordeón: el acordeón enseña CUATRO productos
         de cerca y el panal enseña que hay muchos más. En ese orden cuenta algo;
         al revés son dos cuadrículas seguidas. -->
    <ProductHoneycomb @pick="onPanal" />

    <!-- EL DÍPTICO CIERRA, y va DESPUÉS del panal a propósito: es la única
         pieza de la landing con fondo claro, así que rompe la seguidilla de
         negros justo antes del pie en vez de partirla por la mitad. Metido
         entre el rollo y el panal deshacía el par que esos dos forman —uno a
         pedestal, muchos de un vistazo—, que está documentado ahí arriba. -->
    <ProductDiptych @select="onDiptico" />
  </div>
</template>

<style scoped>
/* Lo único que queda de estilo propio de la página: el `flex: 1` que la hace
   ocupar el alto del escenario. Todo lo demás —el héroe del banco de pruebas y
   sus botones— se fue con él. Los componentes traen su propio estilo. */
.home { flex: 1; display: flex; flex-direction: column; }
</style>
