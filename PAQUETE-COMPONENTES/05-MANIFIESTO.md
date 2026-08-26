# 05 · Manifiesto de archivos, dependencias y encaje con el backend

---

## 1 · Qué copiar, exactamente

> **El código viaja como CÓDIGO.** Estos documentos son el *por qué* — de dónde
> sale cada número, qué se probó y se descartó, y qué trampas ya costaron una
> vez. No contienen los componentes ni podrían: son 4 958 líneas de código
> frente a ~2 600 de prosa. **Nadie tiene que reescribir nada desde cero.**

### Cómo se arma la entrega

```
node PAQUETE-COMPONENTES/empaquetar.mjs
```

Copia todo lo de las tablas de abajo a `PAQUETE-COMPONENTES/codigo/`, con su
estructura de carpetas intacta. A partir de ahí **la carpeta del paquete es
autosuficiente**: se entrega entera y lleva dentro los documentos y el código.

`codigo/` está en `.gitignore` a propósito. Guardar una segunda copia de cada
componente dentro del paquete garantiza deriva en cuanto alguien toca una de las
dos; generarla justo antes de entregar no puede derivar nunca. **La única fuente
de verdad sigue siendo `app/`.**

Si el script imprime `FALTA`, es que este manifiesto se ha quedado desfasado
respecto al repo — y sale con código de error para que se note.

### Núcleo — el material (doc 01)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/assets/css/glass.css` | 511 | los arreglos del doc 01 ya están dentro |
| `app/components/glass/GlassSurface.vue` | 101 | |
| `app/lib/glass-variants.js` | 26 | la lista cerrada de variantes |
| `app/composables/useGlassLens.js` | 298 | el corte de `--lg-lens-on` ya está |

### Escenario (doc 04)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/assets/css/tokens.css` | 235 | extraer sólo lo que aplique; ver §2 |
| `app/assets/js/backgrounds.js` | 85 | 4 rampas + grano |
| `app/stores/useThemeStore.js` | 41 | sólo si se quiere más de un fondo |
| `app/components/brand/BrandMark.vue` | 86 | sin halo — ver doc 04 §4 |
| `public/brand/letrero-20av-cut.webp` | — | el asset de BrandMark |
| `app/layouts/default.vue` | 101 | **el orden de pintado**, que no es negociable |

> `default.vue` **faltaba en este manifiesto** y es el archivo que decide el
> orden rampa → grano → contenido → capa flotante. Sin él el material se ve
> mal aunque todos sus tokens estén bien, que es el síntoma que el doc 04 §1
> manda comprobar antes que ningún otro. Además es donde se monta `<AppNav>` y
> `<SiteFooter>`.

### Navegación (doc 02)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/nav/AppNav.vue` | 2031 | la pieza grande |

### Producto — showcase (doc 03)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/product/ProductShowcase.vue` | 612 | |
| `app/composables/useScrollSequence.js` | 65 | |
| `app/composables/useFitText.js` | 119 | **compartido con el acordeón y el rollo**; el 4º argumento —tope de ALTO— es nuevo, ver doc 03 §5 |
| `app/assets/js/colorways.js` | 459 | los datos de producto — **showcase y acordeón**. El rollo y el díptico ya NO lo usan: leen `sneakers.js` |
| `public/products/mind001/*.webp` | 6 archivos | **la secuencia del escaparate** — caja unión 1160×584 |
| `public/products/samba/*.webp` | 8 archivos | ya recortados; siguen para `brands.js` y `/frame` |
| `scripts/build-mind001.py` | 157 | arma la secuencia del Mind desde `resources/` |

### Producto — acordeón (doc 06)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/product/ProductAccordion.vue` | 328 | el reparto y el estado |
| `app/components/product/ProductAccordionPanel.vue` | 1174 | el recorte y el contenido |
| `public/products/nb9060/*.webp` | 4 archivos | **las cuatro del acordeón** — `sea-salt`, `mushroom`, `dark-mushroom`, `angora` |
| `scripts/build-nb9060.py` | 124 | las arma desde `resources/sneakers sin fondo/A1..A4.png` |

No añade **ninguna** dependencia nueva: reutiliza `colorways.js`, `useFitText.js`
y `GlassSurface`, que ya vienen por los bloques anteriores. Su contrato completo
está en el doc 06 §14.

