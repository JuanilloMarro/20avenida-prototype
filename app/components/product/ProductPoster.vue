<script setup>
/**
 * <ProductPoster> — dos carteles, uno al lado del otro.
 *
 *   ┌──────────────┐  ┌──────────────┐
 *   │              │  │              │
 *   │   cartel A   │  │   cartel B   │      escritorio
 *   │              │  │              │
 *   └──────────────┘  └──────────────┘
 *
 *   ┌──────────────┐
 *   │   cartel A   │                        telefono: las columnas
 *   └──────────────┘                        pasan a filas y CADA CARTEL
 *   ┌──────────────┐                        SE ENCOGE ENTERO, sin
 *   │   cartel B   │                        recomponerse por dentro
 *   └──────────────┘
 *
 * ES UNA PIEZA REPETIDA, NO UNA COMPOSICION. Las dos mitades son el mismo
 * <ProductPosterPanel> con distintos datos — la misma relacion que hay entre
 * <ProductAccordion> y su panel. Eso es lo que hace barata la pieza y es lo que
 * la deja lista para el dia dinamico: el registro de la empresa es UN CARTEL, y
 * la seccion sólo dice cuantos van y como se reparten.
 *
 * ══ EL ENCOGIMIENTO, QUE ES EL ENCARGO ══════════════════════════════════════
 *
 * La distribucion interna del cartel no se recompone al pasar a telefono: se
 * escala. Toda la maquinaria esta en el panel —`container-type` mas medidas en
 * `cqw`—; aqui sólo se decide el ANCHO de cada columna, que es la variable de
 * la que cuelga todo lo demas.
 *
 * Medido sobre la pagina real:
 *
 *   viewport 1440  ->  columna 645 px  ->  100%
 *   viewport  375  ->  columna 343 px  ->   53%
 *   viewport  320  ->  columna 288 px  ->   45%
 *
 * 645 sale de 1440 menos dos `--av-gutter` (57.6 cada uno) menos el hueco entre
 * columnas, partido por dos.
 *
 * ══ EL REGISTRO DE UN CARTEL ════════════════════════════════════════════════
 *
 * Un titulo, una marca, un logotipo, una carpeta de fotos y dos colores. Nada
 * mas, y esa cortedad es intencionada: es el registro que la empresa va a editar
 * el dia que la pieza sea dinamica. Los colores estan MUESTREADOS de la propia
 * foto del zapato — ver la nota de `CARTELES`.
 */
import { GRAIN_URL, GRAIN_DEFAULT } from '~/assets/js/backgrounds'
import ProductPosterPanel from './ProductPosterPanel.vue'

/**
 * Los carteles.
 *
 * ══ POR QUE LOS DATOS VIVEN AQUI Y NO EN `colorways.js` ════════════════════
 *
 * Se empezo sacandolos de alli —el degradado era el `word` y el `surface` del
 * colorway— y estaba bien mientras los dos zapatos eran productos del catalogo.
 * Estos dos no lo son: el Campus de Bad Bunny y el Samba beige entraron como
 * material de CARTEL, sin secuencia de scrollover, sin tallas y sin precio.
 * Meterlos en `colorways.js` obligaria a inventarles esos campos, y un dato
 * inventado en el fichero del catalogo es peor que un dato en otro sitio.
 *
 * Asi que el registro de un cartel es esto: un titulo, una marca, un logotipo,
 * una carpeta de fotos y dos colores. **Ese es exactamente el registro que la
 * empresa va a editar** el dia que la pieza sea dinamica, y por eso conviene
 * que sea corto y que no arrastre nada del catalogo.
 *
 * ══ LOS COLORES SALEN DE LA FOTO, MEDIDOS ══════════════════════════════════
 *
 * Muestreados sobre los pixeles opacos del propio recorte del heroe:
 *
 *   Campus Cream   p20 #C1B8AB   p85 #E4DED5   — no tiene ni un tono oscuro
 *   Samba Beige    p20 #84583B   p85 #DCD3C8   — el p20 ES la suela de caramelo
 *
 * El Samba usa su p20 tal cual: la suela de goma le da un marron que sirve de
 * extremo profundo. El Campus no tiene ninguno —es crema de arriba abajo— asi
 * que su oscuro esta DERIVADO: se le toma el matiz al p20 (37°) y se le baja el
 * valor al 42%. Es el unico color de los cuatro que no esta medido, y por eso
 * queda escrito.
 */
