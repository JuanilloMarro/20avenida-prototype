# 00 — Arquitectura del prototipo

Nuxt 4 · Vue 3.5 · Pinia · Tailwind 4 · shadcn-vue.
Este documento es el que hay que leer antes de escribir el primer componente.

---

## 1. Un material, y una sola fuente por cosa

**El material no se toca.** «Velo negro» es uno y vale para todo:
`docs/01-velo-negro.md`. No hay prop de material, ni de velo, ni de polaridad.
Si algo no se lee sobre el vidrio, lo que se cambia es lo que hay debajo o lo
que hay encima — nunca el vidrio.

| Qué | Dónde | Quién lo consume |
|---|---|---|
| **El material** | `app/assets/css/glass.css` | la lente lo lee del CSS computado |
| Marca, tipografía, medidas | `app/assets/css/tokens.css` | todo |
| Los fondos del escenario | `app/assets/js/backgrounds.js` | el CSS del escenario |
| Los colorways de producto | `app/assets/js/colorways.js` | `<ProductShowcase>` |
| El puente a Figma | `app/assets/js/materials.js` | sólo eso |

Que el material viva en CSS y no en un objeto de JS es deliberado:
`useGlassLens` lee `--lg-edge`, `--lg-scale` y `--lg-r` con `getComputedStyle`,
así que lo que se ve en devtools **es** la fuente de verdad. Un objeto de JS
paralelo sería una segunda copia esperando a desincronizarse.

`materials.js` sólo conserva `toFigmaGlass()` / `toFigmaShadow()`, que el CSS no
puede generar. `sat` y `bri` no cruzan a Figma — no expone saturate/brightness
sobre el backdrop, y es la única pérdida real del salto.

---

## 2. Estructura

```
app/
├─ assets/
│  ├─ css/  glass.css ← EL MATERIAL · tokens.css · main.css
│  └─ js/   backgrounds.js · colorways.js · materials.js (puente Figma)
├─ components/
│  ├─ glass/   GlassSurface.vue       ← la única superficie de vidrio
│  ├─ brand/   BrandMark.vue
│  ├─ nav/     AppNav.vue
│  ├─ product/ ProductShowcase.vue
│  ├─ dev/     DevPanel.vue           ← solo en dev
│  └─ ui/                             ← shadcn-vue, generado por CLI
├─ composables/
│     useGlassLens.js       la lente: mapa de desplazamiento + topes
│     useGlassLight.js      la luz sigue al ratón, por elemento
│     useScrollSequence.js  el scrollover del producto
│     useFitText.js         el texto gigante llena su caja
├─ layouts/      default.vue          ← el escenario
├─ pages/        index.vue · frame.vue
└─ stores/       useThemeStore.js     ← fondo y grano. Nada del material.
docs/
scripts/     cutout-bg.py             ← recorte de fondo de fotos de producto
resources/                            ← originales sin procesar
public/brand/ · public/products/
```

**Los componentes se nombran por su fichero, no por su carpeta.**
`components/nav/AppNav.vue` → `<AppNav>`, no `<NavAppNav>`
(`components: [{ path: '~/components', pathPrefix: false }]`).
Los stores se auto-importan vía `imports.dirs: ['stores']`.

---

## 3. El escenario

`layouts/default.vue` pinta, en este orden y no en otro:

1. la rampa de fondo
2. el grano — **encima** de la rampa, **debajo** del vidrio. Si va encima, el
   `backdrop-filter` no lo recoge; y sobre `negro` el grano es lo único que la
   lente tiene que refractar
3. el contenido
4. la capa que flota: nav, drawers, toasts

La barra es `fixed` y no ocupa sitio en el flujo: el contenido deja libre
`--av-nav-space` arriba.

### Dos reglas de CSS que costaron tiempo, y que hay que respetar

**`overflow-x: clip`, nunca `hidden`.** `overflow-x: hidden` implica
`overflow-y: auto`, y eso convierte al escenario en contenedor de scroll:
cualquier `position: sticky` de dentro pasa a pegarse a **ese** elemento —que no
scrollea— en vez de al viewport, y deja de pegarse del todo. Rompió el
scrollover entero. `clip` recorta igual y no crea contenedor de scroll.

**`.stage__main` va sin `z-index`.** Un `z-index` ahí crea un contexto de
apilado y deja el degradado del escenario fuera del backdrop de sus hijos; con
eso el `mix-blend-mode: screen` del letrero se queda sin nada contra lo que
mezclar y la foto vuelve a enseñar su caja negra.

---

## 4. shadcn-vue

Instalado y configurado (`components.json`, base zinc, `@/lib/utils`), sin
componentes generados todavía:

```bash
npx shadcn-vue@latest add button dialog dropdown-menu
```

Van a `app/components/ui/` y se registran sin prefijo.

**Cómo conviven con el vidrio:** shadcn va **dentro** del slot de
`<GlassSurface>`, nunca al revés. Al `DropdownMenuContent` se le quita el
`bg-popover` y se envuelve. Al `Button` primario **no se le toca**: es sólido
por decisión.

---

## 5. Accesibilidad — lo que ya está cableado

- `prefers-reduced-transparency` → sin `backdrop-filter` y el velo pasa a
  `#14141A` sólido. Mismo radio, misma sombra, **nada de layout se mueve**.
- `prefers-reduced-motion` → sin transiciones y la luz deja de seguir al ratón.
- Safari y Firefox no soportan `backdrop-filter: url()`. `useGlassLens` lo
  detecta y ni siquiera pone la clase `is-lensed`: se queda en blur + saturate +
  specular. Se pierde la lente, el material se mantiene, no hay salto de layout.

Lo que **falta**: medir contraste real (APCA) sobre los tres fondos, y foco
visible en los interactivos de vidrio.

---

## 6. Arrancar

```bash
npm install
npm run dev
```

- `/` — la landing con el scrollover
- `/frame` — el showcase a 1440×1024 exactos, sin barra, para capturas y Figma.
  `?v=samba-night` cambia el colorway · `?f=3` cambia el frame

El engranaje de abajo a la derecha abre el panel de revisión (solo en dev):
fondo y grano. Ya no hay conmutadores de material porque ya no hay nada que
conmutar.
