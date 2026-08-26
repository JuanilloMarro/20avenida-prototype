<script setup>
/**
 * <ProductPosterPanel> — UN cartel. La mitad de <ProductPoster>.
 *
 *   ┌─────────────────────────────┐
 *   │     ADIDAS CAMPUS CREAM      │  z4 · el titulo
 *   │   ▁▁▁    ┌──────────────┐    │
 *   │   logo   │      c3      │    │  z1 · el collage: logo + c1 + c2 + c3
 *   │  ┌────┐  └──────────────┘    │
 *   │  │ c1 │                      │
 *   │  └────┘ ▗▄▄▄▄▄▄▄▄▄▄▄▄▖       │
 *   │  ┌────┐▐    HEROE   ▌       │  z2 · el recorte grande
 *   │  │ c2 │▝▀▀▀┌──────┐▀▀       │
 *   │  └────┘   │  c4  │          │  z3 · la tarjeta de DELANTE
 *   │          └──────┘          │
 *   └─────────────────────────────┘
 *
 * `c2` Y `c4` ENSENAN LA MISMA FOTO, y esta pedido asi: el original se llama
 * «card 2 fondo y frente». El mismo par se ve grande en el collage y pequeno
 * pasando por delante del heroe — y eso es lo que remata el cruce de planos:
 * la misma imagen, a dos tamanos, en dos profundidades.
 *
 * CUATRO CAPAS, Y LO QUE LA HACE FUNCIONAR ES QUE SE CRUZAN. `c1`, `c2` y `c3`
 * van detras del heroe y `c4` delante, siendo los cuatro la misma clase de
 * objeto. Esa alternancia —tarjeta, zapato, tarjeta— es toda la profundidad de
 * la pieza, y cuesta dos `z-index`. Sin ella el recorte se lee pegado encima de
 * un collage en vez de metido dentro.
 *
 * ══ TODO SE MIDE EN `cqw`, Y ESE ES EL DISENO ═══════════════════════════════
 *
 * El cartel es una caja de proporcion fija —`aspect-ratio: 1 / 1.1`— declarada
 * como contenedor de consulta. Dentro, cada pieza se coloca en `cqw`: 1cqw es
 * el 1% del ancho DEL CARTEL, no del viewport.
 *
 * Consecuencia, que es justo lo que se pedia: el cartel se estrecha y todo lo de
 * dentro se estrecha con el, en bloque y en proporcion. La distribucion no se
 * recompone al pasar a telefono; se encoge. Verificado: de 645 px de columna en
 * escritorio a 343 en un telefono de 375, o sea al 53%, con el reparto interno
 * intacto.
 *
 * Y NO es `transform: scale()`, que seria la solucion facil y la mala: eso deja
 * la caja original ocupando su sitio en el flujo, desenfoca el texto en pantallas
 * sin densidad y encoge las zonas tactiles. Con `cqw` es maquetacion de verdad —
 * el texto se rasteriza a su tamano y el flujo sabe cuanto ocupa la pieza.
 *
 * ══ LO QUE NO LLEVA ═════════════════════════════════════════════════════════
 *
 * Ni descripcion, ni precio, ni boton, ni contador. Solo el titulo. Es una pieza
 * de IMAGEN: lo que haya que decir se dice en la ficha. Tampoco es pulsable —
 * envolver un collage entero en un `<button>` da un objetivo tactil del tamano
 * de media pantalla y un anuncio ilegible en un lector. Si algun dia tiene que
 * llevar a algun sitio, el sitio es un enlace en el titulo, no la pieza entera.
 */

/**
 * DOS CLASES DE FOTO, y `scripts/build-poster.py` las trata distinto:
 *
 *   LAS TARJETAS llegan OPACAS sobre blanco puro y se dejan como estan. El
 *   blanco de la foto es el mismo blanco de la tarjeta que la contiene, asi que
 *   se funden y el zapato se lee flotando en ella. Recortarlas a silueta seria
 *   trabajo para empeorarlas.
 *
 *   EL HEROE Y EL LOGOTIPO llegan con alfa y SI se recortan a tinta. El heroe va
 *   suelto sobre el collage y su margen transparente decide cuanto ocupa dentro
 *   de su hueco: sin recortar, dos zapatos con margenes distintos salen a
 *   tamanos distintos con las mismas medidas de maquetacion.
 *
 * Eso ultimo es tambien la condicion para que la pieza pueda volverse dinamica:
 * quien suba una foto no puede tener que ajustar ademas unas coordenadas a mano.
 */
