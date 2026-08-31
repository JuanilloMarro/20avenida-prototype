<script setup>
/**
 * <ShopCard> — una casilla de la estantería.
 *
 * La idea de la pieza no es «una tarjeta de producto»: es **un producto puesto
 * en un estante iluminado**. De ahí sale todo lo demás.
 *
 *   ═══════════════  ← el LED: una línea encendida en el canto superior
 *   ░░░░░░░░░░░░░░   ← su luz cayendo, que se apaga hacia abajo
 *        👟          ← el producto, en la parte iluminada
 *   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ← la repisa: precio y compra, en la sombra
 *
 * LA LUZ VIENE DE ARRIBA Y SE ACABA. Un degradado que llegara al pie dejaría la
 * card como un rectángulo aclarado; lo que hace que se lea como un estante es
 * que la mitad de abajo esté a oscuras y el zapato NO. Por eso son dos piezas
 * distintas —el filo encendido y el cono de luz— y no una sola.
 *
 * VIDRIO `sheet`, y aquí no es opcional: una retícula de tienda pinta veintiséis
 * cards a la vez contra un presupuesto medido de ≈9 con lente. `sheet` conserva
 * el material y quita lo único que escala mal. Es la regla R3 del paquete.
 */
import { Heart, ShoppingCart } from 'lucide-vue-next'
import { quetzales } from '~/assets/js/shop'

const props = defineProps({
  /** un producto de `PRODUCTOS` (ver `shop.js`) */
  p: { type: Object, required: true },
  /** ¿está en la lista de deseos? Lo manda quien la tenga; la card no la guarda. */
  fav: { type: Boolean, default: false },
})

const emit = defineEmits(['fav', 'cart', 'open'])

/* El texto fantasma del fondo. Se recorta a dos palabras: el nombre entero a ese
   cuerpo sale en tres líneas y deja de ser una mancha para pasar a ser un
   párrafo. Es decoración —lleva `aria-hidden`— así que perder palabras no cuesta
   información: el nombre completo está en el `<h3>` de abajo. */
const fantasma = computed(() => props.p.name.split(' ').slice(0, 3).join(' '))
</script>

<template>
  <GlassSurface tag="article" variant="sheet" class="sc">
    <!-- ── LA LUZ ────────────────────────────────────────────────────────
         Dos piezas y no una: el FILO encendido —dos píxeles de luz pura en el
         canto— y el CONO que cae de él. Juntas en un solo degradado, o el filo
         sale lavado o el cono sale duro; separadas, cada una tiene su curva.

         Van debajo del contenido en orden de pintado y sin eventos: son luz, no
         interfaz. -->
    <span class="sc__led" aria-hidden="true" />
    <span class="sc__glow" aria-hidden="true" />

    <!-- La rebaja, arriba a la izquierda: es lo primero que se busca en una
         retícula con descuentos, y en la esquina contraria al corazón para que
         las dos acciones no compitan por la misma mirada. -->
    <span v-if="p.rebaja" class="sc__off">−{{ p.rebaja }}%</span>

    <!-- `sheet` tambien en los dos botones, y no solo en la card. Son DOS
         instancias por card: en una reticula de veintiseis eso son cincuenta y
         dos lentes, que es seis veces el presupuesto del material. Medido: con
         el material base la pagina montaba 63 filtros SVG; con `sheet`, 11. -->
    <GlassSurface :radius="999" variant="sheet" tag="div" class="sc__fav" :class="{ 'is-on': fav }">
      <button
        type="button"
        :aria-pressed="fav"
        :aria-label="`Guardar ${p.name} en favoritos`"
        @click="emit('fav', p.id)"
      >
        <Heart :stroke-width="1.8" />
      </button>
    </GlassSurface>

    <!-- ── EL PRODUCTO ───────────────────────────────────────────────────
         El nombre en grande DETRÁS y la foto delante. Es el mismo recurso del
         escaparate y del acordeón: la palabra hace de fondo y el producto de
         primer plano, así que la card tiene profundidad sin necesitar una foto
         de ambiente. -->
    <button type="button" class="sc__shot" @click="emit('open', p.id)">
      <span class="sc__word" aria-hidden="true">{{ fantasma }}</span>
      <img
        :src="p.src"
        :alt="p.name"
        width="182"
        height="134"
        loading="lazy"
        decoding="async"
      >
    </button>

    <div class="sc__meta">
      <p class="sc__sku">{{ p.brand }} · {{ p.sku }}</p>
      <h3 class="sc__name">{{ p.name }}</h3>
    </div>

    <!-- ── LA REPISA ─────────────────────────────────────────────────────
         El precio y la compra, en la parte que la luz no alcanza. Va a sangre
         hasta los tres bordes de abajo: es el canto del estante, no una fila
         dentro de la card. -->
    <div class="sc__bar">
      <span v-if="p.precioAntes" class="sc__was">{{ quetzales(p.precioAntes) }}</span>
      <span class="sc__now">{{ quetzales(p.precio) }}</span>

      <GlassSurface :radius="999" variant="sheet" tag="div" class="sc__cart">
        <button
          type="button"
          :aria-label="`Añadir ${p.name} a la bolsa`"
          @click="emit('cart', p.id)"
        >
          <ShoppingCart :stroke-width="1.8" />
        </button>
      </GlassSurface>
    </div>
  </GlassSurface>
