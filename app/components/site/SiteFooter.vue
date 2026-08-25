<script setup>
/**
 * <SiteFooter> — el pie.
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │  ▟▛ 20AV        20 AVENIDA      MÉTODOS DE PAGO     MARCAS       │
 *   │  «la mejor       Nosotros        Envíos              Adidas      │
 *   │   variedad…»     Términos        Tiendas             Air Jordan  │
 *   │                  Garantía        Ayuda               Nike        │
 *   │  f ig yt tt      Contacto        FAQ                 …           │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * SUSTITUYE AL BANCO DE PRUEBAS del scroll que cerraba la landing. Aquel bloque
 * —el héroe con el letrero— estaba puesto sólo para tener altura que scrollear
 * mientras se comprobaba que la barra fija aguantaba hasta el final; su propio
 * comentario decía que se borraba en cuanto hubiera contenido real. Esto es el
 * contenido real.
 *
 * DÓNDE VIVE: en el LAYOUT, no en la página. Va detrás de `</main>` y no dentro,
 * y no es una preferencia de orden: un `<footer>` sólo es el landmark
 * `contentinfo` cuando NO está metido en `<main>` ni en otra sección. Dentro de
 * la página el elemento seguiría siendo válido y el lector de pantalla dejaría
 * de poder saltar a él. Además es la simetría de `<AppNav>`, que también vive
 * arriba en el layout: la barra y el pie son el marco, no la landing.
 *
 * EL FONDO ES EL NEGRO DEL PANAL — `#050506`, la primera parada de la rampa
 * `negro` de marca— y no el del escenario, que en esta pieza sí hay motivo para
 * pisar: el panal es el componente que la toca por arriba, y los dos plafones
 * tienen que leerse como UN solo bloque negro que cierra la página. Con la rampa
 * del escenario debajo, el pie se aclararía justo donde el panal es más oscuro y
 * el empalme se vería como una costura horizontal.
 *
 * Y POR ESO TAMBIÉN LLEVA EL GRANO, con el mismo `GRAIN_DEFAULT` del panal.
 * Aquí no cumple la función de `backgrounds.js` —no hay vidrio que refracte
 * nada— pero sí la otra: dos planos del mismo color, uno con textura y otro
 * liso, se distinguen a simple vista. Mismo grano = misma superficie.
 *
 * EL COLOR DEL TEXTO VA ESCRITO, no heredado. El escenario cambia a
 * `var(--av-ink)` cuando el fondo activo es claro (`.is-light-bg`), y esa regla
 * llegaría hasta aquí: sobre un plafón que es negro SIEMPRE, dejaría el pie con
 * tinta negra sobre negro. Es el mismo motivo por el que los tokens `--av-on-*`
 * no se invierten con el fondo.
 */
import { GRAIN_URL, GRAIN_DEFAULT } from '~/assets/js/backgrounds'
import { MARCAS } from '~/assets/js/brands'

const props = defineProps({
  /** El plafón. El del panal, por lo de la costura — ver la cabecera. */
  bg: { type: String, default: '#050506' },
  /** El grano, 0–100. El mismo que el panal, o el empalme se nota. */
  grain: { type: Number, default: GRAIN_DEFAULT },
})

/**
 * Las columnas de enlaces.
 *
 * PENDIENTE — ninguna de estas rutas existe todavía. Se dejan escritas y
 * apuntando a dónde IRÁN en vez de a `#`: el día que existan las páginas, el pie
 * no se toca. Mientras tanto un clic acaba en el 404 de Nuxt, que es información
 * honesta —«esto aún no está»— y no un enlace muerto que finge funcionar.
 *
 * OJO CON LA SEGUNDA COLUMNA: el título es «Métodos de pago» y lo que cuelga son
 * envíos, tiendas, ayuda y FAQ. Viene así de la referencia y se reproduce tal
 * cual para no inventar contenido, pero el título no describe la lista — o los
 * enlaces son otros, o la columna se llama «Ayuda». Decisión de contenido, no
 * de componente.
 */