const CARTELES = [
  {
    id: 'campus',
    carpeta: '/products/poster/campus',
    marca: 'adidas',
    modelo: 'Campus Cream',
    /* El titulo de la pieza. Va aparte de `marca` y `modelo` y no concatenado,
       porque el nombre completo de este es largo y en el cartel se corta a lo
       que identifica al zapato. El nombre de calle entero —adidas x Bad Bunny
       Campus «Cream»— es de la ficha, no del rotulo. */
    titulo: 'adidas Campus Cream',
    fondo: { de: '#6E6152', a: '#E9E3D9' },
    alt: {
      heroe: 'adidas Campus Cream de Bad Bunny, perfil exterior',
      c1: 'Suela', c2: 'El par, desde atras',
      c3: 'Tres cuartos delantero', c4: 'El par, desde atras',
    },
  },
  {
    id: 'samba-beige',
    carpeta: '/products/poster/samba-beige',
    marca: 'adidas',
    modelo: 'Samba OG Beige',
    titulo: 'adidas Samba OG Beige',
    fondo: { de: '#84583B', a: '#E4DCD0' },
    alt: {
      heroe: 'adidas Samba OG Beige/White, perfil exterior',
      c1: 'Suela de caramelo', c2: 'El par, desde atras',
      c3: 'Tres cuartos delantero', c4: 'El par, desde atras',
    },
  },
]

/* UN SOLO LOGOTIPO PARA LOS DOS, y no es un atajo: las dos columnas son adidas.
   El original se llama literalmente «logo para ambos». El dia que un cartel sea
   de otra marca, esto pasa a ser un campo de `CARTELES` y nada mas. */
const LOGO = '/products/poster/logo-adidas.webp'

const props = defineProps({
  /**
   * Que carteles se pintan, por id. Dos por defecto.
   *
   * Acepta mas de dos y la rejilla los reparte, pero la pieza esta pensada para
   * PARES: con tres, el ultimo se queda solo en su fila y el equilibrio de la
   * doble columna —que es de lo que va— se pierde.
   *
   * Los ids van ESCRITOS y no `CARTELES.map(...)`, que es lo natural y lo que no
   * compila: `defineProps()` se iza fuera del `setup()`, asi que su valor por
   * defecto no puede leer una constante declarada en el mismo bloque. Es la
   * misma trampa que obligo a sacar la lista de variantes del material a
   * `~/lib/glass-variants`. Aqui son dos cadenas y no compensa un modulo.
   */
  items: { type: Array, default: () => ['campus', 'samba-beige'] },
  /**
   * El plafon de la seccion — NO el de los carteles, que traen el suyo.
   *
   * `#050506` es la primera parada de la rampa `negro` de marca, y es el MISMO
   * que usan el rollo, el panal, el diptico y el pie. No es un negro elegido
   * aparte: con los cinco planos del mismo tono, la costura entre secciones
   * desaparece y el tramo bajo de la pagina se lee como un bloque.
   *
   * Aqui ademas hace un trabajo que en las otras piezas no hace: los dos
   * carteles son claros y estan recortados con esquina redonda, asi que contra
   * negro se leen como dos objetos POSADOS sobre la pagina. Sobre la rampa del
   * escenario —que en ese tramo ya va aclarando— los filos se difuminaban y los
   * carteles parecian pegados al fondo.
   */
  bg: { type: String, default: '#050506' },
  /** el grano, 0-100. Aqui no es para el vidrio: es contra el bandeado. */
  grain: { type: Number, default: GRAIN_DEFAULT },
})

/* Un id que no este en `CARTELES` se cae fuera en vez de pintar un cartel a
   medias con las rutas rotas. */
