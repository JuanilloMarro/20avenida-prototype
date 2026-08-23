# Auditoría · Liquid Glass del prototipo → e-commerce nuevo

**Fecha:** 2026-08-22
**Alcance:** `prototype/20avenida-prototype` · `frontend/inumbia-web` · `backend/inumbia-backend`
**Naturaleza:** sólo lectura. No se modificó ningún archivo de los tres proyectos.

**Encuadre (corregido tras revisión):**
`frontend/inumbia-web` **no es el destino del port**. Es la **referencia** de cómo se implementó un frontend contra `inumbia-backend`. El e-commerce será un proyecto **nuevo** que adopta esa misma arquitectura. Por tanto este documento no lista "incompatibilidades a salvar", sino **convenciones a adoptar** y **decisiones a tomar de cero**.

---

## 0 · Veredicto

1. **El material está estandarizado.** Todo el liquid vive en 17 custom properties dentro de una sola clase (`.av-glass`), y la lente SVG las lee del CSS computado en vez de tener constantes propias. Es un sistema, no un efecto copiado.
2. **Es polimórfico y sirve como base.** Hay un conjunto cerrado de variantes (`panel`, `light`) validado en el componente. Añadir un panel que herede deformación, iluminación, velo, brillo y opacidad es **una línea**.
3. **Queda una fuga estructural** (§B.2) y **dos decisiones de calidad** (§B.1 y §B.3) que conviene resolver antes de que el patrón se multiplique por cada página de catálogo.
4. **La compatibilidad con la arquitectura de datos es buena y no requiere trabajo**: `AppNav` no sabe nada del catálogo, todo entra por props y sale por emits.

---

## 1 · Metodología

Se leyeron completos:

| Archivo | Líneas | Rol |
|---|---|---|
| `prototype/app/assets/css/glass.css` | 431 | el material entero |
| `prototype/app/assets/css/tokens.css` | 96 | marca, medidas, tokens de contenido |
| `prototype/app/components/glass/GlassSurface.vue` | 92 | el componente |
| `prototype/app/composables/useGlassLens.js` | 273 | la lente SVG |
| `prototype/app/components/nav/AppNav.vue` | 2000 | el único consumidor real |
| `frontend/inumbia-web/*` (config, stores, plugins) | — | convenciones de referencia |
| `backend/inumbia-backend/src/public/*`, `src/core/commons/*` | — | contrato de API |

Historial verificado: último commit `70f9217 Liquid Improvements and search bar` — 11 archivos, y **eliminó `useGlassLight.js`**.

---

## PARTE A · Anatomía del material actual

### A.1 · Las cuatro capas

```
z-3  .av-glass__body   el contenido (slot)
z-2  .av-glass__spec   filo especular + resplandor interior
z-1  .av-glass__veil   el velo (degradado a 135°)
z-0  .av-glass__back   backdrop-filter: lente + blur + saturate + brightness
```

La raíz aporta `position: relative`, `isolation: isolate`, `border-radius` y la sombra de elevación.

**Riesgo a vigilar en el proyecto nuevo:** `backdrop-filter` es sensible a la cadena de ancestros. Cualquier ancestro con `filter`, `opacity < 1`, `transform`, `mask` o `will-change` crea un *backdrop root* y deja la capa 0 sin nada que refractar. En `inumbia-web` esto abunda (`transition-all`, `hover:scale-105`, `group-hover`), así que si se copian esos patrones de layout hay que auditar dónde caen las piezas de vidrio.

### A.2 · El contrato de tokens (valores actuales)

Todo el material es esto. No hay ningún número de vidrio fuera de esta tabla.

| Token | Valor | Qué controla |
|---|---|---|
| `--lg-r` | `var(--lg-r-base)` = 18px | radio |
| `--lg-edge` | `26px` | grosor de la lente (banda que refracta) |
| `--lg-scale` | `82` | compresión del filo (se aplica en negativo) |
| `--lg-soft` | `0.30` | suavizado del mapa, en proporción a la lente |
| `--lg-aberr` | `0` | aberración cromática (sin implementar) |
| `--lg-blur` | `3px` | desenfoque del fondo |
| `--lg-sat` | `1.12` | saturación del fondo |
| `--lg-bri` | `0.85` | brillo del fondo |
| `--lg-veil` | `14, 14, 15` | color del velo (RGB sin `rgb()`) |
| `--lg-veil-a` | `0.45` | opacidad del velo |
| `--lg-veil-c` | `1` | cobertura: 0 = filos, 1 = uniforme |
| `--lg-spec` | `0.60` | multiplicador de TODO lo especular |
| `--lg-halo` | `0,0,0` | halo que despega el glifo |
| `--lg-glow` | `255,255,255` | brillo bajo el glifo |
| `--lg-elev` | `0.80` | elevación → sombra exterior |
| `--lg-frame` | `1` | 1 = con marco y sombra · 0 = a sangre |
| `--lg-ang` | `135deg` | dirección de la luz (**fijo**) |