const COLUMNAS = [
  {
    id: 'casa',
    titulo: '20 Avenida',
    enlaces: [
      { texto: 'Nosotros', to: '/nosotros' },
      { texto: 'Términos y condiciones', to: '/terminos' },
      { texto: 'Garantía', to: '/garantia' },
      { texto: 'Contacto', to: '/contacto' },
    ],
  },
  {
    id: 'pago',
    titulo: 'Métodos de pago',
    enlaces: [
      { texto: 'Envíos', to: '/envios' },
      { texto: 'Tiendas', to: '/tiendas' },
      { texto: 'Ayuda', to: '/ayuda' },
      { texto: 'FAQ', to: '/faq' },
    ],
  },
  {
    /**
     * La tercera columna NO lleva lista escrita: sale de `brands.js`, que es
     * donde ya vive el mapa de marcas del proyecto. La referencia enseña otras
     * cuatro (Puma, Under Armour) que no están en el catálogo; escribirlas aquí
     * sería la segunda lista de marcas de la casa, y las dos empezarían a
     * separarse el primer día. Cuando entre una marca en `brands.js`, aparece
     * aquí sola.
     */
    id: 'marcas',
    titulo: 'Marcas',
    enlaces: MARCAS.map(m => ({ texto: m.name, to: `/marca/${m.id}` })),
  },
]

/**
 * Las redes.
 *
 * LOS CUATRO GLIFOS VAN DIBUJADOS AQUÍ y no importados de lucide, que es de
 * donde salen los demás iconos del proyecto: lucide 1.0 trae `facebook` e
 * `instagram` pero ya NO trae youtube ni tiktok. Importar dos y dibujar dos
 * dejaría una fila de cuatro iconos con dos trazos distintos, y en una fila
 * corta eso se ve. Van los cuatro en el mismo idioma que el resto de la casa
 * —caja de 24, trazo de 2, remates redondos— así que siguen siendo la familia
 * de lucide aunque no vengan del paquete. Facebook e Instagram conservan su
 * trazado original (lucide, ISC).
 *
 * PENDIENTE: los perfiles reales. Los `href` son los de la marca en Guatemala y
 * están sin verificar.
 */
const REDES = [
  {
    id: 'facebook',
    nombre: 'Facebook',
    href: 'https://www.facebook.com/20avenida',
    paths: ['M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'],
  },
  {
    id: 'instagram',
    nombre: 'Instagram',
    href: 'https://www.instagram.com/20avenida',
    paths: [
      'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
      'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
      'M17.5 6.5h.01',
    ],
  },
  {
    id: 'youtube',
    nombre: 'YouTube',
    href: 'https://www.youtube.com/@20avenida',
    paths: [
      'M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17',
      'm10 15 5-3-5-3z',
    ],
  },
  {
    /* La nota de TikTok, en trazo: cabeza abajo a la izquierda, mástil tangente
       a su lado derecho y el gancho saliendo de la punta. El arco es de 3.5 de
       radio con `large-arc`, o sea tres cuartos de círculo — el cuarto que falta
       es justo por donde entra el mástil. */
    id: 'tiktok',
    nombre: 'TikTok',
    href: 'https://www.tiktok.com/@20avenida',
    paths: [
      'M12.5 3v13a3.5 3.5 0 1 1-3.5-3.5',
      'M12.5 3c.8 2.4 2.8 4.1 5.5 4.2',
    ],
  },
]

const estilo = computed(() => ({
  '--ft-bg': props.bg,
  '--ft-grain': GRAIN_URL,
  '--ft-grain-a': props.grain / 100,
}))
</script>

