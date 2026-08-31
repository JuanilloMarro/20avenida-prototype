<script setup>
/**
 * `/tienda` — la estantería.
 *
 * Tres piezas: la columna de facetas a la izquierda, la barra de estado arriba y
 * la retícula de cards. Cada card es <ShopCard>, que es un producto puesto en un
 * estante iluminado — ahí está el grueso del diseño.
 *
 * EL FONDO ES NEGRO PLANO y no la rampa de marca del escenario. La página entera
 * es una habitación a oscuras para que lo único encendido sean los LED de los
 * estantes; sobre la rampa, los filos competirían con el degradado y la
 * estantería dejaría de leerse como tal. Es la misma decisión del panal y por el
 * mismo motivo.
 *
 * EL ESTADO DE LOS FILTROS VIVE AQUÍ, no en la columna. Quien filtra es quien
 * sabe cuántos quedan, y tener la cuenta en un sitio y el criterio en otro obliga
 * a mantener dos verdades sincronizadas.
 */
import { X, ChevronRight, House } from 'lucide-vue-next'
import { PRODUCTOS, MARCAS, COLORES, PRECIO_MAX } from '~/assets/js/shop'

/* ── el estado ─────────────────────────────────────────────────────────── */
const filtros = ref({
  precio: [0, PRECIO_MAX],
  genero: [],
  categoria: [],
  estilo: [],
  color: [],
  talla: [],
})

/* La marca va APARTE de las demás facetas, y no por capricho: se elige en una
   fila de pestañas encima de la retícula, es de selección única y siempre hay
   una activa —«Todas»—. Meterla en la columna la convertiría en una faceta más
   de selección múltiple, que es otra cosa. */
const marca = ref('Todas')

const orden = ref('defecto')
const ORDENES = [
  { id: 'defecto', label: 'Defecto' },
  { id: 'precio-asc', label: 'Precio: menor a mayor' },
  { id: 'precio-desc', label: 'Precio: mayor a menor' },
  { id: 'nombre', label: 'Nombre' },
]

/* Los favoritos son un `Set` y no un array: lo único que se pregunta es si un id
   está dentro, y eso en un array es un recorrido por card y por repintado. */
const favoritos = ref(new Set())
function alternaFav(id) {
  const s = new Set(favoritos.value)
  s.has(id) ? s.delete(id) : s.add(id)
  favoritos.value = s
}

/* ── el filtrado ───────────────────────────────────────────────────────── */

/* Una faceta VACÍA no filtra. Es la regla que hace que la página arranque
   enseñando el catálogo entero en vez de nada, y evita tener que escribir un
   caso especial por faceta. */
const pasa = (xs, v) => xs.length === 0 || xs.includes(v)

const visibles = computed(() => {
  const f = filtros.value
  const out = PRODUCTOS.filter(p =>
    (marca.value === 'Todas' || p.brand === marca.value) &&
    p.precio >= f.precio[0] && p.precio <= f.precio[1] &&
    pasa(f.genero, p.genero) &&
    pasa(f.categoria, p.categoria) &&
    pasa(f.estilo, p.estilo) &&
    pasa(f.color, p.color) &&
    /* La talla es la única que no compara un valor sino una LISTA contra otra:
       un producto pasa si tiene ALGUNA de las tallas pedidas. */
    (f.talla.length === 0 || f.talla.some(t => p.sizes.includes(t)))
  )

  if (orden.value === 'precio-asc') return out.toSorted((a, b) => a.precio - b.precio)
  if (orden.value === 'precio-desc') return out.toSorted((a, b) => b.precio - a.precio)
  if (orden.value === 'nombre') return out.toSorted((a, b) => a.name.localeCompare(b.name))
  return out
})

/* ── las fichas de filtro activo ───────────────────────────────────────── */

/* Se aplanan las facetas a una sola lista para pintarlas juntas encima de la
   retícula. Cada ficha recuerda de qué faceta salió, que es lo que permite
   quitarla sin preguntar. */