const carteles = computed(() =>
  props.items
    .map(id => CARTELES.find(c => c.id === id))
    .filter(Boolean)
    .map(c => ({
      id: c.id,
      titulo: c.titulo,
      marca: c.marca,
      logo: LOGO,
      heroe: { src: `${c.carpeta}/heroe.webp`, alt: c.alt.heroe },
      /* `c2` y `c4` apuntan a ficheros distintos con la MISMA foto dentro. Se
         duplica el fichero en vez de reutilizar la ruta porque el dia que el
         frente lleve otra imagen —que es lo natural cuando haya catalogo— el
         cambio es una linea en el script y aqui no se toca nada. */
      cartas: ['c1', 'c2', 'c3', 'c4'].map(k => ({
        src: `${c.carpeta}/${k}.webp`,
        alt: `${c.modelo} — ${c.alt[k]}`,
      })),
      fondo: c.fondo,
    })))

const estilo = computed(() => ({
  '--pp-bg': props.bg,
  /* CRUDO, sin envolver. `GRAIN_URL` YA ES `url("data:image/svg+xml,...")` —
     asi lo exporta `backgrounds.js` y asi lo pasan el panal, el rollo, el
     diptico y el pie. Envolverlo otra vez daba `url("url(\"data:...\")")`, que
     es un valor invalido: la declaracion se cae entera y no se pinta grano
     ninguno, ni en la seccion ni dentro de los carteles.

     El sintoma era justo el que se veia: el plafon quedaba en negro PLANO y al
     lado del panal —que si lo tiene— se leia mas duro, aunque los dos digan
     `#050506`. El grano no es decoracion; es lo que hace que dos planos del
     mismo color se lean como la misma superficie. */
  '--pn-grano': GRAIN_URL,
  '--pn-grano-a': String(Math.min(100, Math.max(0, props.grain)) / 100),
}))
</script>

<template>
  <section v-if="carteles.length" class="pp" :style="estilo" aria-label="Destacados">
    <div class="pp__rejilla">
      <ProductPosterPanel
        v-for="c in carteles"
        :key="c.id"
        :titulo="c.titulo"
        :marca="c.marca"
        :logo="c.logo"
        :heroe="c.heroe"
        :cartas="c.cartas"
        :fondo="c.fondo"
      />
    </div>
  </section>
</template>

<style scoped>
.pp {
  position: relative;
  /* NEGRO FUERTE, el mismo del rollo y del panal. Tapa la rampa del escenario a
     proposito — el porque esta en la prop `bg`. */
  background-color: var(--pp-bg);

  /* LAS DOS FRANJAS QUE NO SE USAN, las mismas del rollo.

     Arriba, lo que la barra fija del ecommerce ocupa sin estar en el flujo —
     `--av-nav-space`, con respaldo de 87px por si la pieza se monta en un repo
     sin `tokens.css`. Abajo, los 70 px donde se posa la barra del NAVEGADOR en
     telefono. Nada que haya que leer entra en esas dos franjas. */
  --pp-suelo: 70px;
  padding:
    var(--av-nav-space, 87px)
    var(--av-gutter)
    calc(var(--pp-suelo) + env(safe-area-inset-bottom, 0px));
}

/* EL GRANO DE LA SECCION, el mismo que el del panal y el del pie. Aqui no hay
   vidrio que refracte nada, asi que no cumple la funcion de `backgrounds.js`;
   cumple la otra: dos planos del mismo negro, uno con textura y otro liso, se
   distinguen a simple vista, y esta pieza toca al rollo y al panal por arriba y
   por abajo. Mismo grano = misma superficie = sin costura.

   Los carteles llevan ADEMAS el suyo, contra el bandeado de su degradado. Son
   dos granos porque son dos superficies distintas, no una duplicacion. */
.pp::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--pn-grano);
  opacity: var(--pn-grano-a);
  pointer-events: none;
}

/* Por encima del grano. Sin esto la rejilla queda en el mismo plano que el
   `::before` posicionado y depende del orden del arbol; con `z-index` es
   explicito. */
.pp__rejilla { position: relative; z-index: 1; }