<template>
  <footer class="ft" :style="estilo">
    <div class="ft__inner">
      <!-- LA CASA. Marca, qué es y dónde encontrarla: es la única columna que no
           es una lista de enlaces, y por eso va aparte del `<nav>` — meterla
           dentro haría que un lector anunciara «navegación» y leyera un párrafo
           de texto corrido. -->
      <div class="ft__casa">
        <BrandMark :size="96" class="ft__mark" />

        <p class="ft__lede">
          Tenemos la mejor variedad en calzado, ropa y accesorios deportivos
          en Guatemala.
        </p>

        <ul class="ft__redes">
          <li v-for="red in REDES" :key="red.id">
            <a
              class="ft__red"
              :href="red.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="red.nombre"
            >
              <!-- TODO EN TRAZO, ninguno relleno — ni siquiera Facebook, que en
                   la referencia es una silueta maciza. Los cuatro contornos son
                   cerrados, así que rellenarlos es un `fill` y ya está; pero
                   entonces esta fila sería lo único macizo de una casa donde
                   todos los iconos son de trazo (la barra, el acordeón, el
                   rollo). El peso visual manda sobre el parecido. -->
              <!-- El color lo pone `currentColor` desde el enlace: un solo sitio
                   que tocar, y el hover mueve los cuatro glifos a la vez. -->
              <svg
                class="ft__ico"
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path v-for="(d, i) in red.paths" :key="i" :d="d" />
              </svg>
            </a>
          </li>
        </ul>
      </div>

      <!-- Las tres columnas de enlaces, y las tres dentro de UN `<nav>`: son la
           misma navegación de pie repartida en tres montones, no tres
           navegaciones. El `aria-label` es lo que la separa de la barra de
           arriba cuando un lector lista los landmarks. -->
      <nav class="ft__cols" aria-label="Pie de página">
        <section v-for="col in COLUMNAS" :key="col.id" class="ft__col">
          <h2 class="ft__h">{{ col.titulo }}</h2>
          <ul class="ft__lista">
            <li v-for="e in col.enlaces" :key="e.to">
              <NuxtLink class="ft__link" :to="e.to">{{ e.texto }}</NuxtLink>
            </li>
          </ul>
        </section>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  position: relative;
  /* El respiro de arriba es mayor que el de abajo —2 a 1— porque por arriba el
     pie tiene que despegarse del panal, que termina en celdas, y por abajo sólo
     tiene que no quedar pegado al canto de la ventana. */
  padding: clamp(48px, 7vw, 92px) clamp(20px, 5vw, 76px) clamp(28px, 4vw, 52px);
  background-color: var(--ft-bg);
  /* Ver la cabecera: escrito, no heredado. Si esto se quita, con fondo claro
     activo el pie se queda con tinta negra sobre el plafón negro. */
  color: #fff;
  overflow: hidden;
}

/* El grano, igual que en el panal: en un `::before` porque necesita opacidad
   propia, y por debajo del contenido. */
.ft::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--ft-grain);
  opacity: var(--ft-grain-a);
  pointer-events: none;
}

.ft__inner {
  position: relative;   /* por encima del grano */
  z-index: 1;
  max-width: 1280px;
  margin-inline: auto;
  display: grid;
  /* La casa pesa más que una columna de enlaces y menos que dos: lleva el
     letrero, un párrafo y cuatro iconos. `1.15fr` es lo que hace que su párrafo
     caiga en dos líneas a la misma medida a la que las tres listas siguen
     cabiendo sin partir «Términos y condiciones». */
  grid-template-columns: minmax(0, 1.15fr) repeat(3, minmax(0, 1fr));
  gap: clamp(28px, 4vw, 56px);
  align-items: start;
}

/* ── la casa ──────────────────────────────────────────────────────────────── */
.ft__casa { display: flex; flex-direction: column; align-items: flex-start; }

/* El letrero es una FOTO recortada con su propio aire alrededor, así que se
   sangra a la izquierda para que su tinta —no su caja— arranque en la misma
   vertical que el párrafo de debajo. */
.ft__mark { margin-left: -6px; }

.ft__lede {
  margin: 20px 0 0;
  max-width: 21ch;
  font-size: 13px;
  line-height: 1.62;
  /* El mismo 72% que `--av-on-glass`: aquí no hay velo, pero el plafón es igual
     de oscuro y la jerarquía es la misma —texto de apoyo, no de lectura. */
  color: rgba(255, 255, 255, .72);
}

.ft__redes {
  display: flex;
  gap: 14px;
  margin: clamp(22px, 3vw, 34px) 0 0;
  padding: 0;
  list-style: none;
}