Derivados (no se tocan): `--lip`, `--v1`, `--v2`, `--v3`.

**Cambio desde la sesión anterior:** `useGlassLight.js` fue **eliminado**; la luz ya no sigue al ratón. Es una **mejora neta de portabilidad** — se elimina un `pointermove` global.

### A.3 · El sistema de variantes

```vue
<GlassSurface variant="panel" />
<GlassSurface variant="panel light" />   <!-- se combinan -->
```

`GlassSurface.vue:52-58` valida contra una lista **cerrada** e inline. `glass.css` define cada variante como un bloque de overrides:

| Variante | Tokens que mueve |
|---|---|
| `panel` | `--lg-r: 0` · `--lg-edge: 80` · `--lg-scale: 50` · `--lg-soft: 0.30` · `--lg-frame: 0` |
| `light` | `--lg-veil: 255,255,255` · `--lg-veil-a: 0.16` · `--lg-bri: 1.10` · `--lg-spec: 0.72` · `--lg-halo`/`--lg-glow` invertidos · los cuatro `--av-on-glass-*` a tinta |

**La regla para crear una variante** (`glass.css:265-271`) es buena y hay que conservarla:

> Una variante existe cuando **varios** tokens tienen que moverse **juntos** y quedarse sincronizados. Si sólo cambia uno, eso es el prop `radius` o una línea de CSS.

**Por qué la herencia funciona sin maquinaria:** el material está escrito **entero** en custom properties, y las custom properties heredan por cascada. Una variante es un bloque de overrides sobre el mismo elemento; lo que no nombra, lo hereda. No hace falta ningún sistema de composición.

### A.4 · La lente (`useGlassLens.js`)

Genera por instancia un `<filter>` SVG y lo enchufa vía `backdrop-filter: url(#id)`.

```
feImage → feGaussianBlur → feFlood(#808080) → feComposite(over) → feDisplacementMap
```

**Los dos topes** (`useGlassLens.js:167-170`):
- **Tope 1:** `edge ≤ 34% del lado corto`
- **Tope 2:** `scale ≤ 3.2 × edge`

Consecuencia práctica: **en piezas pequeñas mandan los topes, no los tokens.** Pedir `--lg-edge: 80` en un botón de 44 px no hace nada. Hay que documentarlo para quien reutilice.

**Cuatro observadores**, cada uno tapando el agujero del anterior:

| Observador | Cubre |
|---|---|
| `ResizeObserver` | cambios de tamaño |
| `IntersectionObserver` | la pieza pasa a ser visible |
| `MutationObserver` (`style`, `class`) | `v-show`, que muta el `style` inline |
| `window.resize` | piezas que aparecen por **media query** |

Más `defineExpose({ sync })` para disparo manual.

**Invariante crítico** (`useGlassLens.js:206-212`): `--lg-lens` y la clase `is-lensed` **sólo se aplican con el filtro ya lleno.** Un `<filter>` vacío referenciado desde `backdrop-filter` no es inocuo: Chromium **tira la cadena entera** y se pierden lente, desenfoque, saturación y brillo.

---

## PARTE B · Hallazgos

### B.1 · ⚪ REGLA RETIRADA — vidrio sobre vidrio

**Decisión tomada: la prohibición se retira.** Las cards liquid dentro del menú son el comportamiento deseado — permiten fichas de vidrio sin perder el fondo, que es justo el efecto buscado.

Lo que queda es **auditar el coste**, porque el anidamiento no es gratis y ahora sí se va a usar a propósito.

#### Qué pasa exactamente al anidar

La ficha (`AppNav.vue:920`, `variant="light"`) vive dentro del panel de búsqueda (`variant="panel"`). El `backdrop-filter` de la ficha muestrea **el resultado ya compuesto del panel**, no la página. Los efectos se **acumulan**:

| Efecto | Panel | Ficha (`light`) | Resultado compuesto |
|---|---|---|---|
| Velo | negro `0.45` | blanco `0.16` | 16% blanco sobre (45% negro sobre página) |
| Brillo | `0.85` | `1.10` | `0.935` efectivo |
| Desenfoque | `3px` | `3px` | ≈ `4.2px` efectivo (√(3²+3²)) |
| Lente | sí | sí | desplazamiento sobre desplazamiento |

Fondo que llega al ojo a través de la ficha: `(1−0.45) × 0.85 × (1−0.16) × 1.10 ≈ **43%**` — más el aclarado del velo blanco.

**Conclusión visual:** el anidamiento funciona y da el efecto que se busca. No hay nada roto.

#### El coste, que sí importa

Cada instancia es una capa compuesta. En el prototipo hay 8 `<GlassSurface>` en `AppNav`. En un catálogo real:

- `stores/products.js` de la referencia usa `limit: 24`
- Si el `ProductCard` es vidrio → **24 capas compuestas por página**, más el nav
- La lente añade, por instancia: un `<filter>` SVG, un `data:` URI regenerado en cada cambio de tamaño, y 4 observadores

**Lo caro no es el vidrio: es la lente.** El velo y el desenfoque son baratos; el `feDisplacementMap` con su mapa por instancia no.

#### Propuesta — separar «vidrio» de «vidrio con lente»

Añadir un token `--lg-lens-on` que el composable consulte, y una variante que lo apague:

```css
/* en glass.css */
.av-glass{
  --lg-lens-on: 1;        /* la lente es el comportamiento por defecto */
}

/* ── SHEET ─ vidrio de lista: velo, brillo y filo, SIN lente ──────────
   Para piezas que se repiten: fichas de producto, filas de resultado.
   Conserva el material —se ve igual a tamaño de ficha, donde los topes
   dejaban la lente en casi nada— y quita lo único que escala mal. */
.av-glass--sheet{
  --lg-lens-on: 0;
  --lg-frame:   0;
}
```

```js
// en useGlassLens.js, dentro de sync(), tras leer `cs`:
if (token(cs, '--lg-lens-on', 1) === 0) return false
```

El `return false` ya está soportado por el diseño actual: sin lente la pieza se queda en el fallback de desenfoque, que es exactamente lo que se quiere.

**Por qué esto no degrada nada:** en una ficha de ~62 px de alto el tope 1 recorta la lente a `62 × 0.34 = 21 px` y el tope 2 la compresión a `67`. La deformación resultante es marginal a ese tamaño — se está pagando un filtro SVG por instancia por un efecto que casi no se ve.

**Regla que sustituye a la prohibición:**
> El vidrio puede anidarse **hasta dos niveles** (panel → ficha). Nunca tres.
> A partir de la tercera instancia repetida en pantalla, usar `sheet`.

#### Acción derivada

`GlassSurface.vue:24-31` **todavía declara la regla retirada** en su cabecera:
> · Nada de vidrio sobre vidrio.
> · Nada de vidrio en la capa de contenido. Tarjetas de grilla, filas de tabla, ítems de lista: sólidos.

Ese comentario queda obsoleto y hay que reescribirlo con la regla nueva. En una base de código que apuesta tanto por el comentario explicativo, dejarlo es peor que no tener comentario.

---

### B.2 · 🔴 ALTO — Fuga del sistema de variantes

`AppNav.vue:1976-1979`, dentro de la media query de escritorio:

```css
.av-search {
  --lg-r:     var(--lg-r-base);
  --lg-edge:  26px;
  --lg-scale: 82;
  --lg-frame: 1;
}
```

El desplegable de búsqueda de escritorio **deshace la variante `panel` reescribiendo cuatro tokens crudos** en el CSS scoped del componente.

El *por qué* está bien razonado en el comentario que lo acompaña (a 240 px de ancho, una lente de 80 se comería la pieza). El problema es la *forma*: es exactamente el anti-patrón que el sistema de variantes vino a eliminar, y que `GlassSurface.vue:9-12` describe como *"un material copiado, no estandarizado"*.

**Por qué importa más de lo que parece:** el día que `--lg-r-base` o la compresión base cambien, esta copia se queda atrás en silencio. Y es el patrón que cualquiera va a imitar la próxima vez que necesite ajustar una pieza.

#### Solución recomendada — variante `dropdown`