const activos = computed(() => {
  const f = filtros.value
  const xs = []
  for (const k of ['genero', 'categoria', 'estilo', 'talla']) {
    for (const v of f[k]) xs.push({ faceta: k, valor: v, label: String(v) })
  }
  for (const v of f.color) {
    xs.push({ faceta: 'color', valor: v, label: COLORES.find(c => c.id === v)?.name ?? v })
  }
  if (marca.value !== 'Todas') xs.push({ faceta: 'marca', valor: marca.value, label: marca.value })
  if (f.precio[0] > 0 || f.precio[1] < PRECIO_MAX) {
    xs.push({ faceta: 'precio', valor: null, label: `Q${f.precio[0]} – Q${f.precio[1]}` })
  }
  return xs
})

function quita({ faceta, valor }) {
  if (faceta === 'marca') { marca.value = 'Todas'; return }
  if (faceta === 'precio') {
    filtros.value = { ...filtros.value, precio: [0, PRECIO_MAX] }
    return
  }
  filtros.value = { ...filtros.value, [faceta]: filtros.value[faceta].filter(v => v !== valor) }
}

/* Las dos acciones que la card ofrece y que todavia no tienen a donde ir. Igual
   que en el resto del prototipo: el componente emite y la pagina decide, y el dia
   que existan la bolsa y `/producto/:id` esto es un `cart.add()` y un
   `navigateTo`. Sin estos dos, la card emitiria a nadie. */
function onBolsa(id) { if (import.meta.dev) console.info('[tienda] a la bolsa:', id) }
function onAbrir(id) { if (import.meta.dev) console.info('[tienda] abrir ficha:', id) }

useHead({ title: 'Tienda · 20 Avenida' })
</script>

<template>
  <section class="sh">
    <!-- ── la miga ───────────────────────────────────────────────────────
         Va fuera de la retícula y pegada al hueco de la barra: es dónde estás,
         no contenido de la tienda. -->
    <nav class="sh__miga" aria-label="Ruta">
      <NuxtLink to="/"><House :stroke-width="1.8" /> Inicio</NuxtLink>
      <ChevronRight :stroke-width="2" aria-hidden="true" />
      <span aria-current="page">Productos</span>
    </nav>

    <div class="sh__cuerpo">
      <ShopFilters v-model="filtros" class="sh__filtros" />

      <div class="sh__main">
        <!-- ── la barra de estado ────────────────────────────────────────
             Cuántos hay, qué está puesto y cómo se ordena. En una fila para que
             el recuento y las fichas se lean juntos: son la misma información
             —por qué ves esto y no todo— partida en dos. -->
        <div class="sh__estado">
          <p class="sh__cuenta">
            <strong>{{ visibles.length }}</strong> productos
          </p>

          <div v-if="activos.length" class="sh__activos">
            <span class="sh__activos-t">Filtros activos:</span>
            <button
              v-for="a in activos"
              :key="a.faceta + a.valor"
              type="button"
              class="sh__ficha"
              @click="quita(a)"
            >
              {{ a.label }}
              <X :stroke-width="2.2" />
            </button>
          </div>

          <label class="sh__orden">
            <span>Ordenar por:</span>
            <GlassSurface :radius="999" tag="span" class="sh__select">
              <select v-model="orden">
                <option v-for="o in ORDENES" :key="o.id" :value="o.id">{{ o.label }}</option>
              </select>
            </GlassSurface>
          </label>
        </div>

        <!-- ── las pestañas de marca ─────────────────────────────────────
             Selección única y siempre hay una activa, así que son pestañas y no
             píldoras de faceta — ver la nota de `marca` en el script. -->
        <div class="sh__marcas" role="tablist" aria-label="Marca">
          <button
            v-for="m in ['Todas', ...MARCAS]"
            :key="m"
            type="button"
            role="tab"
            class="sh__marca"
            :class="{ 'is-on': marca === m }"
            :aria-selected="marca === m"
            @click="marca = m"
          >{{ m }}</button>
        </div>

        <!-- ── la estantería ─────────────────────────────────────────────── -->
        <div v-if="visibles.length" class="sh__grid">
          <ShopCard
            v-for="p in visibles"
            :key="p.id"
            :p="p"
            :fav="favoritos.has(p.id)"
            @fav="alternaFav"
            @cart="onBolsa"
            @open="onAbrir"
          />
        </div>

        <!-- Un estante vacío tiene que DECIRLO. Sin esto, una combinación de
             filtros sin resultados se lee como que la página se rompió. -->
        <p v-else class="sh__vacio">
          Ningún producto con esos filtros. Prueba a quitar alguno.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sh {
  /* NEGRO PLANO — ver la cabecera. Se pinta sobre el escenario, que trae su
     rampa: esta página la tapa entera a propósito. */
  background: #050506;
  min-height: 100svh;
  padding:
    var(--av-nav-space, 87px)
    var(--av-gutter)
    clamp(48px, 8vh, 96px);
}