.ft__red {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 40 y no 21: el icono mide 21, pero el objetivo táctil no puede. Los 40
     incluyen el aire, así que la fila se ve con el hueco de la referencia y a
     la vez cada icono es agarrable con el pulgar. El margen negativo devuelve
     el relleno del primero para que la fila arranque a ras del párrafo. */
  width: 40px;
  height: 40px;
  color: #fff;
  transition: color .2s ease, transform .2s ease;
}
.ft__redes > :first-child .ft__red { margin-left: -10px; }

.ft__ico { display: block; }

@media (hover: hover) and (pointer: fine) {
  .ft__red:hover { color: var(--av-y-400); transform: translateY(-2px); }
}
.ft__red:focus-visible {
  outline: 2px solid var(--av-y-400);
  outline-offset: 2px;
  border-radius: 10px;
}

/* ── las columnas ─────────────────────────────────────────────────────────── */
/* EL `<nav>` NO TIENE CAJA: `display: contents` lo borra de la maquetación y sus
   tres secciones pasan a ser celdas de la rejilla de `.ft__inner`, al lado de la
   casa. Sin esto habría que anidar una segunda rejilla dentro del `nav` y
   cuadrar a mano dos huecos distintos para que las cuatro columnas siguieran
   alineadas; así hay UNA rejilla y una sola declaración de `gap`, y el cambio de
   4 → 3 → 2 columnas de las medias es una línea cada uno.
   El elemento pierde la caja pero NO la semántica: el fallo por el que
   `display: contents` sacaba landmarks del árbol de accesibilidad está corregido
   en los tres motores. */
.ft__cols { display: contents; }

.ft__h {
  margin: 0 0 clamp(14px, 1.6vw, 22px);
  font-size: clamp(15px, 1.3vw, 19px);
  font-weight: 800;
  letter-spacing: -.01em;
  /* SIN VERSALES, aunque sean títulos y aunque la referencia los grite: primera
     mayúscula y el resto minúsculas, como todo el texto de la casa. Lo que
     separa un título de un enlace aquí es el peso (800 contra 400), el cuerpo y
     el color (blanco contra 72%) — tres señales, de sobra. Las mayúsculas serían
     una cuarta, y encima la única que además cuesta legibilidad. La regla no
     tiene excepción en ninguna pieza — ni siquiera el texto gigante del fondo
     del showcase. */
  color: #fff;
}

.ft__lista {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ft__link {
  display: inline-block;
  font-size: 13px;
  line-height: 1.4;
  text-decoration: none;
  color: rgba(255, 255, 255, .72);
  transition: color .2s ease;
}
/* AMARILLO, el mismo `--av-y-400` que las redes. El enlace en reposo va al 72%
   —texto de apoyo— y al pasar por encima no sube a blanco sino al amarillo de
   marca: sobre este plafón, blanco sobre 72% de blanco es un salto de brillo que
   se lee como «se ha movido algo» y no como «esto es un enlace». El amarillo
   cambia de TONO, que es lo único que no puede confundirse con el resto de la
   columna, y es el mismo gesto que ya hacen el icono de red y el foco. */
@media (hover: hover) and (pointer: fine) {
  .ft__link:hover { color: var(--av-y-400); }
}
.ft__link:focus-visible {
  outline: 2px solid var(--av-y-400);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ══ tableta ════════════════════════════════════════════════════════════════
   La casa se queda con toda la fila y las tres listas se reparten la de abajo.
   A esta medida, cuatro columnas dejarían «Términos y condiciones» partido en
   tres líneas — el mismo motivo por el que el acordeón se tumba. */
@media (max-width: 900px) {
  .ft__inner { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ft__casa { grid-column: 1 / -1; }
  .ft__lede { max-width: 32ch; }
}

/* ══ teléfono ═══════════════════════════════════════════════════════════════
   Dos columnas y no una: tres listas de cuatro enlaces apiladas son una
   pantalla entera de pie, y el pie no es contenido. En dos montones cabe todo
   de una vez y la tercera columna se queda sola abajo a la izquierda, que es
   donde ya estaba mirando el ojo. */
@media (max-width: 560px) {
  .ft__inner {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(26px, 7vw, 36px);
  }
  .ft__lede { max-width: 28ch; }
}

@media (prefers-reduced-motion: reduce) {
  .ft__red { transition: color .2s ease; }
  .ft__red:hover { transform: none; }
}
</style>