### Producto — panal (doc 07)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/product/ProductHoneycomb.vue` | 448 | |
| `public/products/panel/*.webp` | 26 archivos | caja unión 182×134 |

Usa además el grano de `assets/js/backgrounds.js`, que ya viene con el escenario
(doc 04). El fondo es **negro sólido `#050506`** — la primera parada de la rampa
`negro`, no un negro inventado.

⚠️ **El filo del material no funciona sobre un polígono**: se dibuja con una
máscara sobre el `border-radius`, así que con `clip-path` queda un anillo
rectangular cortado en diagonal. El panal lo REPRODUCE sobre el hexágono con los
mismos valores leídos del material (`--lg-spec`, `--lg-ang`, `--lg-elev`, `--lip`
y las once paradas). Verificado: el degradado que compone la celda es idéntico al
de la barra, parada por parada. Si algún día el material sabe dibujar filos no
rectangulares, esto se borra y se enciende `--lg-frame`.

Depende de `GlassSurface` con la variante **`sheet`**, que es obligatoria aquí:
**34 celdas** de vidrio contra un presupuesto de ≈9 con lente. Los 26 recortes
se reparten entre las 34 celdas — ocho repetidos, cosa de prototipo.

### Producto — rollo (doc 08)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/product/ProductReel.vue` | 1821 | el carrusel y su ficha |
| `app/assets/js/sneakers.js` | 245 | **el catálogo del rollo** — 14 zapatos de 4 marcas. Las 4 New Balance IMPORTAN su entrada de `colorways.js` y sólo le cambian el `frames` |
| `public/products/sneakers/*.webp` | 14 archivos | caja unión 1160×599 — **compartidas con el díptico** |
| `scripts/build-sneakers.py` | 146 | las arma; normaliza por LARGO, no por alto |

No añade ninguna dependencia nueva: reutiliza `colorways.js`, `useFitText`,
`backgrounds.js` y `GlassSurface`. Su contrato está en el doc 08 §8.

⚠️ **Comparte los assets del acordeón a propósito** — los cinco puestos del
rollo salen de los cuatro Jordan más `jordan-royal`, que es un PLACEHOLDER que
reutiliza la foto de `jordan-pine` con id propio. Si se copia el rollo sin el
acordeón, hay que traerse `public/products/jordan/` igualmente.

### Producto — díptico (doc 09)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/product/ProductDiptych.vue` | 870 | lámina + carrusel de hexágonos |
| `public/products/diptico/` | 1 archivo | `columna.jpg` — la lámina del díptico |
| — | — | el catálogo (`sneakers.js` y sus 14 recortes) **ya viene con el rollo**; no se copia dos veces |

Reproduce el hexágono y el filo del panal (doc 07 §3 y §7) sin compartir
código con él: son dos piezas distintas que llegaron a la misma solución. Si
alguna vez se unifican, es aquí.

**Las celdas se distinguen por la EXTENSIÓN del archivo**, no por un prop: `.jpg`
llena el hexágono a sangre, `.png` flota sobre el material. Copiar los assets
cambiando el formato rompe el componente en silencio.

### El pie (doc 10)

| Archivo | Líneas | Notas |
|---|---|---|
| `app/components/site/SiteFooter.vue` | 414 | **no usa el material** |
| `app/assets/js/brands.js` | 59 | el mapa de marcas |

`brands.js` es hoy dependencia **sólo** del pie. Se escribió para un rollo de
marcas que después se quitó, y si alguien lo borra creyendo que quedó huérfano,
la tercera columna del pie se queda vacía.

El pie va en el LAYOUT y no en la página — un `<footer>` dentro de `<main>`
deja de ser el landmark `contentinfo`. Ver doc 10 §1.

### NO copiar

| Archivo | Por qué |
|---|---|
| `app/components/dev/DevPanel.vue` | herramienta de desarrollo del prototipo |
| `app/pages/frame.vue` | ruta de capturas para Figma; útil sólo si se sigue diseñando |
| `app/assets/js/materials.js` | tabla de referencia, no la consume nadie en runtime |
| `app/pages/index.vue` | es el banco de pruebas del prototipo, no una landing real. Mirar sólo cómo monta los componentes — **y el ORDEN**, que está razonado en sus comentarios: escaparate · acordeón · rollo · panal · díptico |
| `docs/*` | 2 649 líneas de bitácora del prototipo. **Este paquete las sustituye.** |
| `public/products/jordan/*.webp` | 4 recortes de Air Jordan. **Ya no los usa nadie**: el acordeón pasó a las New Balance y el rollo a `sneakers/`. Se quedan en el prototipo por si vuelven, pero no viajan. |

