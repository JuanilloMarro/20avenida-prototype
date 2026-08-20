# 20 Avenida — prototipo

Prototipo del ecommerce. Nuxt 4 · Vue 3.5 · Pinia · Tailwind 4 · shadcn-vue.

```bash
npm install
npm run dev
```

Rutas:
- `/` — la landing con el scrollover del zapato
- `/frame` — el showcase a 1440×1024 exactos, para capturas y Figma
  (`?v=samba-night`, `?f=3`)

El engranaje de abajo a la derecha abre el panel de revisión (solo en dev):
fondo y grano.

## Las bases

Están en **[`docs/`](docs/README.md)** y no son opcionales: el prototipo existe
para asentarlas antes de que el cliente apruebe el diseño.

- [`docs/00-arquitectura.md`](docs/00-arquitectura.md) — stack, estructura, dónde vive cada valor
- [`docs/01-velo-negro.md`](docs/01-velo-negro.md) — **el material, único y cerrado**
- [`docs/10-componentes.md`](docs/10-componentes.md) — inventario
- [`docs/20-decisiones.md`](docs/20-decisiones.md) — lo que está abierto

Los documentos 02 y 03 son históricos: explican por qué el material es como es,
pero ya no describen el código.

**Las dos reglas:**

1. **Un material.** «Velo negro», y no cambia por nada — ni por el componente,
   ni por el fondo, ni por la sección que le pase por debajo. Vive en
   `app/assets/css/glass.css`.
2. **Un valor vive en un sitio.** Los colorways en
   `app/assets/js/colorways.js`; los fondos en `app/assets/js/backgrounds.js`.