defineProps({
  /** El titulo de arriba. Marca y modelo, que es lo que identifica al cartel. */
  titulo: { type: String, required: true },

  /**
   * El logotipo de la marca, en PNG con alfa.
   *
   * ES UNA DE LAS CUATRO IMAGENES DEL COLLAGE, no un adorno aparte: ocupa su
   * hueco como las otras tres y por eso va aqui y no en una constante.
   *
   * PENDIENTE — hoy no hay ni un logotipo de marca en el repo (`public/brand/`
   * solo tiene el letrero de 20 Avenida). Mientras no lo haya, el hueco se
   * rellena con `marca` escrito, que es lo que un logotipo dice. Es un
   * marcador de posicion honesto: se ve que ahi va algo y se lee que marca es.
   */
  logo: { type: String, default: '' },
  /** El nombre de la marca. Reserva del hueco del logotipo, y su `alt`. */
  marca: { type: String, required: true },

  /** El recorte grande, el que flota sobre el collage. */
  heroe: { type: Object, required: true },
  /**
   * Las cuatro tarjetas, EN ORDEN DE HUECO y no de importancia: c1 y c2 a la
   * izquierda, c3 la grande de la derecha, y c4 la que va delante del heroe.
   *
   * Cada una `{ src, alt }`. `c2` y `c4` traen la MISMA foto a proposito — ver
   * el diagrama del cabecero.
   */
  cartas: { type: Array, required: true },

  /**
   * El degradado del fondo, `{ de, a }` en hexadecimal.
   *
   * SALE DEL COLORWAY DEL PROPIO ZAPATO —`word` y `surface`— y no de una paleta
   * inventada: `word` es el tono profundo muestreado de la foto y `surface` el
   * claro. Un cartel del Mind 001 va de terracota a arena y uno del Samba de
   * verde bosque a verde claro, sin que nadie elija nada.
   *
   * Es tambien el campo que la empresa va a querer tocar el dia que esto sea
   * dinamico, y por eso entra por prop en vez de calcularse dentro.
   */
  fondo: { type: Object, required: true },
})
</script>

<template>
  <article
    class="pn"
    :style="{ '--pn-de': fondo.de, '--pn-a': fondo.a }"
  >
    <!-- ══ z4 · EL TITULO ═══════════════════════════════════════════════════
         VERSALES con trazo abierto, y es la excepcion a la regla R1 de la casa
         —primera mayuscula y el resto minusculas—. La misma clase de excepcion
         que el texto gigante del escaparate y por el mismo motivo: esto es un
         ROTULO de cartel, no una etiqueta de interfaz. Un cartel con el titulo
         en caja de frase se lee como un pie de foto.

         El trazo de .26em no es decorativo: sin el, unas versales a 18 px se
         apelmazan. Va con las versales y se quita con ellas. -->
    <h3 class="pn__titulo">{{ titulo }}</h3>

    <!-- ══ z1 · EL COLLAGE ══════════════════════════════════════════════════
         Cuatro imagenes: el logotipo y tres tarjetas. -->
    <div class="pn__logo">
      <img v-if="logo" :src="logo" :alt="marca" decoding="async">
      <!-- El hueco con la marca escrita mientras no haya PNG. `aria-hidden`
           porque el titulo de arriba ya dice la marca: repetirla es ruido para
           quien no ve la pieza. -->
      <span v-else aria-hidden="true">{{ marca }}</span>
    </div>

    <figure class="pn__carta pn__carta--c1">
      <img :src="cartas[0].src" :alt="cartas[0].alt" loading="lazy" decoding="async">
    </figure>

    <figure class="pn__carta pn__carta--c2">
      <img :src="cartas[1].src" :alt="cartas[1].alt" loading="lazy" decoding="async">
    </figure>

    <figure class="pn__carta pn__carta--c3">
      <img :src="cartas[2].src" :alt="cartas[2].alt" loading="lazy" decoding="async">
    </figure>

    <!-- ══ z2 · EL HEROE ════════════════════════════════════════════════════
         Sin tarjeta: va suelto sobre el collage, y eso es lo que lo pone en otro
         plano. La sombra es `drop-shadow` y no `box-shadow` porque sigue la
         SILUETA del recorte; una sombra de caja aqui dibujaria el rectangulo que
         el recorte existe para que no se vea. -->
    <img
      class="pn__heroe"
      :src="heroe.src" :alt="heroe.alt" decoding="async"
    >

    <!-- ══ z3 · LA TARJETA DE DELANTE ═══════════════════════════════════════
         Misma clase de objeto que c1, c2 y c3 — sólo cambia el `z-index`. -->
    <figure class="pn__carta pn__carta--c4">
      <img :src="cartas[3].src" :alt="cartas[3].alt" loading="lazy" decoding="async">
    </figure>
  </article>
