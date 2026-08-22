<script setup>
/**
 * El escenario.
 *
 * Orden de pintado, que no es negociable:
 *   1. la rampa de fondo
 *   2. el grano ENCIMA de la rampa pero DEBAJO del vidrio — si va encima, el
 *      backdrop-filter no lo recoge, y sobre `negro` el grano es además lo
 *      único que la lente tiene que refractar
 *   3. el contenido
 *   4. la capa que flota: nav, drawers, toasts
 */
import { COLORWAYS } from '~/assets/js/colorways'

const theme = useThemeStore()
const isDev = import.meta.dev

/**
 * El catálogo que ve el buscador de la barra.
 *
 * Vive AQUÍ y no dentro de <AppNav> a propósito: la barra no tiene por qué
 * saber qué se vende: se lo pasan. Cuando haya endpoint, lo que cambia es esta
 * línea y nada más.
 *
 * Sale de `colorways.js`, o sea de producto REAL con sus fotos ya recortadas.
 * Lo único inventado es el descuento del segundo, y está puesto para que se vea
 * funcionar ese estado — en cuanto haya precios de verdad, fuera.
 */
const catalog = computed(() => Object.entries(COLORWAYS).map(([id, c], i) => ({
  id,
  name: c.name,
  line: c.line,
  price: c.price,
  priceWas: i === 1 ? '150$' : undefined,   // PLACEHOLDER
  discount: i === 1 ? '-20%' : undefined,   // PLACEHOLDER
  image: c.frames?.[0]?.src,
})))
</script>

<template>
  <div
    class="stage"
    :class="{ 'is-light-bg': !theme.isDark }"
    :style="theme.stageStyle"
  >
    <div class="stage__grain" :style="theme.grainStyle" aria-hidden="true" />

    <AppNav :bag="1" :catalog="catalog" />

    <main class="stage__main">
      <slot />
    </main>

    <DevPanel v-if="isDev" />
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  /* `clip`, NO `hidden`. `overflow-x: hidden` implica `overflow-y: auto`, y eso
     convierte al escenario en contenedor de scroll: cualquier `position: sticky`
     de dentro pasa a pegarse a ESTE elemento —que no scrollea— en vez de al
     viewport, y deja de pegarse del todo. Es lo que rompía el scrollover del
     showcase. `clip` recorta igual y no crea contenedor de scroll. */
  overflow-x: clip;
  transition: background-color .5s ease;
  color: #fff;
}
.stage.is-light-bg { color: var(--av-ink); }

/* el grano: 3–6 % mata el banding de una rampa de 8 bits en pantalla grande,
   y le da a la lente algo que doblar sobre el negro */
.stage__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: overlay;
  background-size: 170px 170px;
  z-index: 0;
}

/* SIN z-index a propósito. Un z-index aquí crearía un contexto de apilado y
   dejaría el degradado del escenario FUERA del backdrop de sus hijos — y con
   eso `mix-blend-mode: screen` del letrero se queda sin nada contra lo que
   mezclar y la foto vuelve a enseñar su caja negra. Como .stage__grain es
   posicionado con z-index 0 y va antes en el DOM, el contenido queda encima
   igual, por orden de árbol. */
.stage__main { position: relative; flex: 1; display: flex; flex-direction: column; }
</style>