---

## 2 · El grafo de dependencias

```
tokens.css
    ↑                                ↑
    │ 5 tokens de contenido          │ --av-nav-space
    │ (--av-ink, --av-on-glass…)     │ (con fallback: 87px)
    │                                │
glass.css ───────► GlassSurface.vue ─────► useGlassLens.js
                          ↑    ↑                 │
              ┌───────────┘    └──────┐          └─ vue
              │                        │
         AppNav.vue             ProductAccordion.vue
              │                        └─ ProductAccordionPanel.vue
              ├─ BrandMark.vue                ├─ colorways.js
              │     └─ public/brand/*.webp     ├─ useFitText.js
              └─ lucide-vue-next               ├─ lucide-vue-next
                                             └─ public/products/jordan/*.webp

ProductShowcase.vue ──┬─ colorways.js ─── public/products/samba/*.webp
                      ├─ useScrollSequence.js
                      └─ useFitText.js
```

**La dirección es limpia y en un solo sentido:** `glass.css → tokens.css`, nunca al revés. Verificado — `tokens.css` no referencia ningún `--lg-*`.

**`ProductShowcase` no toca el material.** Se puede adoptar antes o después, sin orden.

**`ProductAccordion` sí lo toca** — sus controles son vidrio — así que va después
del material. Aparte de eso no añade nada nuevo: comparte `colorways.js` y
`useFitText.js` con el showcase, y del anfitrión sólo pide `--av-nav-space`, que
lleva fallback para poder montarse sin `tokens.css`. Contrato completo en el
doc 06 §14.

### Al extraer `tokens.css`

Llevarse **sólo**:
- los cinco `--av-on-glass-*` / `--av-ink` que `glass.css` consume
- la escala de marca, si se usa el amarillo
- las medidas de nav, si se lleva `AppNav`

Dejar fuera lo que sea específico del prototipo. Lo ideal es partirlo en `glass-tokens.css` (lo que el material necesita) y el resto.

---

## 3 · Dependencias de paquete

### Las que hacen falta de verdad

| Paquete | Para qué | Nota |
|---|---|---|
| `vue` ^3.5 | — | ya está |
| `lucide-vue-next` | iconos de `AppNav` | ⚠️ el prototipo usa `^1.0.0`, la referencia `^0.575.0`. **Major distinto** — verificar nombres de iconos |
| `@vueuse/core` | `useMediaQuery` para el arreglo del doc 01 §6 | ya está en la referencia |

### Lo que NO hace falta

El material **no depende de Tailwind, ni de shadcn, ni de Pinia**. Son 431 líneas de CSS con custom properties y un composable que sólo importa de `vue`. Se puede adoptar en cualquier proyecto Vue 3.

`useThemeStore` sí usa Pinia, pero es opcional.

### Iconos usados por `AppNav`

```
House · Store · Percent · Sparkles · Info · User
ShoppingBag · Heart · MoreHorizontal · Search · X
ChevronDown · ChevronRight · ArrowRight
Footprints · Shirt · Package
```

---

## 4 · Orden de import del CSS

Crítico. En el archivo de entrada:

```css
@import "tailwindcss";
@import "tw-animate-css";      /* si se usa */
@import "./tokens.css";        /* ← ANTES */
@import "./glass.css";         /* ← DESPUÉS */
```

Si se adopta `@nuxt/ui`, **verificar el orden de `@layer`**: el material define reglas en el ámbito global (`.av-glass`, `.av-glyph`) y una capa de UI cargada después podría pisarlas.

---

## 5 · Decisiones de configuración para el proyecto nuevo

`frontend/inumbia-web` es la **referencia**, no el destino. Estas son las decisiones a tomar de cero.

