<script setup>
/**
 * <HomeHero> — el cartel de portada: la campaña a la izquierda, la figura a la
 * derecha y la tira de categorías al pie.
 *
 * MIDE UNA PANTALLA EXACTA Y NO SE DESPLAZA POR DENTRO. Es la condición de la
 * pieza —«que se vea entera»— y de ella sale toda la geometría: `100svh` de
 * alto, `overflow: hidden`, y ni una medida fija que pueda no caber. Las tres
 * bandas se reparten así:
 *
 *   ┌────────────────────────────────┐  ← hueco de la barra (--av-nav-space)
 *   │  TÍTULO                        │
 *   │              ✓        figura   │  ← el cartel: `flex: 1`, lo que sobre
 *   │  botón                  ·      │     (la figura baja un tercio de sí
 *   ├────────────────────────────────┤
 *   │  Busca por categoría ─────────  │  ← la cabecera: su alto de texto
 *   │  ▢  ▢  ▢  ▢  ▢                 │  ← la tira: el 40% de la pieza
 *   └────────────────────────────────┘      misma detrás de la tira)
 *
 * Tres anclajes y ninguno a ojo: el titular al margen izquierdo, el símbolo al
 * centro exacto del cartel y la figura al margen derecho, nunca más ancha que
 * las dos últimas columnas de la tira.
 *
 * EL CARTEL ES EL QUE CEDE. Es el único con `flex: 1`, así que en una ventana
 * baja lo que se estrecha es el aire de arriba y no la tira de abajo — que es
 * la que lleva el contenido que se puede tocar. Y para que ceder no signifique
 * desbordar, los cuerpos del cartel van topados por ALTO además de por ancho:
 * `min(<cqw>, <svh>)`. En una pantalla ancha manda el ancho, como siempre; en
 * una baja manda el alto y el título encoge en vez de comerse la tira.
 *
 * QUIÉN LO CENTRA EN LA PANTALLA no es esta pieza: es la clase `av-snap` que le
 * pone la página al montarla. Está explicado en `main.css` — el imán es una
 * relación entre secciones, no una propiedad de ninguna.
 *
 * Los datos son `categorias.js` tal cual. Añadir una categoría es añadir una
 * entrada ahí; la rejilla se reparte sola.
 */
import { ArrowRight } from 'lucide-vue-next'
import { CATEGORIAS } from '~/assets/js/categorias'

const props = defineProps({
  /** la tira de abajo. 4–6; por encima las cards dejan de reconocerse. */
  items: { type: Array, default: () => CATEGORIAS },
  /**
   * El nombre de la marca. NO SE DIBUJA: el símbolo va solo y esto es lo que se
   * anuncia en su `alt`, que es donde el nombre sigue haciendo falta — un
   * logotipo sin texto alternativo es una imagen muda para quien no la ve.
   */
  marca: { type: String, default: 'Nike' },
  /**
   * EL TITULAR, UNA LÍNEA POR ENTRADA, y por eso es un array y no una cadena
   * con `<br>`: el corte de línea de un titular a 140 px de cuerpo es una
   * decisión de diseño —dónde respira la frase— y dejársela al ancho
   * disponible significa que cambia sola con la ventana. Escrito así, el
   * titular se rompe donde se decidió y en ningún otro sitio.
   *
   * Y de paso hace que `width: max-content` valga: la caja del texto mide lo
   * que la línea más larga, que es contra lo que se centra el símbolo.
   */
  titulo: { type: Array, default: () => ['Define tu', 'estilo'] },
})

/* DOS SALIDAS Y NO TRES. Hubo una para el botón del cartel y otra para el «Ver
   todo» de la cabecera, y las dos llevaban al mismo sitio; ahora hay un solo
   botón —«Ver categorías»— y emite `todo`, que es lo que hace. */
const emit = defineEmits(['pick', 'todo'])
</script>

