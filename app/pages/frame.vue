<script setup>
/**
 * /frame — el showcase a la medida de diseño EXACTA, 1440×1024, sin barra.
 *
 * Para qué: capturas para el cliente y para llevar el frame a Figma sin que el
 * navegador reencuadre nada.
 *
 *   ?v=samba-night   cambia el colorway
 *   ?f=3             qué frame de la secuencia se pinta (1..6)
 */
import { COLORWAY_IDS, DEFAULT_COLORWAY } from '~/assets/js/colorways'

definePageMeta({ layout: false })

const route = useRoute()
const variant = computed(() => {
  const v = String(route.query.v || '')
  return COLORWAY_IDS.includes(v) ? v : DEFAULT_COLORWAY
})

const still = computed(() => Math.max(0, (parseInt(route.query.f, 10) || 1) - 1))
</script>

<template>
  <div class="frame">
    <ProductShowcase :variant="variant" frame="fixed" :still="still" />
  </div>
</template>

<style scoped>
.frame {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background: #0A0A0C;
  padding: 24px;
  overflow: auto;
}
</style>