</template>

<style scoped>
.pn {
  /* LA CAJA. La proporcion de la referencia era 4:5, y se recorto a 1:1.1 por
     una consecuencia de pagina: con 4:5 dos columnas de 645 px dan una seccion
     de ~900 px de alto —se come la pantalla entera— y en telefono dos filas
     apiladas pasan de 880. A 1:1.1 la seccion de escritorio cabe en ~810 sin ser
     pantalla completa, igual que el diptico. Lo que se pierde es aire arriba y
     abajo, no tarjetas. */
  aspect-ratio: 1 / 1.1;

  /* EL CONTENEDOR DE CONSULTA. Sin esto `cqw` no existe y toda la maquetacion
     de aqui abajo se cae al valor inicial — es la linea de la que depende la
     pieza entera. */
  container-type: inline-size;

  position: relative;
  overflow: hidden;
  border-radius: clamp(14px, 2.6cqw, 26px);

  /* DOS CAPAS, y la de arriba es de legibilidad y no de estilo.
     El degradado va a 150deg —casi vertical, con una inclinacion— y no a 118:
     con la diagonal tumbada, la esquina superior derecha era el punto mas claro
     de la pieza y el titulo, que es blanco y cruza todo el ancho, se perdia en
     ella. A 150 la franja de arriba es el extremo OSCURO en todo su ancho, y
     abajo queda el claro, que es donde se posa el heroe.

     Encima, un velo negro que muere al 30% del alto. Es el seguro del titulo:
     el degradado depende de dos colores que vienen del zapato y el dia que
     entre uno claro, el velo sigue dando el contraste. Se apaga solo en cuanto
     baja —no toca al collage ni al heroe— y por eso va aqui, en la misma
     declaracion, y no como un elemento aparte que habria que apilar. */
  background:
    linear-gradient(180deg, rgba(0, 0, 0, .34) 0%, rgba(0, 0, 0, 0) 30%),
    linear-gradient(150deg, var(--pn-de) 0%, var(--pn-a) 100%);
  color: var(--pn-tinta, #FFFFFF);
}

/* EL GRANO, el mismo del resto de la casa. Aqui no hay vidrio que refracte
   nada —para eso esta en `backgrounds.js`— pero si hace la otra mitad de su
   trabajo: un degradado de 8 bits sobre 700 px de alto hace bandas visibles, y
   3-6% de grano es exactamente donde dejan de verse. */
.pn::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--pn-grano);
  opacity: var(--pn-grano-a);
  pointer-events: none;
}

