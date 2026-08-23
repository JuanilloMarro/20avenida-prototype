# 05 · Manifiesto de archivos, dependencias y encaje con el backend

---

## 1 · Qué copiar, exactamente

Rutas relativas a `20avenida-prototype/app/`.

### Núcleo — el material (doc 01)

| Archivo | Líneas | Notas |
|---|---|---|
| `assets/css/glass.css` | 431 | **aplicar antes los arreglos del doc 01 §5-§8** |
| `components/glass/GlassSurface.vue` | 92 | reescribir la cabecera (regla retirada) |
| `composables/useGlassLens.js` | 273 | añadir el corte de `--lg-lens-on` |

### Escenario (doc 04)

| Archivo | Líneas | Notas |
|---|---|---|
| `assets/css/tokens.css` | 96 | extraer sólo lo que aplique; ver §2 |
| `assets/js/backgrounds.js` | 85 | 4 rampas + grano |
| `stores/useThemeStore.js` | — | sólo si se quiere más de un fondo |
| `components/brand/BrandMark.vue` | 86 | + `public/brand/letrero-20av-cut.webp` |

### Navegación (doc 02)

| Archivo | Líneas | Notas |
|---|---|---|
| `components/nav/AppNav.vue` | 2000 | la pieza grande |

### Producto (doc 03)

| Archivo | Líneas | Notas |
|---|---|---|
| `components/product/ProductShowcase.vue` | 420 | |
| `composables/useScrollSequence.js` | 65 | |
| `composables/useFitText.js` | 45 | |
| `assets/js/colorways.js` | 91 | los datos del producto |
| `public/products/samba/*.webp` | 8 archivos | ya recortados |

### NO copiar

| Archivo | Por qué |
|---|---|
| `components/dev/DevPanel.vue` | herramienta de desarrollo del prototipo |
| `pages/frame.vue` | ruta de capturas para Figma; útil sólo si se sigue diseñando |
| `assets/js/materials.js` | tabla de referencia, no la consume nadie en runtime |
| `docs/*` | 2 649 líneas de bitácora del prototipo. **Este paquete las sustituye.** |

---

## 2 · El grafo de dependencias

```
tokens.css
    ↑
    │ (5 tokens: --av-ink, --av-on-glass, -strong, -hover, -hair)
    │
glass.css ──────────────► GlassSurface.vue ──────► useGlassLens.js
                                 ↑                        │
                                 │                        └─ vue (ref, onMounted…)
              ┌──────────────────┴──────────────────┐
         AppNav.vue                            (paneles futuros)
              │
              ├─ BrandMark.vue ─── public/brand/*.webp
              └─ lucide-vue-next

ProductShowcase.vue ──┬─ colorways.js ─── public/products/samba/*.webp
                      ├─ useScrollSequence.js
                      └─ useFitText.js
                                 └─ (independiente del material)
```

**La dirección es limpia y en un solo sentido:** `glass.css → tokens.css`, nunca al revés. Verificado — `tokens.css` no referencia ningún `--lg-*`.

**`ProductShowcase` no toca el material.** Se puede adoptar antes o después, sin orden.

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
