<script setup>
/**
 * <GlassSurface> — la única superficie de vidrio del sistema.
 *
 * UN material: «Velo negro». No hay prop de material, ni de velo, ni de
 * polaridad, ni de sección. Si hiciera falta uno, el material dejaría de ser
 * estandarizado. Los valores viven en `assets/css/glass.css` y de ahí los lee
 * la lente. Ver docs/01-velo-negro.md.
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
import { ref } from 'vue'
import { useGlassLens } from '~/composables/useGlassLens'
import { useGlassLight } from '~/composables/useGlassLight'

defineProps({
  /** radio en px. 0 = usa el token --lg-r (18). 999 = píldora */
  radius: { type: Number, default: 0 },
  tag: { type: String, default: 'div' },
})

const el = ref(null)
useGlassLens(el)
useGlassLight(el)
</script>

<template>
  <component
    :is="tag"
    ref="el"
    class="av-glass"
    :style="radius ? { '--lg-r': radius + 'px' } : null"
  >
    <span class="av-glass__back" aria-hidden="true" />
    <span class="av-glass__veil" aria-hidden="true" />
    <span class="av-glass__spec" aria-hidden="true" />
    <span class="av-glass__body"><slot /></span>
  </component>
</template>