**1.** En `glass.css`, junto a las otras variantes:

```css
/* ── DROPDOWN ─ panel colgado de una barra ───────────────────────────
   El buscador de escritorio: la MISMA superficie que en teléfono, pero
   la geometría de `panel` es de piezas que se comen la pantalla y aquí
   la caja mide ~240 px, donde una lente de 80 se la comería entera.

   Vuelve a la base y recupera el marco, porque un desplegable sí tiene
   esquina y sí se despega de lo que hay debajo. */
.av-glass--dropdown{
  --lg-r:     var(--lg-r-base);
  --lg-edge:  26px;
  --lg-scale: 82;
  --lg-frame: 1;
}
```

**2.** Añadir `'dropdown'` a la lista cerrada en `GlassSurface.vue:56`.

**3.** En `AppNav.vue`, aplicar la variante condicionalmente al viewport en vez de deshacerla en CSS:

```vue
<GlassSurface :variant="esEscritorio ? 'dropdown' : 'panel'" ... />
```

con `esEscritorio` desde `useMediaQuery('(min-width: 901px)')` de `@vueuse/core` — que ya es dependencia en la referencia (`inumbia-web` lo usa para `watchDebounced`).

**Alternativa sin JS**, si se prefiere mantener la decisión en CSS: dejar el override pero **moverlo a `glass.css`** como parte de la definición de la variante:

```css
@media (min-width: 901px) {
  .av-glass--panel.av-glass--responsive { /* … los cuatro tokens … */ }
}
```

Lo importante no es cuál de las dos, sino que **los números del material vivan en `glass.css`** y no en el CSS scoped de un componente.

---

### B.3 · 🟡 MEDIO — `light` se queda; cómo hacerlo cumplir AA

**Decisión tomada: `light` se conserva.** Es lo que permite fichas de vidrio dentro del menú sin perder el fondo. La auditoría es sobre contraste, no sobre si usarlo.

#### El problema, con números

`glass.css:311-315` ya lo documenta, pero lo da por hipotético:

> Si algún día una pieza `light` lleva TEXTO y no sólo un glifo, esto se queda corto: la tinta al 72% daba **3.9:1**, por debajo del 4.5 de AA.

**Ese "algún día" es hoy:** la ficha del buscador usa `light` **y** lleva texto corrido — nombre, línea y precios.

Peor aún, el número real depende del fondo, que varía. En el **peor caso** (fondo negro bajo el panel), el velo blanco al 0.16 deja la superficie en una luminancia relativa de ≈`0.16`. Con tinta `#0E0E0F` (L ≈ `0.0044`):

```
contraste = (0.16 + 0.05) / (0.0044 + 0.05) = 3.9:1
```

Y con la tinta al **72%** en vez de sólida, el texto se aclara hacia la superficie y el contraste cae aún más — por debajo de 3:1 en el peor caso.

#### La tensión real

Subir `--lg-veil-a` arregla el contraste **pero mata justo lo que se quiere conservar**: ver el fondo a través de la ficha. Ir a `0.42` como sugiere el comentario deja pasar sólo el 58% del fondo.

#### Propuesta — subir la tinta, no el velo

La convención del 72% (`--av-on-glass`) se diseñó para **blanco sobre oscuro**, donde el 72% todavía tiene contraste de sobra. **En `light` la polaridad se invierte y esa convención deja de valer**: tinta oscura al 72% sobre una superficie clara-pero-no-blanca pierde muchísimo.

Cálculo del velo mínimo para AA con **tinta sólida**:

```
(L + 0.05) / (0.0044 + 0.05) ≥ 4.5
L ≥ 0.195
```

O sea: **velo blanco ≈ 0.20 basta si la tinta es sólida**, contra el `0.42` que haría falta con la tinta al 72%.

```css
.av-glass--light{
  /* … lo demás igual … */

  /* 0.24 y no 0.16: es el suelo que garantiza AA (4.5:1) contra tinta
     SÓLIDA incluso con fondo negro debajo — el peor caso. La cuenta:
     (L + 0.05) / (L_tinta + 0.05) ≥ 4.5 con L_tinta ≈ 0.0044 exige
     L ≥ 0.195; se deja margen. */
  --lg-veil-a: 0.24;

  /* Y la tinta SÓLIDA. El 72% de `--av-on-glass` es la convención de
     blanco-sobre-oscuro, donde sobra contraste. Aquí la polaridad está
     invertida y el mismo 72% aclara el texto hacia la superficie: con él
     harían falta 0.42 de velo — el doble — y se perdería el fondo, que es
     justo lo que esta variante existe para conservar. */
  --av-on-glass:        var(--av-ink);
  --av-on-glass-strong: var(--av-ink);
}
```