/* ── z4 · el titulo ───────────────────────────────────────────────────────── */
.pn__titulo {
  position: absolute;
  z-index: 4;
  left: 6cqw;
  top: 5cqw;
  width: 88cqw;

  margin: 0;
  text-align: center;
  text-transform: uppercase;
  font-size: clamp(11px, 2.9cqw, 21px);
  font-weight: 700;
  letter-spacing: .26em;
  /* El trazo se aplica TAMBIEN despues de la ultima letra, asi que la caja
     acaba .26em despues que la tinta y el centrado sale corrido a la izquierda.
     Este relleno devuelve el hueco. Mismo arreglo que `.ps__word`, y su numero
     es SIEMPRE el del trazo de arriba. */
  padding-inline-start: .26em;
  line-height: 1.2;
  color: var(--pn-tinta, #FFFFFF);
  text-wrap: balance;
}

/* ── z1 · el logotipo ─────────────────────────────────────────────────────── */
/* EL HUECO DEL LOGOTIPO.

   SUBIDO Y CASI CUADRADO, y las dos cosas son el mismo arreglo. Estaba en
   `top: 16cqw` con 17x9 —una caja apaisada— y el logotipo de adidas es el
   trebol CON la palabra debajo: proporcion 1.03, o sea casi cuadrado. En una
   caja apaisada el `contain` lo dejaba en 59 px de ancho dentro de un hueco de
   108, y encima el hueco terminaba a 13 px de donde empieza `c1`.

   Ahora la caja va con la proporcion del logotipo y arranca 4cqw mas arriba:
   entre su filo inferior (24cqw) y el techo de `c1` (27cqw) ya no hay nada que
   se pise.

   EL ALTO VA HOLGADO A PROPOSITO. La caja es 17x12 y el logotipo de hoy da
   1.45, asi que `contain` lo deja mandado por el ancho y sobra algo por arriba
   y por abajo. Es deliberado: el logotipo es lo unico de la pieza que la
   empresa va a cambiar por uno de otra marca, y cada marca tiene la suya —el
   trebol con la palabra da 1.45, un swoosh solo pasa de 2.7 y una bola de
   Jordan baja de 1. Con la caja apretada a la proporcion de hoy, el primer
   logotipo distinto se sale o se queda enano. Con holgura, `contain` lo
   resuelve solo. */
.pn__logo {
  position: absolute;
  z-index: 1;
  left: 9cqw;
  top: 12cqw;
  width: 17cqw;
  height: 12cqw;

  /* BLOQUE Y NO REJILLA, y esto es la segunda mitad del arreglo. Con
     `display: grid` la imagen es un item, y el `height: 100%` de un item se
     resuelve contra su PISTA — que aqui es `auto`, o sea que la dimensiona el
     propio contenido. El tope se medía contra sí mismo y la imagen seguía
     saliéndose 10 px por abajo, medido.

     En un bloque con alto definido —14cqw lo es— el `100%` de un hijo se
     resuelve contra ese alto y no hay circularidad. */
  display: block;
}
/* MEDIDA CONTRA EL HUECO, no con `max-*`. Esto era el bug de verdad: con
   `max-height: 100%` sobre un item de rejilla, el `100%` se resuelve contra la
   PISTA de la rejilla — y la pista es `auto`, o sea que se dimensiona con el
   contenido. El tope se calculaba contra si mismo, no contra la caja.

   Medido: hueco de 108x57 y la imagen renderizando 108x105. Se salia 48 px por
   abajo, justo encima de `c1`, y lo que quedaba tapado era la palabra
   «adidas». Con `width`/`height` al 100% el `contain` mide contra la caja y no
   hay forma de que se desborde. */
.pn__logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* A la izquierda: el hueco es un pelo mas ancho que el logotipo y dejarlo
     centrado lo separaba del filo por el que se alinea con las tarjetas. */
  object-position: left center;
}
/* La reserva mientras no haya PNG. Se pinta como se pintaria un logotipo
   —blanco, compacto y sin caja— para que el hueco se lea ocupado y no roto. */
