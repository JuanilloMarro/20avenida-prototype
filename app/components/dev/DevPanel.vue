<script setup>
/**
 * Panel de revisión — solo en dev.
 *
 * Lo que queda tras cerrar el material: fondo y grano. Ya no hay conmutadores
 * de velo ni de glifo porque ya no hay nada que conmutar — el material es uno.
 * Sirve para contestar «¿y sobre el amanecer cómo se ve?» en una llamada con el
 * cliente sin recompilar.
 */
const theme = useThemeStore()
const open = ref(false)
</script>

<template>
  <div class="dev">
    <GlassSurface v-if="open" class="dev__panel">
      <div class="dev__body">
        <div class="dev__grp">
          <p class="dev__t">Fondo</p>
          <div class="dev__row">
            <button
              v-for="b in theme.backgrounds"
              :key="b.id"
              type="button"
              :class="{ 'is-on': b.id === theme.backgroundId }"
              @click="theme.setBackground(b.id)"
            >{{ b.name }}</button>
          </div>
        </div>

        <div class="dev__grp">
          <p class="dev__t">Grano · {{ theme.grain }}%</p>
          <input v-model.number="theme.grain" type="range" min="0" max="12" step="1">
        </div>
      </div>
    </GlassSurface>

    <button type="button" class="dev__gear" @click="open = !open">
      {{ open ? '×' : '⚙' }}
    </button>
  </div>
</template>

<style scoped>
.dev { position: fixed; right: 16px; bottom: 16px; z-index: 60; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.dev__panel { width: 236px; }
.dev__body { padding: 14px 15px; display: flex; flex-direction: column; gap: 13px; color: var(--av-on-glass-strong); }
.dev__t { font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; opacity: .6; margin: 0 0 7px; }
.dev__row { display: flex; flex-wrap: wrap; gap: 5px; }
.dev__row button {
  padding: 5px 9px; border-radius: 7px; font-size: 10.5px; border: 0;
  background: var(--av-on-glass-hover); color: var(--av-on-glass);
}
.dev__row button.is-on { background: var(--av-solid-bg); color: var(--av-solid-fg); font-weight: 600; }
.dev__body input[type=range] { width: 100%; accent-color: var(--av-y-400); }
.dev__gear {
  width: 38px; height: 38px; border-radius: 50%; border: 0;
  background: var(--av-solid-bg); color: var(--av-solid-fg); font-size: 15px;
  box-shadow: 0 6px 20px rgba(0,0,0,.35);
}
</style>