**Resultado:** AA garantizado en el peor caso, y el fondo sigue pasando al **76%** en vez del 58% que costaría la otra vía. Se conserva el efecto y se cumple el estándar.

#### Matiz sobre la jerarquía

Con la tinta sólida se pierde el escalón visual entre texto principal y secundario que hoy dan el 72% y el 100%. Para la ficha eso ya está resuelto por otra vía —el peso y el tamaño diferencian nombre, línea y precio— pero conviene tenerlo presente: **en `light`, la jerarquía se hace con peso, no con opacidad.**

#### Verificación pendiente

Los números de arriba son cálculo de luminancia, no medición sobre pantalla. Antes de fijarlos conviene **medir con un contrastímetro** sobre la ficha real con el fondo más claro y el más oscuro del catálogo.

---

### B.4 · 🟡 MEDIO — Regla CSS duplicada tres veces

`.av-glass__spec::after` está declarado **tres veces** en `glass.css` (≈154, ≈192, ≈228). Las dos primeras son idénticas; la tercera añade `padding` y el degradado.

No produce bug —la cascada resuelve— pero son ~20 líneas muertas en el archivo más delicado del sistema. Cualquiera que edite la primera creyendo que es la única se lleva una sorpresa.

---

### B.5 · 🟡 MEDIO — Comentario que contradice al código

`AppNav.vue:914-919`, justo encima de la ficha:

> `VIDRIO, y con el velo NEGRO de siempre — sin variante. Se probó 'light' … y se descartó mirándolo`

El código dos líneas más abajo dice `variant="light"`. El comentario documenta una decisión revertida.

---

### B.6 · 🟡 MEDIO — Acoplamiento manual entre `--lg-spec` base y variante

`glass.css:317-327` documenta que el `0.72` de `light` es "el 0.60 de la base con el mismo +20%", y que **no puede escribirse como `calc()`** porque sería referencia cíclica.

Correcto técnicamente, pero deja un número que hay que mover a mano cada vez que cambia la base.

**Solución al portar:** separar entrada de uso.

```css
.av-glass{
  --lg-spec-base: 0.60;
  --lg-spec: var(--lg-spec-base);
}
.av-glass--light{
  --lg-spec: calc(var(--lg-spec-base) * 1.2);   /* ya no es cíclico */
}
```

---

### B.7 · 🟢 BAJO — Efectos globales del composable

- `defsRoot()` inyecta un `<svg>` en `document.body` (una vez, compartido)
- `uid` crece sin límite mientras viva la página
- Cada instancia añade un listener de `window.resize`

Ninguno es bug; `onBeforeUnmount` limpia correctamente (`useGlassLens.js:264-270`). Pero con `sheet` (§B.1) el número de instancias con lente baja mucho, lo cual ayuda.

---

### B.8 · 🟢 BAJO — Fallback de Safari sin contrato explícito

Existe y es correcto (blur puro, detección en `useGlassLens.js:102-114` porque Safari acepta la gramática pero no la ejecuta). Pero no está expresado como contrato en ninguna parte. Para un e-commerce conviene decidir y documentar qué se ve en Safari iOS, que es una porción grande del tráfico móvil.

---

## PARTE C · Convenciones a adoptar en el proyecto nuevo

`inumbia-web` es la **referencia**, no el destino. Estas son las decisiones que conviene copiar y las que conviene tomar distinto.

### C.1 · Copiar tal cual — la capa de datos

Este patrón funciona y encaja con el backend existente:

```
Componente → store Pinia (setup style) → $api (plugin) → NestJS /public/*
```

- **`plugins/fetch.ts`**: inyecta `$api` con `baseURL` y `Authorization: Bearer` desde cookie; en 401 hace `logout()` automático. Copiar.
- **Stores setup** (`defineStore('x', () => {…})`) con `queryParameters` reactivos. Copiar.
- **Respuesta paginada** siempre `{ results, total, limit, current_page, total_pages }` (`core/commons/paginated-response.ts`), desestructurada como `const { results, ...metadata } = await $api(...)`. Ya está definido en el backend.
- **13 endpoints públicos** bajo `@Controller('public')` para la tienda.

