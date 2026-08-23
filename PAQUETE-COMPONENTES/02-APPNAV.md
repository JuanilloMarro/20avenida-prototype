# 02 · `<AppNav>` — barra, menú y buscador

**Archivo:** `components/nav/AppNav.vue` (~2000 líneas)
**Depende de:** el material (doc 01), los tokens de nav (doc 04), `BrandMark`, `lucide-vue-next`

Es el componente más grande del prototipo. Resuelve **dos disposiciones completas** con el mismo marcado y la misma pieza de material.

---

## 1 · API pública

```js
defineProps({
  items:        Array,   // lo que NAVEGA
  active:       String,  // 'home'
  bag:          Number,  // 0 = sin burbuja
  activeAction: String,  // 'bag'
  suggestions:  Array,   // PLACEHOLDER hasta que haya endpoint
  catalog:      Array,   // lo que el buscador encuentra
  filters:      Array,   // el árbol de filtros
})

defineEmits(['select', 'open', 'search', 'filter'])
```

**Lo más importante para reutilizarlo:** el componente **no sabe nada del catálogo**. Todo entra por props y sale por emits. El puente con los stores es un contenedor externo — `AppNav` no se toca al conectarlo al backend.

### Datos por defecto

```js
// items — SÓLO lo que navega
{ id: 'home',    label: 'Inicio',       to: '/',              icon: House }
{ id: 'shop',    label: 'Tienda',       to: '/tienda',        icon: Store }
{ id: 'sale',    label: 'Ofertas',      to: '/ofertas',       icon: Percent }
{ id: 'soon',    label: 'Próximamente', to: '/proximamente',  icon: Sparkles }
{ id: 'about',   label: 'Nosotros',     to: '/about',         icon: Info }
{ id: 'account', label: 'Cuenta',       to: '/account',       icon: User }

// actions — los tres botones de la barra
{ id: 'bag',      icon: ShoppingBag, label: 'Bolsa' }
{ id: 'wishlist', icon: Heart,       label: 'Favoritos' }
{ id: 'account',  icon: User,        label: 'Cuenta' }
```

> **El orden de `items` no es alfabético ni casual:** va de lo más vendedor a lo más administrativo. **Tienda es segunda a propósito** — es el destino del recorrido de filtros. Ofertas y Próximamente son las dos razones para volver a entrar. Nosotros y Cuenta cierran.

---

## 2 · El punto de quiebre: **1280 px**

```
@media (max-width: 1279px)  → teléfono/tablet: barra única
@media (min-width: 1280px)  → escritorio
```

⚠️ **Ojo:** estuvo en 900 px durante buena parte del desarrollo. Los comentarios antiguos del código todavía dicen 900 en algún sitio. **El valor vigente es 1280.**

### Las dos disposiciones

| | Escritorio (≥1280) | Móvil (≤1279) |
|---|---|---|
| Marca | suelta, sin panel | dentro del menú |
| Enlaces | píldora centrada | dentro del menú del ⋯ |
| Buscador | barra propia en la cabecera + desplegable | panel a pantalla completa |
| Acciones | tres botones sueltos | dentro de la barra única |

**Se resuelven en CSS con el marcado duplicado**, no con `matchMedia` + `v-if`. El motivo está escrito: el servidor no sabe el ancho, renderiza una y el navegador tendría que corregirla al hidratar. Duplicar en CSS lo resuelve en el primer pintado, y la copia oculta sale del árbol de accesibilidad — no hay botones repetidos para un lector.

---

## 3 · El menú (el panel del ⋯)

**A pantalla completa**, `variant="panel"`, con `v-show` (regla R5).

Dentro, dos cosas y en este orden:

1. **Lo que navega** — las seis filas de `items`. Fuera del scroll y sin encogerse: se ven siempre.
2. **Los filtros** — el árbol, y se llevan el alto que sobra.

### El árbol de filtros

```
Sneakers  (Footprints)
  ├ Hombre → Nike · Adidas · Puma · New Balance · Converse · Vans
  ├ Mujer  → Nike · Adidas · Puma · New Balance
  └ Niños  → Nike · Adidas          ← PLACEHOLDER, confirmar catálogo infantil
Ropa      (Shirt)
  ├ Hombre
  └ Mujer
Accesorios (Package)
  ├ Gorras · Pines · Cintas · Calcetines
```

**Sneakers, Ropa y Accesorios son FILTROS, no destinos.** Estuvieron arriba en `items` como botones que abrían un desplegable de categoría propio; se sacaron. No son sitios a los que se va, son por dónde se corta el catálogo. Sustituyen a los antiguos Hombre / Mujer / Productos — **hombre y mujer no desaparecieron, bajaron un nivel**, que es donde estaban en realidad.