</template>

<style scoped>
.sc {
  /* El alto de la repisa. Un solo número: la barra, el hueco que el cono de luz
     tiene que dejar libre y el relleno del pie salen todos de aquí. */
  --sc-shelf: 58px;
  /* Hasta dónde llega la luz. Poco más de la mitad: si pasa de ahí, la card deja
     de tener sombra y el estante se convierte en un rectángulo aclarado. */
  --sc-light: 62%;

  position: relative;
  overflow: hidden;
  /* La card ENTERA es la superficie de vidrio; nada de un borde pintado encima.
     El radio es el del sistema. */
  border-radius: var(--lg-r-base);
}

/* EL REPARTO VA EN EL CUERPO DEL VIDRIO, no en la superficie. Es la trampa de
   este material y ya ha mordido en tres componentes: `.av-glass` tiene cuatro
   hijos —`__back`, `__veil`, `__spec` y `__body`— y una rejilla puesta arriba
   reparte ESAS CUATRO CAPAS, no el contenido. El contenido vive dentro de
   `__body`, que además hay que estirar: es la única capa en flujo y sin altura
   se encoge a lo que mida su contenido.

   Medido antes de esto: la repisa se quedaba a 197 px en una card de 380 en vez
   de pegada al pie. */
.sc :deep(.av-glass__body) {
  display: grid;
  grid-template-rows: 1fr auto var(--sc-shelf);
  height: 100%;
  min-height: 0;
}

/* ── EL FILO ENCENDIDO ─────────────────────────────────────────────────
   Dos píxeles pegados al canto superior, y con brillo propio: el `box-shadow`
   sin desplazamiento es lo que lo convierte en una fuente de luz en vez de en
   una raya blanca. Se apaga hacia los extremos con la máscara — un tubo de LED
   no llega encendido hasta el tornillo. */