.sh__miga {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass);
}
.sh__miga a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: inherit;
  text-decoration: none;
}
.sh__miga a:hover { color: var(--av-on-glass-strong); }
.sh__miga svg { width: 14px; height: 14px; }
.sh__miga [aria-current] { color: var(--av-on-glass-strong); }

/* Columna fija a la izquierda y el resto para la retícula. `minmax(0, 1fr)` y no
   `1fr`: sin el mínimo a cero, una card con un nombre largo empuja la columna y
   la retícula desborda. */
.sh__cuerpo {
  display: grid;
  grid-template-columns: clamp(220px, 20vw, 280px) minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 34px);
  align-items: start;
}

.sh__main { min-width: 0; }

/* ── la barra de estado ────────────────────────────────────────────────── */
.sh__estado {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-bottom: 18px;
}
.sh__cuenta {
  margin: 0;
  font-size: 13px;
  color: var(--av-on-glass);
}
.sh__cuenta strong { color: var(--av-on-glass-strong); font-weight: 700; }

.sh__activos { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.sh__activos-t { font-size: 13px; color: var(--av-on-glass); }

/* La ficha ENTERA es el botón de quitar, no sólo la aspa. Un aspa de once
   píxeles es un blanco imposible, y la única acción que una ficha de filtro
   ofrece es irse. */
.sh__ficha {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px 6px 12px;
  border: 1px solid var(--av-on-glass-hair);
  border-radius: 999px;
  background: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.sh__ficha:hover { border-color: var(--av-on-glass); }
.sh__ficha svg { width: 13px; height: 13px; opacity: .7; }

.sh__orden {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  font-size: 13px;
  color: var(--av-on-glass);
}
.sh__select { height: var(--av-action-h); }
.sh__select :deep(.av-glass__body) { height: 100%; }
.sh__select select {
  height: 100%;
  padding: 0 var(--av-action-px);
  border: 0;
  background: none;
  font-family: inherit;
  font-size: var(--av-action-fs);
  font-weight: 600;
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
/* El desplegable nativo se pinta con los colores del SISTEMA, no de la página:
   sin esto las opciones salen en blanco sobre blanco en un tema oscuro. */
.sh__select option { background: #14141A; color: #FFF; }

/* ── las pestañas de marca ─────────────────────────────────────────────── */
.sh__marcas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 20px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--av-on-glass-hair);
}
.sh__marca {
  padding: 9px 18px;
  border: 1px solid var(--av-on-glass-hair);
  border-radius: 999px;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass);
  cursor: pointer;
  transition: color .2s ease, border-color .2s ease, background-color .2s ease;
}
.sh__marca:hover { color: var(--av-on-glass-strong); border-color: var(--av-on-glass); }
.sh__marca.is-on {
  background: var(--av-on-glass-strong);
  border-color: var(--av-on-glass-strong);
  color: var(--av-ink);
}

/* ── la retícula ───────────────────────────────────────────────────────── */
/* `auto-fill` con un mínimo, no un número de columnas: la retícula se adapta al
   ancho que quede después de la columna de filtros, y ese ancho cambia con el
   `clamp` de la columna. Con un número fijo habría que reajustarlo en cada
   medida. */
.sh__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
  gap: clamp(14px, 1.6vw, 22px);
}
.sh__grid > * { min-height: 380px; }

.sh__vacio {
  margin: 0;
  padding: 60px 0;
  text-align: center;
  font-size: 14px;
  color: var(--av-on-glass);
}

/* ── teléfono ──────────────────────────────────────────────────────────
   La columna de filtros pasa ARRIBA y deja de ser `sticky`. A 390 px una
   columna lateral de 220 deja 150 para la retícula, que no da ni para una card.
   Encima y en flujo, los filtros son el primer bloque de la página — que es lo
   que son cuando no caben al lado. */
@media (max-width: 860px) {
  .sh__cuerpo { grid-template-columns: minmax(0, 1fr); }
  .sh__filtros { position: static; }
  .sh__orden { margin-left: 0; }
  .sh__grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .sh__grid > * { min-height: 300px; }
}
</style>