**El icono va sólo en la raíz.** Más abajo son marcas y cortes; ahí un icono sería un logo (que no toca) o decoración repetida. La columna del icono se reserva en todos los niveles, así que las etiquetas siguen alineadas.

**Los ids llevan el prefijo de su rama** (`sneakers-hombre-nike`) y no el nombre suelto: son lo que viaja a Tienda, y un `nike` pelado no diría si viene de sneakers o de ropa.

### El recorrido — cómo se despliega

Al desplegar una rama **sus hermanas desaparecen** y sus hijos salen justo debajo de ella, **15 px más adentro**. La rama abierta se queda arriba, y con ella las que llevaron hasta aquí: eso es lo que dice dónde está el usuario, sin gastar una migaja de pan aparte.

Tocar una fila del recorrido **la cierra y devuelve a su nivel** — la misma fila abre y cierra, así que no hay botón de volver. Se quitó a propósito: decía que se podía salir, pero no a dónde.

**No es un acordeón:** nunca hay dos niveles abiertos a la vez.

### Las hojas direccionan, no se marcan

```
rama → <button aria-expanded>   se despliega ahí mismo
hoja → <a href="/tienda?f=…">   cierra el menú y LLEVA A TIENDA
```

Hubo un modelo con checks y contador. Se descartó: pedía un «ver resultados» al final que nadie había pedido, y dejaba al usuario eligiendo dentro de un panel en vez de dentro de la tienda. **Filtrar de verdad —varios cortes a la vez, sin salir— es cosa de Tienda.**

La hoja emite el **camino entero**: `{ node, path, ids, to }`. Quien escuche necesita saber que «Nike» venía de Sneakers › Hombre, y reconstruirlo partiendo guiones sería adivinar.

**«Limpiar»** sale sólo cuando se ha bajado del primer nivel y devuelve el árbol a su raíz de una vez, en lugar de cerrar rama por rama.

### Alineación

Los dos títulos del panel —«Menú» y «Filtros»— **arrancan en la misma vertical**. Ninguno lleva relleno lateral propio: los dos cuelgan del padding del cuerpo.

Las filas sí van 13 px más adentro, y no es incoherencia: **una fila tiene fondo al pasar por encima y ese fondo necesita respirar por dentro; un título no tiene caja.**

---

## 4 · El buscador

**Teléfono:** panel a pantalla completa, `variant="panel"`.
**Escritorio:** barra propia en la cabecera + desplegable colgando de ella.

### Por qué `v-show` y no `v-if`

Además de la regla R5 (la lente), hay un segundo motivo específico de este panel:

> En iOS el teclado sólo sube si el `.focus()` ocurre **dentro del gesto que lo pidió**. Con `v-if` el input todavía no existe en ese instante y el teclado no aparece. Con `v-show` el input está siempre en el DOM y lo único que cambia es su `display`, así que el `focus` del `nextTick` —que sigue siendo el mismo turno de tarea— sí lo levanta.

### El teclado móvil

Dos variables que escribe el script:

| Variable | Qué resuelve |
|---|---|
| `--av-kb` | cuánto del alto se come el teclado. Le recorta el techo al panel. |
| `--av-vv` | iOS además de encoger el viewport visual lo **desplaza**, y un `position: fixed` no se entera. `visualViewport.offsetTop` es lo único que lo sabe. |

**Sin transición a propósito:** el teclado ya trae la suya y una segunda encima se ve como que el panel lo persigue.

### La ficha de resultado

Es una `<GlassSurface variant="light">` — vidrio dentro de vidrio, **a propósito** (regla R3). Permite fichas liquid sin perder el fondo.

⚠️ Dos pendientes sobre ella, ambos en el doc 01:
- El contraste AA de `light` con texto (§7)
- El comentario encima que dice lo contrario de lo que hace el código (§8c)

**Cambio sin commitear en el prototipo:** se le quitó el recuadro de fondo a la foto. Tenía un rectángulo redondeado con `--av-on-glass-hair` y sumaba **una tercera superficie** a la pila —panel, ficha y encima el recuadro—: tres velos apilados para enmarcar un PNG que ya viene recortado. La foto va suelta; `place-items` sigue centrándola.

---

## 5 · Tipografía — la regla y sus excepciones

**Todo el componente: 13.5 px en peso 500.** Títulos incluidos.

```
«Menú»                  13.5 / 500   color fuerte
«Filtros»               13.5 / 500   color fuerte
filas de navegación     13.5 / 500   color 72%
filas de filtro         13.5 / 500   color 72%
rama abierta            13.5 / 500   color fuerte + chevron abajo
«Limpiar»               13.5 / 500   color fuerte + subrayado
título del buscador     13.5 / 500   color fuerte
sugerencias             13.5 / 500   color 72%
ficha: línea            13.5 / 500   tono suave
ficha: nombre           13.5 / 500   tono fuerte
ficha: precio           13.5 / 500   tono fuerte
input del buscador      13.5 / 500   ← ver nota
```