| Decisión | La referencia hace | Recomendación |
|---|---|---|
| Auto-import de componentes | **desactivado** (`components: { dirs: [] }`) | **Activarlo** con `pathPrefix: false`, como el prototipo. El motivo del `dirs: []` era evitar conflictos con `@nuxt/ui`; en proyecto nuevo se puede elegir no tener ese conflicto. Si se deja desactivado, **todo uso de `GlassSurface` necesita import explícito**. |
| Tema base | claro (shadcn neutral) | **Oscuro.** El Velo Negro está calibrado para flotar sobre oscuro; sus tokens de contenido lo asumen. |
| `@nuxt/ui` | v4 presente | **Opcional.** Si no se adopta, un conflicto menos. |
| Convención de estilo | Tailwind-first (157/174 componentes sin `<style>`) | **Mixto y explícito:** Tailwind para layout, `glass.css` + scoped para el material. 431 líneas de custom properties no se expresan en utilidades. |
| Empaquetado | — | **Nuxt Layer** (`extends: [...]`) si se quiere fuente única entre prototipo y e-commerce. Copiar los archivos también funciona, pero se pierde la sincronía. |

---

## 6 · Encaje con el backend

El liquid glass es **puramente de presentación** y no toca la capa de datos. Pero conviene conservar el patrón de la referencia, que ya funciona contra `inumbia-backend`.

### El patrón a copiar

```
Componente → store Pinia (setup style) → $api (plugin) → NestJS /public/*
```

- **`plugins/fetch.ts`** inyecta `$api` con `baseURL` y `Authorization: Bearer` desde cookie; en 401 hace `logout()` automático.
- **Stores setup**: `defineStore('x', () => {…})` con `queryParameters` reactivos.
- **Respuesta paginada** siempre:
  ```ts
  { results, total, limit, current_page, total_pages }
  ```
  definida en `core/commons/paginated-response.ts`, y desestructurada en el store como `const { results, ...metadata } = await $api(...)`.
- El backend expone **13 endpoints de sólo lectura** bajo `@Controller('public')`.

### Endpoints que alimentarían los componentes

| Componente | Prop | Endpoint |
|---|---|---|
| `AppNav` | `catalog` | `GET /public/products?search=` |
| `AppNav` | `filters` | `GET /public/filters` |
| `AppNav` | `bag` | `useCartStore()` |
| `ProductShowcase` | `variant` / colorway | `GET /public/products/:id` |

### El único trabajo de integración

El árbol de filtros usa **ids compuestos** (`sneakers-hombre-nike`) y las hojas navegan a `/tienda?f=<id>`, mientras el backend espera `queryParameters` **planos**.

Hay que definir el mapeo. Opciones:
- que `/public/filters` devuelva el árbol **ya con los parámetros** de cada hoja
- o una tabla de traducción en el frontend

Es trabajo de integración, no de diseño. **Ninguna de las dos afecta al componente**, que sólo emite el camino.

---

## 7 · Verificación final tras reconstruir

### Material
- [ ] El vidrio se ve sobre `negro` (si no: revisar el grano, doc 04 §1)
- [ ] Sobre `blanco` el vidrio casi desaparece — es el control, debe pasar
- [ ] Los botones redondos **no salen apagados** (si lo hacen: el perfil del especular, doc 01 §3)
- [ ] La deformación es **simétrica en los cuatro bordes** (si no: falta el `feFlood`, doc 01 §9)
- [ ] Ninguna pieza apunta a un `<filter>` vacío
- [ ] Safari iOS: el fallback de blur se ve aceptable

### AppNav
- [ ] El menú **abre con deformación a la primera**, sin redimensionar (si no: es `v-if`, regla R5)
- [ ] Escritorio ≥1280 y móvil ≤1279 muestran disposiciones distintas
- [ ] Todo el texto a 13.5/500, jerarquía por color
- [ ] Cero versales en toda la aplicación

### ProductShowcase
- [ ] El scrollover es reversible: subir gira el zapato al revés
- [ ] Ningún frame se sale por arriba en pantalla baja y ancha
- [ ] El texto gigante llena el ancho con cualquier palabra
- [ ] `/frame` (si se lleva) mide 1440×1024 exactos

### Rendimiento
- [ ] Contar instancias de vidrio con lente en la vista más cargada
- [ ] Si hay grilla de producto con vidrio → **debe ser `sheet`**, no `panel`
