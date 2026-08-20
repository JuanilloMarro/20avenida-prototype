<script setup>
/**
 * Landing — estado inicial.
 *
 * Arriba, lo único que es diseño de verdad ahora mismo: <ProductShowcase> con
 * su scrollover.
 *
 * Debajo, el banco de pruebas anterior. Se queda SOLO para poder seguir
 * scrolleando y comprobar dos cosas que no se ven en una sola pantalla: que la
 * barra fija sigue visible hasta el final, y que el velo negro no se inmuta
 * aunque por debajo pase una sección clara y luego una oscura. Se borra en
 * cuanto la landing tenga contenido real.
 */
</script>

<template>
  <div class="home">
    <ProductShowcase />

    <!-- ── de aquí abajo, banco de pruebas del scroll ───────────────────── -->
    <div class="scrolltest">
      <section class="hero">
        <div class="hero__deck">
          <p class="hero__kicker">Temporada 2026</p>
          <h1 class="hero__title">La calle<br>tiene <em>número</em>.</h1>
          <p class="hero__lede">
            Un solo material para todo lo que flota: velo negro, lente de 26,
            luz que sigue al ratón desde el centro de cada pieza.
          </p>

          <div class="hero__row">
            <!-- La acción principal NO es de vidrio: el contraste AA de la
                 conversión no puede depender de la foto que haya detrás. -->
            <button type="button" class="btn btn--primary">Ver la colección</button>

            <GlassSurface :radius="999" class="btn btn--glass">
              <span class="dot" /> Lookbook
            </GlassSurface>
          </div>
        </div>

        <figure class="hero__shot">
          <img src="/brand/letrero-20av.webp" alt="Letrero de 20 Avenida">
        </figure>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home { flex: 1; display: flex; flex-direction: column; }

.scrolltest {
  display: flex;
  flex-direction: column;
  padding: clamp(60px, 12vh, 140px) 0 clamp(60px, 12vh, 140px);
}

/* ── hero ─────────────────────────────────────────────────────────────────── */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 32px;
  padding: 0 clamp(20px, 5vw, 76px);
  min-height: 62vh;
}

.hero__deck { display: flex; flex-direction: column; gap: 18px; max-width: 30rem; }
.hero__kicker { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; opacity: .55; }
.hero__title {
  font-size: clamp(38px, 5.4vw, 74px);
  font-weight: 800;
  letter-spacing: -.04em;
  line-height: .93;
  margin: 0;
}
.hero__title em { font-style: normal; color: var(--av-y-400); }
.hero__lede { font-size: 14px; line-height: 1.6; opacity: .68; max-width: 26rem; }

.hero__row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 6px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 26px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -.01em;
  border: 0;
  border-radius: 999px;
}
.btn--primary { background: var(--av-solid-bg); color: var(--av-solid-fg); }
.btn--glass { padding: 0; color: var(--av-on-glass-strong); }
.btn--glass :deep(.av-glass__body) { display: flex; align-items: center; gap: 10px; padding: 14px 26px; }

.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--av-y-400);
  box-shadow: 0 0 0 3px rgba(255, 214, 0, .25);
}

.hero__shot { margin: 0; justify-self: center; width: min(30vw, 340px); }
.hero__shot img {
  display: block;
  width: 100%;
  height: auto;
  /* aplastar los negros ANTES del blend: si no, los listones del rótulo no
     llegan a 0 y screen deja una caja rectangular sobre el fondo */
  filter: brightness(.8) contrast(2.2) saturate(1.15);
  mix-blend-mode: screen;
}
.is-light-bg .hero__shot img {
  mix-blend-mode: normal;
  filter: contrast(1.05);
  border-radius: 26px;
}

@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero__shot { width: min(60vw, 280px); }
}
</style>
