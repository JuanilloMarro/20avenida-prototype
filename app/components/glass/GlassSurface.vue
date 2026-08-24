<script setup>
/**
 * <GlassSurface> — la única superficie de vidrio del sistema.
 *
 * UN material: «Velo negro». Los valores viven en `assets/css/glass.css` y de
 * ahí los lee la lente. Ver docs/01-velo-negro.md.
 *
 * VARIANTES. Hubo un tiempo sin ninguna, y la nota decía que un prop de velo o
 * de polaridad rompería la estandarización. Sigue siendo verdad de un prop
 * LIBRE — pero lo que apareció en su lugar fue peor: dos paneles repitiendo a
 * mano los mismos tres tokens en su CSS scoped, sin nada que los mantuviera
 * sincronizados. Eso no es un material estandarizado, es uno copiado.
 *
 * Así que el prop existe pero es un conjunto CERRADO, validado aquí y definido
 * en `glass.css`:
 *
 *   panel   superficie a pantalla completa — menú, buscador
 *   light   velo BLANCO y contenido a tinta sólida — sobre fondo oscuro
 *   sheet   de LISTA: sin lente ni marco — piezas que se repiten
 *   dropdown  `panel` con esquina — el desplegable de escritorio
 *
 * Se combinan: `variant="panel light"`. Y la regla para añadir una nueva: sólo
 * si VARIOS tokens tienen que moverse juntos y quedarse sincronizados. Si sólo
 * cambia el radio, eso es el prop `radius`.
 *
 * Lo que este componente NO puede hacer cumplir solo, y hay que respetar:
 *   · El vidrio se anida hasta DOS niveles: panel → ficha. Nunca tres.
 *     (Esto SUSTITUYE a la vieja regla «nada de vidrio sobre vidrio», que se
 *     retiró a propósito: las fichas de vidrio dentro del menú son el efecto
 *     buscado, no un descuido.)
 *   · A partir de la tercera instancia repetida en pantalla —listas, grillas,
 *     un panal de celdas— se usa `sheet`, que conserva el material y quita la
 *     lente, que es lo único que escala mal.
 *   · La acción principal no es de vidrio. El contraste AA de «Añadir a la
 *     bolsa» no puede depender de la foto que haya detrás ese día.
 *   · Coste: cada instancia es una capa compuesta con backdrop-filter, y con
 *     lente además un filtro SVG. Con nav + barra + ficha (≈9 instancias con
 *     lente) va fluido. Por encima, `sheet`.
 *
 * Con velo 0.38 este material tapa bastante — deja pasar el 53% del fondo:
 * sirve para barras y paneles sobre foto, no para dejar ver el producto. Para
 * eso está `light`, con velo blanco al 0.24 y tinta sólida.
 */
import { ref, computed } from 'vue'
import { useGlassLens } from '~/composables/useGlassLens'
import { VARIANTES_GLASS } from '~/lib/glass-variants'

const props = defineProps({
  /** radio en px. 0 = usa el token --lg-r (18). 999 = píldora */
  radius: { type: Number, default: 0 },
  tag: { type: String, default: 'div' },
  /**
   * Una o varias variantes separadas por espacio, del conjunto cerrado de
   * `VARIANTES_GLASS`. Un nombre que no esté en la lista avisa en desarrollo en
   * vez de fallar en silencio, que es como se cuelan los materiales nuevos.
   *
   * La lista vive en `~/lib/glass-variants`: `defineProps()` se iza fuera del
   * `setup()` y no puede leer una constante declarada en este bloque, pero un
   * IMPORT sí — que es justo lo que hace falta para no tenerla escrita a mano
   * dentro de una expresión.
   */
  variant: {
    type: String,
    default: '',
    validator: v => v.split(/\s+/).filter(Boolean)
      .every(n => VARIANTES_GLASS.includes(n)),
  },
})

const variantClasses = computed(() =>
  props.variant.split(/\s+/).filter(Boolean).map(n => 'av-glass--' + n))

const el = ref(null)
/* `sync` sale fuera a proposito. Los tres observadores de la lente cubren el
   caso normal, pero NINGUNO es fiable para un panel que se muestra con
   `v-show`: el de tamano y el de interseccion entregan dentro del ciclo de
   render, y el de mutaciones depende de que el `style` cambie de una forma
   concreta. Quien abre el panel SI sabe el momento exacto, asi que se le da la
   manija: `panel.value.sync()` justo despues de mostrarlo.

   Sin esto la lente no aparecia hasta que algo redimensionara la ventana, y el
   panel se veia como cristal limpio — velo y desenfoque, sin refraccion. */
const { sync } = useGlassLens(el)

defineExpose({ sync })
</script>

<template>
  <component
    :is="tag"
    ref="el"
    class="av-glass"
    :class="variantClasses"
    :style="radius ? { '--lg-r': radius + 'px' } : null"
  >
    <span class="av-glass__back" aria-hidden="true" />
    <span class="av-glass__veil" aria-hidden="true" />
    <span class="av-glass__spec" aria-hidden="true" />
    <span class="av-glass__body"><slot /></span>
  </component>
</template>
