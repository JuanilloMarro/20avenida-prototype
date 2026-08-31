<script setup>
/**
 * <ShopFilters> — la columna de facetas de `/tienda`.
 *
 * UNA SOLA PIEZA DE VIDRIO con las secciones dentro, y no una por sección. Seis
 * paneles apilados serían seis instancias del material en una columna: se leería
 * como seis cajas sueltas y costaría seis lentes. La columna es UNA superficie
 * que flota, y lo que la divide por dentro son filetes, que es lo que ya hace el
 * menú de la barra.
 *
 * EL ESTADO NO VIVE AQUÍ. Entra y sale por `v-model`: la página es quien filtra
 * y quien sabe cuántos productos quedan, y una columna de filtros que guardara su
 * propia copia obligaría a sincronizar dos verdades. Aquí sólo se pinta y se
 * emite.
 */
import { SlidersHorizontal, ChevronDown } from 'lucide-vue-next'
import { GENEROS, CATEGORIAS, ESTILOS, COLORES, TALLAS, PRECIO_MAX } from '~/assets/js/shop'

const f = defineModel({ type: Object, required: true })

/* Qué secciones están abiertas. Arranca con Género abierto y el resto cerradas —
   igual que la referencia: la primera enseña de qué van las demás sin que haya
   que abrirlas todas. */
const abiertas = ref({ genero: true, categoria: false, estilo: false, color: false, talla: false })

/* Marca y desmarca dentro de una faceta. Se hace aquí y no en la plantilla para
   que el `v-for` no lleve lógica: una faceta es una LISTA de valores elegidos, y
   tocar un valor es quitarlo si está y ponerlo si no. */
function alterna(faceta, valor) {
  const xs = f.value[faceta]
  const i = xs.indexOf(valor)
  f.value = { ...f.value, [faceta]: i === -1 ? [...xs, valor] : xs.toSpliced(i, 1) }
}

/* Las dos manijas del precio no pueden cruzarse: si la de abajo pasa a la de
   arriba, el rango se invierte y deja de casar ningún producto. Se topan la una
   contra la otra en vez de dejar que se crucen. */
function precioMin(v) {
  f.value = { ...f.value, precio: [Math.min(+v, f.value.precio[1]), f.value.precio[1]] }
}
function precioMax(v) {
  f.value = { ...f.value, precio: [f.value.precio[0], Math.max(+v, f.value.precio[0])] }
}

/* El tramo pintado del carril, en porcentaje. Sale del estado y no de los
   `input`, así que el relleno no puede desincronizarse de las manijas. */
const tramo = computed(() => ({
  '--sf-a': (f.value.precio[0] / PRECIO_MAX * 100).toFixed(2) + '%',
  '--sf-b': (f.value.precio[1] / PRECIO_MAX * 100).toFixed(2) + '%',
}))

/* El orden es el de la referencia y Colores va EN LA MISMA LISTA aunque se pinte
   distinto — lleva muestra de color. Sacarlo a un bloque aparte obligaba a
   ponerlo al principio o al final, y su sitio está en medio. La plantilla
   bifurca por `tipo`; el orden lo sigue mandando esta lista. */
const SECCIONES = [
  { id: 'genero', titulo: 'Género', ops: GENEROS },
  { id: 'categoria', titulo: 'Categorías', ops: CATEGORIAS },
  { id: 'estilo', titulo: 'Estilos', ops: ESTILOS },
  { id: 'color', titulo: 'Colores', ops: COLORES, tipo: 'color' },
  { id: 'talla', titulo: 'Tallas', ops: TALLAS },
]
</script>

<template>
  <GlassSurface tag="aside" class="sf" aria-label="Filtros">
    <div class="sf__head">
      <h2 class="sf__title">Filtros</h2>
      <SlidersHorizontal class="sf__ico" :stroke-width="1.8" />
    </div>

    <!-- ── PRECIO ────────────────────────────────────────────────────────
         Dos `input[type=range]` SUPERPUESTOS, no un control a medida. El nativo
         trae el arrastre, el teclado y el anuncio de un deslizador ya resueltos;
         reimplementarlo con `pointerdown` es rehacer todo eso y hacerlo peor.

         Lo que se pinta encima es sólo el carril: los dos nativos van con el
         suyo transparente y quedan las manijas. -->
    <section class="sf__block">
      <p class="sf__label">Precio</p>

      <div class="sf__range" :style="tramo">
        <span class="sf__track" aria-hidden="true" />
        <span class="sf__fill" aria-hidden="true" />
        <input
          type="range" min="0" :max="PRECIO_MAX" step="10"
          :value="f.precio[0]" aria-label="Precio mínimo"
          @input="precioMin($event.target.value)"
        >
        <input
          type="range" min="0" :max="PRECIO_MAX" step="10"
          :value="f.precio[1]" aria-label="Precio máximo"
          @input="precioMax($event.target.value)"
        >
      </div>

      <div class="sf__ends">
        <span>Q{{ f.precio[0] }}</span>
        <span>Q{{ f.precio[1] }}</span>
      </div>
    </section>

    <!-- ── LAS FACETAS DE LISTA ──────────────────────────────────────────
         Todas iguales salvo Colores, que además enseña la muestra. Se pintan de
         una lista y no a mano: añadir una faceta es añadir una entrada en
         `SECCIONES`, no un bloque de marcado. -->
    <section v-for="s in SECCIONES" :key="s.id" class="sf__block">
      <button
        type="button"
        class="sf__toggle"
        :aria-expanded="abiertas[s.id]"
        @click="abiertas[s.id] = !abiertas[s.id]"
      >
        {{ s.titulo }}
        <span v-if="f[s.id].length" class="sf__count">{{ f[s.id].length }}</span>
        <ChevronDown class="sf__chev" :stroke-width="2" />
      </button>

      <!-- `v-show` y no `v-if`: dentro de una superficie de vidrio, montar y
           desmontar en cada apertura es lo que deja al `backdrop-filter` sin
           resolver su referencia. Regla R5 del paquete. -->
      <div v-show="abiertas[s.id]" class="sf__ops" :class="{ 'sf__ops--color': s.tipo === 'color' }">
        <!-- Colores lleva muestra; las demás, sólo la palabra. Es la única
             diferencia entre las cinco secciones, así que es una bifurcación y no
             un segundo bloque de marcado. -->
        <template v-if="s.tipo === 'color'">
          <button
            v-for="c in s.ops"
            :key="c.id"
            type="button"
            class="sf__op sf__op--color"
            :class="{ 'is-on': f.color.includes(c.id) }"
            :aria-pressed="f.color.includes(c.id)"
            @click="alterna('color', c.id)"
          >
            <span class="sf__dot" :style="{ background: c.hex }" aria-hidden="true" />
            {{ c.name }}
          </button>
        </template>

        <button
          v-for="o in (s.tipo === 'color' ? [] : s.ops)"
          :key="o"
          type="button"
          class="sf__op"
          :class="{ 'is-on': f[s.id].includes(o) }"
          :aria-pressed="f[s.id].includes(o)"
          @click="alterna(s.id, o)"
        >{{ o }}</button>
      </div>
    </section>

  </GlassSurface>
