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
 *   light   velo BLANCO y contenido a tinta — botones sobre fondo oscuro
 *
 * Se combinan: `variant="panel light"`. Y la regla para añadir una nueva: sólo
 * si VARIOS tokens tienen que moverse juntos y quedarse sincronizados. Si sólo
 * cambia el radio, eso es el prop `radius`.
 *
 * Lo que este componente NO puede hacer cumplir solo, y hay que respetar:
 *   · Nada de vidrio sobre vidrio. Lo que va encima se resuelve con relleno
 *     sólido o sólo tipografía. El ítem activo de una barra va sólido.
 *   · Nada de vidrio en la capa de contenido. Tarjetas de grilla, filas de
 *     tabla, ítems de lista: sólidos. El vidrio es de la capa que flota.
 *   · La acción principal no es de vidrio. El contraste AA de «Añadir a la
 *     bolsa» no puede depender de la foto que haya detrás ese día.
 *   · Coste: cada instancia es una capa compuesta con backdrop-filter. Con
 *     nav + barra + ficha (≈9 instancias) va fluido; nada de vidrio en una
 *     grilla larga de producto.
 *
 * Con velo 0.35 este material tapa bastante: sirve para barras y paneles sobre
 * foto, no para dejar ver el producto.
 */
import { ref, computed } from 'vue'
import { useGlassLens } from '~/composables/useGlassLens'

const props = defineProps({
  /** radio en px. 0 = usa el token --lg-r (18). 999 = píldora */
  radius: { type: Number, default: 0 },
  tag: { type: String, default: 'div' },
  /**
   * Una o varias variantes separadas por espacio. Conjunto cerrado — ver la
   * nota de arriba. Un nombre que no esté en la lista avisa en desarrollo en
   * vez de fallar en silencio, que es como se cuelan los materiales nuevos.
   *
   * La lista va INLINE y no en una constante de arriba: `defineProps()` se iza
   * fuera del `setup()`, así que no puede leer nada declarado en este bloque.
   */
  variant: {
    type: String,
    default: '',
    validator: v => v.split(/\s+/).filter(Boolean)
      .every(n => ['panel', 'light'].includes(n)),
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