### C.2 · Decidir de cero — y mi recomendación

| Decisión | `inumbia-web` hace | Recomendación para el nuevo |
|---|---|---|
| Auto-import de componentes | **desactivado** (`components: { dirs: [] }`) | **Activarlo** como el prototipo (`pathPrefix: false`). El motivo del `dirs: []` era *"evitar conflictos"* con `@nuxt/ui`; en un proyecto nuevo se puede elegir no tener ese conflicto. |
| Tema base | claro (shadcn neutral) | **Oscuro**, como el prototipo. El Velo Negro está calibrado para flotar sobre oscuro; su `--av-on-glass: rgba(255,255,255,.72)` lo asume. |
| `@nuxt/ui` | v4 presente | **Opcional.** Si se adopta, verificar el orden de `@layer` con `glass.css`. Si no, un conflicto menos. |
| Convención de estilo | Tailwind-first (157/174 sin `<style>`) | **Mixto y explícito**: Tailwind para layout, `glass.css` + scoped para el material. 431 líneas de custom properties no se expresan en utilidades. |
| Entrada CSS | `tailwind.css` | Un `main.css` que importe `tailwindcss`, `tokens.css` y `glass.css` en ese orden. |

### C.3 · Lo que sí es una dependencia real

`glass.css` consume **cinco tokens que no define**: `--av-ink`, `--av-on-glass`, `--av-on-glass-strong`, `--av-on-glass-hover`, `--av-on-glass-hair`. Viven en `tokens.css`.

La dirección es limpia (`glass.css → tokens.css`, nunca al revés — verificado), pero **portar `glass.css` sin ellos deja el material sin color de contenido.** Van juntos.

Al empaquetar conviene extraer **sólo esos cinco** a un `glass-tokens.css`, y dejar fuera marca, tipografía y medidas de nav, que son del prototipo y no del material.

---

## PARTE D · Cómo empaquetarlo

### D.1 · Recomendación: **Nuxt Layer**

```
inumbia-liquid-glass/
├── nuxt.config.ts
├── package.json
├── app/
│   ├── assets/css/
│   │   ├── glass.css           ← el material
│   │   └── glass-tokens.css    ← SÓLO los cinco --av-* que consume
│   ├── components/glass/
│   │   └── GlassSurface.vue
│   ├── composables/
│   │   ├── useGlassLens.js
│   │   └── useGlassPanel.js    ← nuevo, ver §E
│   └── lib/
│       └── glass-variants.js   ← la lista cerrada, importable
└── README.md                   ← el contrato de tokens y las reglas
```

En el e-commerce:
```ts
extends: ['../inumbia-liquid-glass']
```

**Por qué layer y no copiar-pegar:** una sola fuente de verdad entre prototipo, e-commerce y lo que venga; versionable; y el proyecto que extiende puede sobrescribir sin tocar el original.

### D.2 · Checklist

**Antes de portar**
- [ ] Implementar `sheet` y `--lg-lens-on` (§B.1)
- [ ] Convertir la fuga de `.av-search` en variante `dropdown` (§B.2)
- [ ] Subir tinta y velo de `light`, y **medir el contraste real** (§B.3)
- [ ] Reescribir la cabecera de `GlassSurface.vue` con la regla nueva de anidamiento
- [ ] Limpiar la regla triplicada (§B.4) y el comentario contradictorio (§B.5)
- [ ] Refactor `--lg-spec-base` (§B.6)

**Al portar**
- [ ] Extraer los cinco `--av-*` a `glass-tokens.css`
- [ ] Mover la lista de variantes a `glass-variants.js` e importarla en `defineProps`
- [ ] Orden de `@import` en el CSS de entrada
- [ ] Auditar la cadena de ancestros de cada instancia buscando `transform`/`filter`/`opacity`

**Después**
- [ ] Verificar el fallback en Safari iOS
- [ ] Medir con 24 fichas `sheet` en pantalla
- [ ] Probar `prefers-reduced-transparency` y `prefers-reduced-motion` (ya soportados)

---

## PARTE E · Cómo añadir un panel nuevo

### E.1 · Un panel igual a los que existen