**Lo que separa un título de una fila es el COLOR**, no el peso ni el cuerpo.

### Las dos excepciones, escritas

1. **Los badges numéricos** (contador de la bolsa, píldora de descuento `-20%`): 10-11 px en peso 700. Un número dentro de una burbuja no es texto corrido.
2. **El input del buscador a 13.5:** se sabe que por debajo de 16 px **iOS hace zoom sobre la página entera al enfocar el campo**. Se aceptó ese coste a cambio de no romper la única regla de tamaño del componente. Es una decisión consciente.

### La barra volvió al velo negro

Se probó `variant="light"` en la barra —velo blanco, glifos a tinta— y **se descartó**: la barra dejaba de leerse como parte del sistema. La variante se queda disponible para otros botones.

---

## 6 · Medidas — todas en tokens

Viven en `tokens.css` (doc 04), no dentro del componente:

```css
--av-nav-h:      55px;
--av-nav-gap:    16px;
--av-nav-pad:    clamp(16px, 3vw, 34px);
--av-nav-lgap:   clamp(10px, 1.44vw - 4.8px, 16px);
--av-search-w:   clamp(193px, 43.125vw - 359px, 320px);
--av-search-x:   calc(var(--av-nav-pad) + var(--av-nav-h) + var(--av-nav-lgap));
--av-nav-top:    calc(var(--av-nav-gap) + env(safe-area-inset-top, 0px));
--av-nav-space:  calc(var(--av-nav-top) + var(--av-nav-h) + var(--av-nav-gap));
```

### Por qué 55 px de alto

Un solo número gobierna la marca, la píldora y los botones — si cambia, cambian todas las piezas a la vez y siguen alineadas.

**El precio del alto se paga en material:** los topes de la lente recortan a un 34% del lado corto.

| alto de barra | lente | compresión | % del material real |
|---|---|---|---|
| 46 px | — | — | 60% |
| **55 px** | 26 → **18.7** | 82 → **59.8** | **72%** |
| 58 px | — | — | 76% |
| 70 px | 26 → 23.8 | 82 → 76.2 | 92% |

**55 y no menos** porque el botón de la barra de teléfono mide `--av-nav-h` menos 10 = **45 px**, y sigue por encima de los 44 de un objetivo táctil, que es el suelo real. Ese menos-10 era menos-14 cuando la barra medía 58; se ajustó al bajar, o el botón caía a 41.

### Por qué `--av-search-x` es un token

El desplegable del buscador es **hermano** de la cabecera, no hijo, así que necesita saber dónde empieza la barra de búsqueda para caer justo debajo. Esa cuenta es `relleno + marca + hueco`. Con los números sueltos dentro del componente no habría forma de escribirla sin repetirlos.

---

## 7 · Detalles que parecen menores y no lo son

- **La barra es `fixed`, no `sticky`.** Sticky depende de que ningún ancestro tenga `overflow`, y en una tienda ese ancestro aparece tarde o temprano.
- **Con un panel abierto la barra desaparece** (`visibility: hidden`, no `display: none`). Sale igual del árbol de accesibilidad pero conserva su ancho, y no obliga a recalcular el hueco que reserva.
- **`.av-glyph` va en un `<span>` alrededor del icono, NUNCA en el botón.** La clase lleva `filter: drop-shadow(…)` y un ancestro con `filter` crea un backdrop root — la burbuja y la selección se quedarían sin nada que refractar y dejarían de ser vidrio.
- **`min-width: 0` en `.av-glass__body`** de los paneles. El panel es un flex en fila y su cuerpo es el ítem: con el `auto` por defecto no puede encoger por debajo de su contenido. A sangre (375) sobraba sitio; al flotar (343) el cuerpo se quedaba en 370 y las fichas salían por el filo derecho.
- **Escape sube un nivel del recorrido antes de cerrar** el panel.

---

## 8 · Conexión con el backend

| Prop | Endpoint que lo alimentaría |
|---|---|
| `catalog` | `GET /public/products?search=` |
| `filters` | `GET /public/filters` |
| `items` | estático o `page-settings` |
| `suggestions` | PLACEHOLDER — historial o endpoint |
| `bag` | `useCartStore()` |

**Único desajuste a resolver:** el árbol usa ids compuestos (`sneakers-hombre-nike`) y las hojas navegan a `/tienda?f=<id>`, mientras el backend espera `queryParameters` planos. Hay que definir el mapeo — trabajo de integración, no de diseño.