.pp__rejilla {
  --pp-gap: clamp(16px, 2.4vw, 40px);
  display: grid;
  /* DOS COLUMNAS IGUALES. `1fr 1fr` y no `repeat(auto-fit, minmax(...))`: la
     pieza es una doble columna por definicion, y un `auto-fit` la dejaria
     decidir sola cuantas caben — que es justo lo que no se quiere. El paso a
     una columna es una decision, y esta escrita abajo. */
  grid-template-columns: 1fr 1fr;
  gap: var(--pp-gap);

  /* El techo. Sin el, en un monitor ancho cada cartel pasa de 800 px y el
     collage se lee como un pliego de revista en vez de como una pieza de la
     pagina. Centrado, que es lo que hace el `margin-inline: auto`. */
  max-width: 1480px;
  margin-inline: auto;
}

/* ── escritorio: PANTALLA COMPLETA ───────────────────────────────────────────
   `100svh`, el mismo alto que el acordeon y el rollo. Las tres piezas se comen
   el viewport y tienen que medir lo mismo o la pagina deja de avanzar de
   pantalla en pantalla. `svh` y no `dvh` ni `vh` por lo de siempre — el
   razonamiento largo esta en `ProductAccordion.vue`.

   Y AQUI APARECE UN PROBLEMA QUE NO EXISTIA MIENTRAS LA SECCION CRECIA SOLA:
   el cartel tiene proporcion fija, asi que su alto lo decide su ancho. Con la
   seccion a pantalla completa el alto ya NO es libre —es lo que quede entre la
   barra y el suelo— y en una pantalla baja el cartel se salia por abajo.

   Por eso el ancho de columna es el MENOR de dos topes:

     · la mitad de la fila, que es el tope de siempre
     · el alto disponible dividido por 1.1, que es el ancho al que el cartel
       mide exactamente lo que hay

   Manda el que quede mas chico, asi que en pantalla ancha y baja el cartel se
   estrecha para caber de alto en vez de desbordarse, y las dos columnas se
   centran con `justify-content`. Medido a 1440x900: hueco de 743 px, tope por
   alto 675, tope por ancho 645 — manda el ancho y quedan 33 px de aire. */
@media (min-width: 861px) {
  .pp {
    height: 100svh;
    display: grid;
    place-items: center;
  }
  .pp__rejilla {
    /* El hueco real entre la barra y el suelo. Se repite aqui la cuenta del
       `padding` porque `100%` en una pista de rejilla es del ANCHO, no del
       alto: no hay forma de referirse al alto disponible sin escribirlo. */
    --pp-alto: calc(
      100svh - var(--av-nav-space, 87px) - var(--pp-suelo)
      - env(safe-area-inset-bottom, 0px)
    );
    grid-template-columns:
      repeat(2, min(
        calc((100% - var(--pp-gap)) / 2),
        calc(var(--pp-alto) / 1.1)
      ));
    justify-content: center;
    width: 100%;
  }
}

/* ── telefono y tableta estrecha ──────────────────────────────────────────────
   LAS COLUMNAS PASAN A FILAS y nada mas: cada cartel conserva su proporcion y
   su distribucion interna, y se encoge entero. Toda la maquinaria esta en el
   panel, en `cqw`; aqui sólo cambia el ancho del que cuelga.

   El corte en 860 es el mismo del diptico, y por el mismo motivo: es donde dos
   columnas de contenido dejan de tener ancho suficiente para leerse.

   Y AQUI LA SECCION DEJA DE SER DE PANTALLA COMPLETA, a proposito: dos carteles
   apilados de proporcion 1:1.1 miden juntos mas de dos veces el ancho de la
   pantalla de alto. Forzarlos a `100svh` seria encogerlos a la mitad para que
   quepan los dos a la vez, y a ese tamano el collage no se lee — que es
   justamente lo que esta pieza existe para evitar. En telefono la seccion
   scrollea, como el diptico. Las dos franjas de la barra y el suelo se quedan:
   esas si valen en las dos disposiciones. */
@media (max-width: 860px) {
  .pp__rejilla {
    grid-template-columns: 1fr;
    gap: clamp(20px, 5vw, 40px);
  }
}
</style>