<template>
  <section class="hh">
    <!-- ── EL CARTEL ─────────────────────────────────────────────────────
         `position: relative` porque la figura se ancla a ESTA banda y no a la
         sección: así su alto es exactamente el hueco que queda entre la barra y
         la tira de categorías, sin que ningún número tenga que cuadrar con
         otro. Si mañana la tira crece, la figura se ajusta sola. -->
    <div class="hh__cartel">
      <!-- EL FOCO. Va DEBAJO de la marca y centrado en ella: es la luz de
           estudio que el fondo negro no tiene, y su trabajo es que el símbolo no
           flote sobre un plano muerto. Estuvo puesto sobre la figura y ahí hacía
           otra cosa —le dibujaba un halo al recorte— así que se movió al centro,
           que es donde está lo que tiene que iluminar. -->
      <span class="hh__aura" aria-hidden="true" />

      <!-- ── LA MARCA ─────────────────────────────────────────────────────
           SÓLO EL SÍMBOLO. Hubo debajo la palabra escrita a trazo abierto y se
           ha ido entera: el símbolo es el logotipo, y un logotipo con su propio
           nombre repetido al lado es el nombre dicho dos veces.

           El nombre no se pierde, cambia de sitio: va en el `alt`. Para un
           lector de pantalla la marca se sigue anunciando; lo que no hay es
           texto dibujado.

           Y VA EN MEDIO DE TODO — centrado en el cartel por los dos ejes, no
           encima del titular. Por eso cuelga del cartel y no de la caja de
           texto: centrado ahí dentro se habría centrado sobre el titular.

           SE PROBÓ AL REVÉS —símbolo a la derecha y figura en medio— y se
           volvió: el símbolo pegado al margen deja de ser el centro de nada y la
           figura en el eje se come el sitio del titular. Queda escrito para no
           volver a probarlo. -->
      <img
        class="hh__marca"
        src="/home/swoosh.webp"
        :alt="marca"
        width="420"
        height="151"
        decoding="async"
      >

      <!-- ── LA FIGURA ────────────────────────────────────────────────────
           DECORATIVA: `alt` vacío a propósito, porque no aporta
           ningún dato que no esté escrito al lado y anunciarla sólo alarga la
           lectura. Va con `fetchpriority="high"` y sin `lazy` — es lo primero
           que se ve al entrar en la página; las cinco fotos de la tira sí
           esperan. -->
      <span class="hh__figura-caja">
        <img
          class="hh__figura"
          src="/home/figura.webp"
          alt=""
          width="495"
          height="812"
          fetchpriority="high"
          decoding="async"
        >
      </span>

      <div class="hh__texto">
        <!-- `<h1>` porque es el título de la página, no del componente: esta
             pieza abre la portada. Si algún día no la abre, esto baja a `<h2>`. -->
        <h1 class="hh__titulo">
          <span v-for="(l, i) in titulo" :key="i" class="hh__linea">{{ l }}</span>
        </h1>

        <!-- LA MISMA PÍLDORA QUE «Ver detalles» DEL ACORDEÓN, y sólo cambia lo
             que dice. Vidrio estándar de velo negro, radio de píldora, texto de
             11.5 y la flecha a 14: los números están copiados de `.pa__cta-in`
             a propósito, porque una acción que lleva a mirar tiene que verse
             igual en las dos piezas que la ofrecen. -->
        <GlassSurface :radius="999" class="hh__cta">
          <button type="button" class="hh__cta-in" @click="emit('todo')">
            Ver categorías
            <ArrowRight :stroke-width="1.8" />
          </button>
        </GlassSurface>
      </div>
    </div>

    <!-- ── LA TIRA DE CATEGORÍAS ─────────────────────────────────────── -->
    <div class="hh__cats">
      <!-- SE FUE «Ver todo». La salida a todas las categorías es ahora el botón
           del cartel —«Ver categorías», debajo del titular— y tenerla dos veces
           en la misma pantalla es ofrecer la misma puerta dos veces, con la
           segunda escrita más pequeña y en una esquina.

           La regla amarilla se queda y ahora llega al margen derecho. Es
           DECORACIÓN, y por eso es un elemento vacío con `aria-hidden` y no un
           `<hr>`: un separador semántico anunciaría un cambio de tema donde sólo
           hay una línea de cabecera. -->
      <div class="hh__cab">
        <h2 class="hh__cabt">Busca por categoría</h2>
        <span class="hh__regla" aria-hidden="true" />
      </div>

      <ul class="hh__tira">
        <li v-for="(c, i) in items" :key="c.id" class="hh__card">
          <button type="button" class="hh__cbtn" @click="emit('pick', c.id)">
            <img
              class="hh__cfoto"
              :src="c.foto"
              :alt="c.alt"
              width="640"
              height="800"
              :loading="i < 3 ? 'eager' : 'lazy'"
              decoding="async"
            >
            <!-- EL VELO DE ABAJO. No es un adorno: el rótulo va blanco sobre una
                 foto que no controlamos —mañana es otra campaña— y sin él el
                 contraste depende de lo que salga en el tercio inferior de cada
                 una. Con el velo, el suelo de la card es siempre oscuro. -->
            <span class="hh__cvelo" aria-hidden="true" />

            <!-- EL PIE DE LA CARD, EN UNA CAJA. El rótulo y la píldora estuvieron
                 sueltos, cada uno con su `bottom` en absoluto, y eso obliga a
                 escribir el alto de la píldora en la cuenta del rótulo: cambiar
                 el relleno del botón descolocaba el nombre. Apilados en una caja
                 que se ancla abajo, el único número que queda es el hueco entre
                 los dos. -->
            <span class="hh__cpie">
              <span class="hh__cnom">{{ c.name }}</span>

            <!-- MISMA PÍLDORA QUE EL ACORDEÓN otra vez, con `sheet` encima: es
                 la regla del material —a partir de la tercera instancia repetida
                 en pantalla se quita la lente— y aquí son cinco, sobre foto, que
                 es lo más caro que hay para un `backdrop-filter`. Lo que se
                 conserva del acordeón son las medidas y el texto; lo que cambia
                 es la variante, y cambia por rendimiento, no por diseño. -->
            <GlassSurface variant="sheet" :radius="999" tag="span" class="hh__ccta">
              <span class="hh__ccta-in">
                Comprar ahora
                <ArrowRight :stroke-width="1.8" />
              </span>
            </GlassSurface>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hh {
  position: relative;
  /* EL MISMO ALTO QUE EL RESTO DE PIEZAS DE PANTALLA COMPLETA: `100svh`, no
     `dvh` ni `vh`. El razonamiento largo está en `ProductAccordion.vue` y es el
     mismo — `svh` es el único de los tres que no cambia al scrollear ni deja
     nada cortado debajo de la barra del navegador. */
  height: 100svh;
  overflow: hidden;
  background: var(--av-ink);
  color: var(--av-on-glass-strong);

  /* Contenedor de consulta para que los `cqw` de dentro midan contra la pieza y
     no contra la ventana. Hoy da lo mismo —va a sangre— pero el día que se
     monte dentro de algo con márgenes, las medidas siguen valiendo. */
  container-type: inline-size;

  display: flex;
  flex-direction: column;
  /* Arriba, el hueco que la barra fija ocupa sin estar en el flujo. Abajo, aire
     suficiente para que la tira no se pegue al filo. */
  padding: var(--av-nav-space, 87px) var(--av-gutter) clamp(18px, 4svh, 44px);

  /* EL REPARTO DE LA TIRA, EN DOS NÚMEROS. Los usan la rejilla y la cuenta del
     alto de la card, así que tienen que salir del mismo sitio o las dos dejan de
     cuadrar en cuanto una media query toque el reparto. */
  --hh-cols: 5;
  --hh-gap: clamp(6px, .9cqw, 14px);
  /* EL ANCHO DE UNA CARD, calculado porque `1fr` no se puede leer desde CSS.
     Lo usan el alto de la card y el sitio de la figura, así que sale de aquí y
     no repetido en los dos.

     `100cqw` NO lleva los márgenes restados: las unidades de consulta miden la
     caja de CONTENIDO del contenedor, o sea que el relleno lateral de la sección
     ya está fuera. Restarlo otra vez daba una card 10 px más baja de la cuenta. */
  --hh-card-w: calc((100cqw - (var(--hh-cols) - 1) * var(--hh-gap)) / var(--hh-cols));

  /* EL ANCHO DEL SÍMBOLO. Topado por alto además de por ancho, como todo lo que
     vive en el cartel: es ancho y bajo —2.78 a 1— y atarlo sólo al alto lo
     dejaba en la mitad de lo que pide una marca de campaña. */
  --hh-marca-w: min(13cqw, 16svh);

  /* EL VERDE DE LA REGLA, sacado de las fotos y no elegido a ojo: muestreados
     los píxeles verdes de las cinco categorías, el matiz mediano de las 42 500
     que hay es 71° — el oliva del conjunto de «playeras», que es el verde que
     de verdad tiene la campaña. Tal cual sale de la foto es #454B24 y sobre
     negro una línea de 1 px de ese tono no se ve, así que lo que va aquí es ese
     mismo matiz subido de saturación y de valor hasta que la raya se lee. El
     matiz —lo que hace que sea «el verde de las fotos»— no se toca. */
  --hh-regla: #A8BE4E;
}