.sc__led {
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  z-index: 1;
  background: var(--sc-led, #FFFFFF);
  box-shadow:
    0 0 8px 1px rgba(255, 255, 255, .95),
    0 2px 18px 3px rgba(255, 255, 255, .55),
    0 6px 40px 8px rgba(255, 255, 255, .28);
  -webkit-mask: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
          mask: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  pointer-events: none;
}

/* ── EL CONO DE LUZ ────────────────────────────────────────────────────
   Cae del filo y se apaga antes de llegar a la repisa. Un `radial-gradient` con
   el centro FUERA de la caja —arriba, en el canto— porque una luz que nace
   dentro se lee como una mancha; naciendo en el borde se lee como algo que
   entra desde arriba.

   Termina en `--sc-light` y no en el pie: la sombra de abajo es la mitad del
   efecto. */
.sc__glow {
  position: absolute;
  inset: 0 0 auto 0;
  height: var(--sc-light);
  z-index: 0;
  background:
    radial-gradient(130% 100% at 50% 0%,
      rgba(255, 255, 255, .42) 0%,
      rgba(255, 255, 255, .20) 30%,
      rgba(255, 255, 255, .08) 58%,
      transparent 100%);
  pointer-events: none;
}

/* ── LOS DOS CONTROLES DE LA ESQUINA ───────────────────────────────────── */
.sc__fav {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  width: 38px;
  height: 38px;
}
.sc__fav :deep(.av-glass__body) { width: 100%; height: 100%; }
.sc__fav button {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  padding: 0;
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.sc__fav :deep(svg) { width: 17px; height: 17px; }
/* Guardado: el corazón se rellena y toma el amarillo de marca. Es el único sitio
   de la card donde entra ese color, que es lo que hace que se vea. */
.sc__fav.is-on button { color: var(--av-y-400); }
.sc__fav.is-on :deep(svg) { fill: currentColor; }

/* La píldora del descuento. Amarillo de marca sobre tinta, no vidrio: es un dato
   que tiene que leerse de un vistazo en una retícula, y el vidrio depende de lo
   que tenga detrás. Misma excepción que la burbuja del contador de la barra. */
.sc__off {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--av-y-400);
  color: var(--av-ink);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: var(--av-track);
  font-variant-numeric: tabular-nums;
}

/* ── EL PRODUCTO ───────────────────────────────────────────────────────── */
.sc__shot {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 34px 18px 4px;
  border: 0;
  background: none;
  cursor: pointer;
}
.sc__shot img {
  position: relative;
  z-index: 1;
  display: block;
  width: 82%;
  height: auto;
  /* La sombra del producto SOBRE el estante. Corta y muy abajo: es contacto, no
     elevación — un zapato apoyado en una repisa no flota. */
  filter: drop-shadow(0 14px 12px rgba(0, 0, 0, .55));
  transition: transform .38s cubic-bezier(.22, 1, .36, 1);
}

/* EL NOMBRE DETRÁS. Recortado por la card, así que asoma por los dos lados: eso
   es lo que hace que se lea como algo que está DETRÁS y no como un rótulo
   centrado. En un gris muy bajo — es fondo. */
.sc__word {
  position: absolute;
  inset: auto 0 38%;
  margin: 0;
  font-size: clamp(24px, 3.4vw, 40px);
  font-weight: 800;
  letter-spacing: var(--av-track-display);
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: center;
  color: rgba(255, 255, 255, .07);
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  .sc:hover .sc__shot img { transform: translateY(-6px) scale(1.04); }
}

/* ── NOMBRE Y REFERENCIA ───────────────────────────────────────────────── */
.sc__meta {
  position: relative;
  z-index: 2;
  padding: 0 16px 12px;
  min-width: 0;
}
.sc__sku {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .06em;
  color: var(--av-on-glass);
}
.sc__name {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
  /* Dos líneas y corta. En una retícula, una card con un nombre de tres líneas
     empuja su precio y rompe la alineación de toda la fila. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── LA REPISA ─────────────────────────────────────────────────────────── */
.sc__bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 0 16px;
  /* Negro casi puro y no un velo: es la sombra bajo el estante, y un velo dejaría
     pasar el cono de luz justo donde tiene que acabarse. */
  background: rgba(0, 0, 0, .82);
  border-top: 1px solid var(--av-on-glass-hair);
}
.sc__was {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--av-on-glass);
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
}
.sc__now {
  margin-right: auto;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: var(--av-track);
  color: var(--av-on-glass-strong);
  font-variant-numeric: tabular-nums;
}
.sc__cart {
  width: 38px;
  height: 38px;
  flex: none;
}
.sc__cart :deep(.av-glass__body) { width: 100%; height: 100%; }
.sc__cart button {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  padding: 0;
  color: var(--av-on-glass-strong);
  cursor: pointer;
}
.sc__cart :deep(svg) { width: 17px; height: 17px; }

@media (prefers-reduced-motion: reduce) {
  .sc__shot img { transition: none; }
}
</style>