</template>

<style scoped>
.sf {
  align-self: start;
  padding: 20px;
  /* Se queda a la vista mientras la retícula pasa por al lado. Una columna de
     filtros que se va con el scroll obliga a subir a lo alto de la página cada
     vez que se quiere cambiar algo. */
  position: sticky;
  top: var(--av-nav-space, 87px);
}

.sf__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--av-on-glass-hair);
}
.sf__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
}
.sf__ico { width: 17px; height: 17px; color: var(--av-on-glass); }

/* Los filetes separan las secciones. El ÚLTIMO no lleva: un filete al final de
   una caja dibuja una línea sin nada debajo. */
.sf__block { padding: 16px 0; border-bottom: 1px solid var(--av-on-glass-hair); }
.sf__block:last-child { border-bottom: 0; padding-bottom: 0; }

.sf__label {
  margin: 0 0 14px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
}

/* ── EL DESLIZADOR DE PRECIO ───────────────────────────────────────────── */
.sf__range { position: relative; height: 20px; }

.sf__track,
.sf__fill {
  position: absolute;
  top: 50%;
  height: 3px;
  border-radius: 999px;
  transform: translateY(-50%);
  pointer-events: none;
}
.sf__track { left: 0; right: 0; background: var(--av-on-glass-hair); }
/* El tramo elegido, en amarillo de marca: es el único sitio de la columna con
   color, y por eso se ve sin necesitar más grosor. */
.sf__fill { left: var(--sf-a); right: calc(100% - var(--sf-b)); background: var(--av-y-400); }

/* LOS DOS NATIVOS, TRANSPARENTES Y ENCIMA. `pointer-events: none` en el control
   y `auto` en la manija: sin eso, el que se pinta último se traga todos los
   clics del carril y la otra manija no se puede coger nunca. */
.sf__range input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: none;
  appearance: none;
  pointer-events: none;
}
.sf__range input::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--av-on-glass-strong);
  border: 0;
  cursor: grab;
  pointer-events: auto;
}
.sf__range input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--av-on-glass-strong);
  border: 0;
  cursor: grab;
  pointer-events: auto;
}
.sf__range input:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--av-y-400); outline-offset: 2px; }

.sf__ends {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--av-on-glass);
}

/* ── LAS SECCIONES PLEGABLES ───────────────────────────────────────────── */
.sf__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 0;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.sf__chev {
  margin-left: auto;
  width: 16px;
  height: 16px;
  transition: transform .28s cubic-bezier(.22, 1, .36, 1);
}
.sf__toggle[aria-expanded="true"] .sf__chev { transform: rotate(180deg); }

/* Cuántas hay elegidas dentro de una sección cerrada. Sin esto, plegar una
   faceta con filtros puestos los esconde y la retícula queda filtrada sin que se
   vea por qué. */
.sf__count {
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--av-y-400);
  color: var(--av-ink);
  font-size: 11px;
  font-weight: 700;
}

.sf__ops {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding-top: 14px;
}
.sf__ops--color { flex-direction: column; }

/* Las opciones son PÍLDORAS y no casillas: en una faceta de cuatro o cinco
   valores cortos, una fila de píldoras ocupa dos líneas donde una lista de
   `checkbox` ocupa cinco — y la columna es estrecha. */
.sf__op {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid var(--av-on-glass-hair);
  border-radius: 999px;
  background: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass);
  cursor: pointer;
  transition: color .2s ease, border-color .2s ease, background-color .2s ease;
}
.sf__op:hover { color: var(--av-on-glass-strong); border-color: var(--av-on-glass); }
.sf__op.is-on {
  background: var(--av-on-glass-strong);
  border-color: var(--av-on-glass-strong);
  color: var(--av-ink);
}
.sf__op--color { justify-content: flex-start; width: 100%; }
.sf__dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  flex: none;
  /* Filete propio: un dot negro sobre velo negro no se vería. */
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .28);
}

@media (prefers-reduced-motion: reduce) {
  .sf__chev, .sf__op { transition: none; }
}
</style>