/* ══ EL CARTEL ════════════════════════════════════════════════════════ */
.hh__cartel {
  position: relative;
  /* EL ÚNICO QUE CEDE. Todo lo que sobre después de la tira es suyo, y si no
     sobra nada se queda en cero sin empujar a nadie: `min-height: 0` es lo que
     permite que un hijo de flex encoja por debajo de su contenido. */
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

/* LA CAJA DE TEXTO MIDE LO QUE SU LÍNEA MÁS LARGA. De ahí sale el centrado del
   lockup: `align-self: center` dentro de esta caja es el eje del titular. Con la
   caja estirada a la columna entera, el símbolo se habría ido al centro de la
   pantalla. */
.hh__texto {
  position: relative;
  z-index: 2;
  width: max-content;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(8px, 1.8svh, 26px);
}

/* EL SÍMBOLO, EN EL CENTRO DEL CARTEL. Absoluto y no en el flujo: en el flujo
   sería un hermano más de la columna de texto y se llevaría su sitio, y lo que
   se busca es justo lo contrario — que ocupe el hueco que ya había entre el
   titular y la figura.

   `translate(-50%, -50%)` sobre el 50/50 del cartel, o sea el centro de la banda
   por los dos ejes. La banda es lo que queda entre la barra y la tira, así que
   el símbolo se mueve con ellas y no hay ningún número que recalcular.

   El tope de ancho sigue en `min(cqw, svh)` como todo lo demás del cartel: es
   ancho y bajo —2.78 a 1— y atarlo sólo al alto lo dejaba en la mitad de lo que
   pide una marca de campaña. */
.hh__marca {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: var(--hh-marca-w);
  height: auto;
  pointer-events: none;
}

/* EL TITULAR. Los dos topes —ancho y alto— están explicados arriba: en una
   pantalla ancha y baja el que manda es el `svh`, y por eso el título encoge en
   vez de empujar a la tira fuera de la pantalla. */
.hh__titulo {
  margin: 0;
  font-family: var(--av-font-display);
  font-size: min(10cqw, 14.5svh);
  font-weight: 400;
  line-height: .84;
  letter-spacing: var(--av-track-display);
  text-transform: uppercase;
  color: var(--av-on-glass-strong);
}
.hh__linea { display: block; }

/* ── LAS DOS PÍLDORAS ────────────────────────────────────────────────────
   Las mismas medidas que `.pa__cta-in` del acordeón, copiadas a conciencia:
   9×16 de relleno, 11.5 de cuerpo, 7 de hueco y la flecha a 14. Aquí no hay
   tokens que reutilizar —el sistema tiene los de ACCIÓN, que son los de 44 px
   de alto, y estas dos no son eso: son la píldora chica que va sobre una card—
   así que lo que mantiene el parecido es tener los números en un solo sitio y
   escrito de dónde salen.

   Y las dos comparten declaración por eso mismo: la del cartel y la de la card
   son la misma píldora en dos sitios, no dos píldoras parecidas. */
.hh__cta-in,
.hh__ccta-in {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: var(--av-track);
  white-space: nowrap;
  color: var(--av-on-glass-strong);
}
.hh__cta-in { cursor: pointer; }
.hh__cta-in :deep(svg),
.hh__ccta-in :deep(svg) { width: 14px; height: 14px; }

/* ── la figura ───────────────────────────────────────────────────────────
   LA CAJA ES LA FIGURA. `aspect-ratio` puesta a la proporción del PNG, así que
   la caja mide exactamente lo que la foto y su centro ES el centro de la foto —
   sin eso, cualquier cosa que se centre contra ella apunta a otro sitio.

   SU SITIO, A LO ANCHO: pegada al margen derecho —el mismo que respeta el texto
   por su lado— y nunca más ancha que las dos últimas columnas de la tira, que es
   de donde sale el tope del alto de más abajo. Se probó en el centro, con el
   símbolo a la derecha, y se volvió: en el eje le quita el aire al titular.

   Y A LO ALTO, LA REGLA PEDIDA: ocupa las dos filas —el cartel y la tira de
   categorías— con un TERCIO justo cayendo en la segunda. Eso lo hace el
   `translateY(33.333%)`: un porcentaje de transformación se mide contra el
   propio elemento, así que es literalmente «un tercio de la foto por debajo del
   suelo del cartel», valga lo que valga su alto. Escrito como `bottom` negativo
   habría sido un tercio del CARTEL, que es otra cosa y sólo coincide por
   casualidad.

   Lo que cae en la segunda fila queda DETRÁS de las cards —`z-index: 1` contra
   el 2 de la tira—, que es lo que permite que la foto sea grande sin robarle
   sitio a nada: se ve entera hasta donde empiezan las cards y ahí se hunde.

   Ese tope no se escribe como `max-width` sino como tope del ALTO: con la
   proporción fija, tocar el ancho rompería la forma, así que el límite se
   escribe como el alto que corresponde al ancho máximo que se le consiente. */
.hh__figura-caja {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  aspect-ratio: 495 / 812;
  height: min(150%, calc((2 * var(--hh-card-w) + var(--hh-gap)) / .6096));
  transform: translateY(33.333%);
  pointer-events: none;
}
.hh__figura {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* EL FOCO, CENTRADO EN LA MARCA. Mismo centro que `.hh__marca` —el del cartel
   por los dos ejes— así que las dos comparten eje sin que ninguna tenga que
   saber dónde está la otra: si el reparto de bandas cambia, se mueven juntas.

   SUAVE, y ése es todo el encargo. La versión anterior iba al 11% de blanco en
   el centro y se leía como una mancha con borde; a la mitad de eso deja de verse
   como un degradado y pasa a leerse como lo que es, un foco de estudio detrás del
   símbolo. La parada intermedia baja en la misma proporción para que la caída
   siga siendo suave en todo el recorrido — bajar sólo el centro deja un escalón
   a mitad de camino.

   Va en `z-index: 0`: por encima del plano negro y por debajo de la marca, de la
   figura y del texto. Nada de lo que se lee pasa por detrás de él. */
.hh__aura {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  width: min(54cqw, 80svh);
  height: min(54cqw, 80svh);
  border-radius: 999px;
  background: radial-gradient(closest-side,
              rgba(255, 255, 255, .055),
              rgba(255, 255, 255, .022) 52%,
              transparent 74%);
  pointer-events: none;
}

/* ══ LA TIRA DE CATEGORÍAS ════════════════════════════════════════════ */
.hh__cats {
  position: relative;
  z-index: 2;
  flex: none;
  margin-top: clamp(10px, 2.6svh, 28px);
}

.hh__cab {
  display: grid;
  grid-template-columns: auto minmax(20px, 1fr);
  align-items: center;
  gap: clamp(10px, 1.6cqw, 22px);
  margin-bottom: clamp(8px, 1.4svh, 16px);
}
.hh__cabt {
  margin: 0;
  font-family: var(--av-font-display);
  font-size: clamp(15px, 1.7cqw, 24px);
  font-weight: 400;
  letter-spacing: var(--av-track-display);
  text-transform: uppercase;
  color: var(--av-on-glass-strong);
}
/* LA REGLA. Un pelo de alto —es una línea de cabecera, no un subrayado— y en el
   VERDE DE LAS FOTOS, no en el amarillo de la casa. El de la casa es el color de
   la marca de la tienda y aquí compite con la campaña; el verde sale de las
   cinco fotos que tiene debajo, así que la línea pertenece a lo que separa. De
   dónde sale exactamente, en `--hh-regla`. */
.hh__regla {
  height: 1px;
  background: var(--hh-regla);
  opacity: .9;
}

/* LA REJILLA. Cinco columnas iguales y el alto medido en `svh` — no en la
   proporción de la foto.

   Va así y no con `aspect-ratio` porque el alto de esta banda es lo que decide
   si la pieza cabe en la pantalla: con la proporción mandando, una ventana
   ancha da cards altísimas que se comen el cartel entero. Con el alto atado al
   viewport, la foto se recorta un poco —`cover` se encarga— y la pieza sigue
   entrando. En la medida de diseño, 1440×1024, las dos cuentas casi coinciden:
   254 px de ancho por 297 de alto contra los 318 que pediría la proporción. */
.hh__tira {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--hh-cols), minmax(0, 1fr));
  gap: var(--hh-gap);
}
.hh__card { min-width: 0; }
.hh__cbtn {
  position: relative;
  display: block;
  width: 100%;
  /* EL ALTO: EL 40% DE LA PIEZA, CON UN TOPE DE FORMA.

     El 40% es la medida pedida y es lo que manda en una pantalla normal — a
     1440×1024 son 410 px, contra los 297 que tenía antes. Es lo que convierte la
     tira de un pie de página en la mitad del cartel.

     El segundo tope es de FORMA y sólo salta en ventanas estrechas y altas: sin
     él, una tableta en vertical da cards de 180 px de ancho por 440 de alto, que
     no es un retrato sino una tira. A 1.9 el retrato sigue siendo alto —que es
     lo pedido— sin llegar a rendija. En escritorio no interviene: 253 × 1.9 son
     481, muy por encima de los 410 que pide el 40%. */
  height: min(clamp(150px, 40svh, 460px), calc(var(--hh-card-w) * 1.9));
  border: 0;
  padding: 0;
  background: none;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  /* La foto se acerca un punto al señalar. La card no se mueve ni crece: lo que
     responde es la imagen dentro de su recorte, que es el mismo gesto que hace
     el panal. */
  isolation: isolate;
}
.hh__cfoto {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .5s cubic-bezier(.22, 1, .36, 1);
}
@media (hover: hover) and (pointer: fine) {
  .hh__cbtn:hover .hh__cfoto,
  .hh__cbtn:focus-visible .hh__cfoto { transform: scale(1.04); }
}
.hh__cvelo {
  position: absolute;
  inset: auto 0 0;
  height: 62%;
  background: linear-gradient(to top,
              rgba(0, 0, 0, .78),
              rgba(0, 0, 0, .34) 46%,
              transparent);
  pointer-events: none;
}
.hh__cpie {
  position: absolute;
  left: clamp(8px, .9cqw, 14px);
  right: clamp(8px, .9cqw, 14px);
  bottom: clamp(8px, .9cqw, 14px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(6px, .8svh, 10px);
}
.hh__cnom {
  font-family: var(--av-font-display);
  font-size: clamp(12px, 1.15cqw, 17px);
  letter-spacing: var(--av-track-display);
  text-transform: uppercase;
  color: var(--av-on-glass-strong);
}

/* ══ ventana baja ═════════════════════════════════════════════════════
   POR ALTO Y NO POR ANCHO, que es la media query que casi nunca se escribe y
   aquí es la que decide si la pieza cumple lo que promete. Una ventana de
   1440×600 es ancha —ninguna regla de ancho se dispara— y sin embargo es donde
   el cartel se queda sin sitio: el hueco de la barra, la tira y el suelo son
   casi fijos, así que lo que se come el recorte es siempre lo mismo, el bloque
   de texto.

   Medido a 1440×600: al cartel le quedan 258 px y su bloque pedía 280. Con el
   titular a 12.5svh son 253 y entra. No se toca el botón: su alto es un token
   del sistema y una acción que encoge con la ventana deja de ser la misma
   acción en cada pantalla. */
@media (max-height: 700px) {
  .hh__titulo { font-size: min(10cqw, 12.5svh); }
  .hh__texto { gap: clamp(6px, 1.4svh, 26px); }
}

/* ══ tableta ══════════════════════════════════════════════════════════
   Cuatro columnas: a esta anchura la quinta card baja de 120 px y la foto deja
   de reconocerse. La categoría que sobra no se pierde — para eso está «Ver
   todo», que a partir de aquí es la salida y no un extra. */
@media (max-width: 900px) {
  .hh { --hh-cols: 4; }
  .hh__card:nth-child(n + 5) { display: none; }
  /* la figura no necesita regla propia: su caja sale de `--hh-card-w`, que ya
     se ha recalculado con cuatro columnas. Sigue siendo «las dos últimas». */
}

/* ══ teléfono ═════════════════════════════════════════════════════════
   LA TIRA SE DESLIZA. Cinco cards en 375 px son 63 px cada una y ahí no se
   reconoce ni la prenda ni el rótulo; cuatro tampoco. La salida no es apilarlas
   —eso rompe lo único que esta pieza promete, que se vea entera— sino dejar dos
   y media a la vista y que el dedo traiga el resto. El anclaje por card hace que
   el gesto acabe siempre en una foto completa y no a medio camino.

   Y LA FIGURA SE QUEDA, detrás del texto y bajada de tono. Quitarla dejaba la
   mitad de la pantalla vacía; a plena opacidad se comía el titular. */
@media (max-width: 640px) {
  .hh { padding-inline: var(--av-gutter); }

  /* EL TEXTO SE VA ARRIBA DEL TODO. En escritorio el bloque se centra en su
     banda porque ahí sobra sitio; en un teléfono ese centrado deja casi un
     tercio de pantalla vacío entre la barra y el titular, y lo primero que hay
     que leer acaba a media altura. Pegado arriba, lo primero que se ve al entrar
     es lo que la pieza tiene que decir, y el botón se sube con él.

     «Arriba» es DEBAJO DE LA BARRA, no debajo del filo: el hueco lo sigue
     reservando el relleno superior de la sección —`--av-nav-space`, los 16 de
     aire más los 55 de barra más otros 16— así que esto no le quita sitio a
     nada, sólo deja de repartir el que sobra. */
  .hh__cartel { justify-content: flex-start; }

  .hh__texto { gap: clamp(8px, 1.8svh, 18px); }
  .hh__titulo { font-size: min(19cqw, 13svh); }
  .hh__marca { width: min(26cqw, 10svh); }

  /* Aquí la tira se desliza y ya no hay columnas contra las que medir, así que
     la caja vuelve a una fracción de la pantalla — el alto lo pone la proporción.
     Y baja de tono: a plena opacidad se come el titular, que aquí le pasa por
     encima en vez de quedarse a un lado. */
  .hh__figura-caja {
    width: 76%;
    height: auto;
    opacity: .5;
    /* SE CAMBIA EL ORDEN DE CAPAS CON EL FOCO — ver `.hh__aura` aquí abajo. */
    z-index: 0;
  }

  /* EL FOCO SE INVIERTE: aquí no ilumina, TAPA.

     En escritorio es una luz de estudio detrás del símbolo, que se recorta
     contra el negro sin ayuda de nadie. En el teléfono el símbolo cae ENCIMA de
     la figura —no hay ancho para ponerlos uno al lado del otro— y un logotipo
     blanco sobre una foto tiene el contraste que tenga esa foto ese día: en
     ésta, cabello oscuro y tela negra con brillos.

     Así que la misma pieza, con el mismo centro, pasa a ser un velo del color
     del plano: apaga la foto justo detrás del símbolo y se disuelve antes de
     llegar a ningún borde, así que no se lee como un recuadro. Y sube una capa
     —por encima de la figura, por debajo del símbolo— porque un velo que va
     detrás de lo que tiene que tapar no tapa nada. */
  .hh__aura {
    z-index: 1;
    width: min(86cqw, 40svh);
    height: min(86cqw, 40svh);
    background: radial-gradient(closest-side,
                rgba(14, 14, 15, .88),
                rgba(14, 14, 15, .58) 52%,
                transparent 78%);
  }

  .hh__tira {
    display: flex;
    gap: var(--hh-gap);
    /* SANGRA POR LOS DOS LADOS: la tira arranca en el margen y se sale por el
       filo, así que la última card asoma cortada y se ve que hay más. Con la
       tira metida en la columna, el recorte cae justo en el margen y parece que
       se acaba ahí. */
    margin-inline: calc(var(--av-gutter) * -1);
    padding-inline: var(--av-gutter);
    overflow-x: auto;
    scroll-snap-type: x mandatory;

    /* Y EL ANCLAJE TIENE QUE RESPETAR ESE RELLENO, o el relleno no existe. Aquí
       estaba el bug del margen: `scroll-snap-align: start` alinea el arranque de
       la card con el arranque del ÁREA DE SCROLL, que no sabe nada del relleno,
       así que al cargar el navegador desplazaba la tira 16 px —medido:
       `scrollLeft: 16`— y se comía justo el margen que el relleno acababa de
       poner. La primera card quedaba pegada al filo y las demás no.

       `scroll-padding` es la contraparte: mueve la línea contra la que se ancla,
       y con el mismo valor que el relleno la card se posa donde empieza el
       texto. Van juntos siempre — uno pone el hueco y el otro impide que el
       anclaje lo borre. */
    scroll-padding-inline: var(--av-gutter);
    scrollbar-width: none;
  }
  .hh__tira::-webkit-scrollbar { display: none; }
  .hh__card {
    flex: none;
    width: 38vw;
    scroll-snap-align: start;
  }
  /* la de tableta se deshace: aquí caben las cinco porque se deslizan */
  .hh__card:nth-child(n + 5) { display: block; }
  .hh__cbtn { height: clamp(112px, 24svh, 200px); }
}

/* Sin movimiento: el acercamiento de la foto es decoración pura y se va entero.
   Lo que se toca no cambia. */
@media (prefers-reduced-motion: reduce) {
  .hh__cfoto { transition: none; }
}
</style>