.pn__logo span {
  display: grid;
  place-items: center start;
  height: 100%;
  font-size: clamp(13px, 3.4cqw, 26px);
  font-weight: 800;
  letter-spacing: -.02em;
  line-height: 1;
  color: var(--pn-tinta, #FFFFFF);
  opacity: .92;
}

/* ── las cuatro tarjetas ──────────────────────────────────────────────────── */
.pn__carta {
  position: absolute;
  z-index: 1;
  margin: 0;
  overflow: hidden;

  /* 22 px en escritorio, que es lo pedido, y proporcional hacia abajo. El
     `clamp` pone un suelo de 12: por debajo de eso el redondeo desaparece y la
     tarjeta se lee como un recorte cuadrado. */
  border-radius: clamp(12px, 3.4cqw, 22px);

  /* BLANCO SOLIDO Y NO VIDRIO, aunque el vidrio sea el material de la casa. Es
     una decision con respaldo medido: el doc 04 §2 documenta que sobre fondo
     claro el material DESAPARECE —es el control de la bateria de fondos— y aqui
     el plano es un degradado claro. Un `GlassSurface` en estas tarjetas seria
     cuatro instancias de lente para no verse. */
  background: #FFFFFF;

  /* Muy suave y muy abierta: las tarjetas de la referencia casi no la tienen.
     Lo justo para que no parezcan pintadas sobre el degradado. */
  box-shadow: 0 2cqw 4cqw -1.6cqw rgba(0, 0, 0, .28);
}
.pn__carta img {
  display: block;
  width: 100%;
  height: 100%;
  /* CONTENIDA Y SIN RELLENO. El relleno sobra porque la foto YA TRAE EL SUYO:
     son planos de producto sobre blanco puro, con su aire alrededor del zapato.
     Anadirle mas por CSS lo duplicaba y el zapato quedaba nadando.

     Y contenida y no a sangre: recortar una foto de zapatilla por los lados le
     corta la puntera o el talon. Las bandas blancas que deja el `contain` no se
     ven — el blanco de la foto y el de la tarjeta son el mismo 255. */
  object-fit: contain;
}
/* NINGUNA VA A SANGRE, y la referencia si tenia una. Ahi la grande de la
   derecha era un MACRO —un recorte cerrado del ante y la suela— y a sangre
   rompia la escala del collage, que es lo que le daba variedad.

   Entre las fotos que hay no hay ningun macro: las seis son planos enteros del
   zapato. Recortar uno a sangre para imitar el efecto le cortaria la puntera, y
   un plano de producto con la puntera cortada se lee como un error de
   maquetacion y no como un encuadre. La variedad la da aqui el TAMANO de los
   huecos, que es la otra mitad de lo que hacia la referencia.

   Si algun dia entra un macro en el juego de fotos, esto son dos lineas:
   `object-fit: cover` en `c3` y quitarle el relleno. */

/* ── LOS CUATRO HUECOS ────────────────────────────────────────────────────
   TODOS APAISADOS, y eso lo decidieron las fotos y no la referencia. El
   original de Canva tenia la tarjeta de la izquierda VERTICAL, y aqui se probo
   igual: las seis fotos que hay son planos de producto apaisados —de 1.50 a
   1.82 de proporcion— y contenidas en un hueco vertical dejaban mas de un
   tercio de la tarjeta en blanco. Un hueco alto sin nada alto que meter dentro
   no es fidelidad a la referencia, es una tarjeta a medio llenar.

   Lo que SI se conserva de la referencia es lo que la hace funcionar: la
   jerarquia de tamanos —una grande a la derecha y tres chicas— y las
   posiciones relativas. */
.pn__carta--c1 { left: 5cqw;  top: 27cqw; width: 35cqw; height: 20cqw; }
.pn__carta--c2 { left: 5cqw;  top: 51cqw; width: 35cqw; height: 24cqw; }
.pn__carta--c3 { left: 44cqw; top: 17cqw; width: 52cqw; height: 36cqw; }
/* LA DE DELANTE. `z-index: 3` es el cruce: pasa por encima del heroe mientras
   sus tres hermanas quedan debajo. Es literalmente el numero que da la
   profundidad de la pieza. */
.pn__carta--c4 {
  z-index: 3;
  left: 59cqw; top: 80cqw; width: 35cqw; height: 21cqw;
}

/* ── z2 · el heroe ────────────────────────────────────────────────────────── */
.pn__heroe {
  position: absolute;
  z-index: 2;
  left: 11cqw;
  top: 46cqw;
  width: 82cqw;
  height: 44cqw;

  display: block;
  object-fit: contain;
  /* CENTRADO, y no apoyado abajo. Con `bottom` la tinta se pega al filo inferior
     del hueco, asi que dos zapatos de proporcion distinta —el Campus da 2.13 y
     el Samba 2.57— arrancan a alturas distintas y el que es mas plano se
     descuelga. Centrado, los dos reparten su diferencia arriba y abajo y el
     cruce con `c3` por arriba y con `c4` por abajo se mantiene en los dos. */
  object-position: center;

  /* La sombra sigue la silueta. Dos capas: una corta y densa que lo posa, y una
     larga y abierta que lo despega del collage. */
  filter:
    drop-shadow(0 1.2cqw 1.6cqw rgba(0, 0, 0, .28))
    drop-shadow(0 4cqw 6cqw rgba(0, 0, 0, .22));
  pointer-events: none;
}

/* ── por debajo de 360 px de columna ──────────────────────────────────────────
   La escala pura aguanta hasta aqui y no mas. Medido: con el reparto de arriba,
   a 375 px de viewport la tarjeta chica cae en 117 px y a 320 en 98 — y en el
   doc del diptico esta escrito que por debajo de ~100 px una foto de zapatilla
   deja de reconocerse.

   NO se recompone: se le da mas peso a las dos tarjetas chicas dentro del mismo
   reparto. Siguen en su sitio y en su orden; sólo dejan de ser las mas
   castigadas por el encogimiento. */
@container (max-width: 360px) {
  .pn__carta--c1 { left: 4cqw; top: 26cqw; width: 41cqw; height: 23cqw; }
  .pn__carta--c2 { left: 4cqw; top: 52cqw; width: 41cqw; height: 27cqw; }
  .pn__carta--c3 { left: 49cqw; top: 16cqw; width: 48cqw; height: 34cqw; }
  .pn__carta--c4 { left: 56cqw; top: 79cqw; width: 40cqw; height: 24cqw; }
  .pn__logo      { left: 5cqw; top: 11cqw; width: 18cqw; height: 15cqw; }
}
</style>
