<script setup>
/**
 * El letrero de 20 Avenida.
 *
 * Lo que tenemos sigue siendo una FOTO del rótulo, no un asset de marca — pero
 * ya no hace falta ningún truco de blend para usarla.
 *
 * Antes iba con `mix-blend-mode: screen` para que el negro de la foto
 * desapareciera, y eso solo funcionaba **sobre fondo oscuro**: mientras la marca
 * vivía dentro de un panel de vidrio con velo negro, siempre lo tenía. Al
 * sacarla del panel dejó de tenerlo, y sobre el frame verde claro el screen la
 * borraba entera.
 *
 * La salida no fue otro truco sino recortar el fondo de verdad:
 * `scripts/cutout-bg.py --dark` inunda desde los bordes sobre lo oscuro. En esta
 * foto el histograma está partido en dos —la mediana del máximo de canal está en
 * 33 y el tercer cuartil en 253, y el borde no pasa de 59— así que la separación
 * es limpia y las contraformas de las letras se conservan.
 *
 * Queda el halo, que es el mismo recurso que usan los glifos del material: el
 * «20» es blanco y sobre un fondo claro necesita su propia sombra para
 * despegarse. Con eso la marca funciona sobre cualquier fondo sin que nada se
 * adapte a nada.
 *
 * PENDIENTE: el logo vectorial (D-01). Con un SVG esto son dos rellenos.
 */
const props = defineProps({
  /**
   * Alto en px. El ancho sale de la proporción del recorte.
   *
   * `null` por defecto A PROPÓSITO: sin él la marca no escribe nada y el alto
   * lo decide quien la coloca, atando `--av-mark-h` a su propio token. La barra
   * hace justo eso (`--av-mark-h: var(--av-nav-h)`), y así el alto de la barra
   * es UN número. Con un default numérico el estilo en línea ganaba siempre y
   * la marca se quedaba clavada mientras la barra cambiaba de alto.
   */
  size: { type: Number, default: null },
  /** Añade el wordmark tipográfico al lado. */
  wordmark: Boolean,
})

/* Sólo si se pide un alto concreto. Si no, no hay estilo en línea que pisar y
   manda el `--av-mark-h` que herede del contenedor. */
const style = computed(() => (props.size ? { '--av-mark-h': `${props.size}px` } : null))
</script>

<template>
  <span class="av-mark">
    <img
      src="/brand/letrero-20av-cut.webp"
      alt="20 Avenida"
      class="av-mark__img"
      :style="style"
    >
    <span v-if="wordmark" class="av-mark__word">20 <em>Avenida</em></span>
  </span>
</template>

<style scoped>
.av-mark { display: inline-flex; align-items: center; gap: 10px; }

.av-mark__img {
  display: block;
  /* el 36 es el suelo para quien la use suelta, sin contenedor que la ate */
  height: var(--av-mark-h, 36px);
  width: auto;
  object-fit: contain;
  /* SIN halo. Lo llevaba mientras la marca iba suelta sobre el fondo de la
     página, donde nada garantizaba el contraste. Dentro de su panel de vidrio
     el velo negro ya la despega de lo que pase por detrás, y la sombra sólo
     ensuciaba los filos del recorte.

     Y hay un motivo de material además del estético: `filter` crea un backdrop
     root, así que un halo aquí dejaría sin fondo que refractar a cualquier
     `backdrop-filter` que viniera por dentro. */
}

.av-mark__word {
  font-weight: 800;
  font-size: 15px;
  letter-spacing: var(--av-track);
  line-height: 1;
  color: var(--av-on-glass-strong);
}
.av-mark__word em { font-style: normal; color: var(--av-y-400); }
</style>