```vue
<script setup>
import GlassSurface from '~/components/glass/GlassSurface.vue'
const panel = ref(null)
const abierto = ref(false)

function abrir() {
  abierto.value = true
  nextTick(() => panel.value?.sync())   // ← obligatorio con v-show
}
</script>

<template>
  <GlassSurface v-show="abierto" ref="panel" variant="panel" class="mi-panel">
    …
  </GlassSurface>
</template>
```

Hereda **todo**: deformación, iluminación, velo, brillo, opacidad, elevación, marco. Cero valores escritos.

**Las dos trampas:**

1. **`v-show`, no `v-if`.** Con `v-if` el panel se monta y se destruye en cada apertura, así que su `<filter>` se crea y se borra cada vez y el navegador no llega a resolver la referencia del `backdrop-filter`. El menú del prototipo estuvo sin deformación exactamente por esto.
2. **Llamar `sync()` al mostrarlo.** Un panel con `v-show` nace en `display: none`, donde `offsetWidth` es 0 y no hay nada que medir.

### E.2 · Propuesta — que las trampas dejen de ser conocimiento tribal

```js
// composables/useGlassPanel.js
export function useGlassPanel() {
  const panel = ref(null)
  const abierto = ref(false)

  function abrir() {
    abierto.value = true
    nextTick(() => panel.value?.sync())
  }
  function cerrar() { abierto.value = false }

  return { panel, abierto, abrir, cerrar }
}
```

Es la diferencia entre un sistema y un manual de instrucciones.

### E.3 · Un panel con otros valores

**Un token** → una línea de CSS:
```css
.mi-panel { --lg-blur: 6px; }
```

**Varios tokens sincronizados** → variante nueva: bloque en `glass.css` + nombre en la lista cerrada.

Con la lista movida a `glass-variants.js` (§D.1), ese segundo paso deja de ser fricción: `defineProps` sí puede leer un import, aunque no pueda leer una constante local del mismo bloque.

---

## PARTE F · Encaje con el backend

El liquid glass es **puramente de presentación** y no toca la capa de datos.

`AppNav.vue` **ya está diseñado para conectarse**: no sabe nada del catálogo, todo entra por props.

| Prop | Qué es | Endpoint que lo alimentaría |
|---|---|---|
| `catalog` | lo que el buscador encuentra | `GET /public/products?search=` |
| `filters` | el árbol de filtros | `GET /public/filters` |
| `items` | destinos de navegación | estático o `page-settings` |
| `suggestions` | sugerencias | PLACEHOLDER hoy |
| `bag` | contador de la bolsa | `useCartStore()` |

Emite `select`, `open`, `search`, `filter`. **El puente es un componente contenedor** que lea los stores y pase las props, sin tocar `AppNav`.

**Único desajuste a resolver:** el árbol de `filters` usa ids compuestos (`sneakers-hombre-nike`) y las hojas navegan a `/tienda?f=<id>`, mientras el backend espera `queryParameters` planos. Hay que definir el mapeo — trabajo de integración, no de diseño.

---

## Anexo · Acciones priorizadas

| # | Acción | Prioridad | Dónde |
|---|---|---|---|
| 1 | Variante `sheet` + token `--lg-lens-on` para listas | 🔴 | `glass.css` + `useGlassLens.js` |
| 2 | Reescribir la cabecera de `GlassSurface` con la regla nueva de anidamiento | 🔴 | `GlassSurface.vue:24` |
| 3 | Variante `dropdown` y quitar la fuga de tokens | 🔴 | `glass.css` + `AppNav.vue:1976` |
| 4 | `light`: tinta sólida + velo 0.24, y **medir** | 🔴 | `glass.css:311` |
| 5 | Decidir tema base oscuro para el proyecto nuevo | 🔴 | producto |
| 6 | Borrar las dos declaraciones duplicadas de `__spec::after` | 🟡 | `glass.css` |
| 7 | Corregir el comentario que contradice al código | 🟡 | `AppNav.vue:914` |
| 8 | `--lg-spec-base` + `--lg-spec` | 🟡 | `glass.css` |
| 9 | Lista de variantes a módulo importable | 🟡 | `GlassSurface.vue` |
| 10 | `useGlassPanel()` | 🟡 | nuevo composable |
| 11 | Empaquetar como Nuxt Layer | 🟢 | nuevo |
| 12 | Documentar el fallback de Safari como contrato | 🟢 | README del layer |

---

*Auditoría de sólo lectura. No se modificó ningún archivo de `prototype/`, `frontend/` ni `backend/`.*
