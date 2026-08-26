# Paquete de componentes · 20 Avenida → e-commerce oficial

**Qué es esto.** El prototipo `20avenida-prototype` se lleva al repo oficial del
front **copiando sus archivos**, no reescribiéndolos. Este paquete es lo que el
código no puede contar por sí solo: de dónde sale cada número, qué se probó y se
descartó, y qué trampas ya costaron una vez.

**El código viaja como código.** Nadie tiene que reconstruir nada desde cero —
son ~5 500 líneas y ningún documento las sustituye. Y desde ahora **los arreglos
del doc 01 ya están aplicados en el prototipo**: se copia tal cual.

**Para quién.** Para una sesión futura —humana o de agente— que no vivió ninguna de las decisiones. Todo lo que aquí se afirma está medido o citado del código, no recordado.

---

## Cómo usar este paquete

Los documentos están pensados para leerse **en orden**, y cada uno es autosuficiente para su componente.

| # | Documento | Qué contiene |
|---|---|---|
| **00** | este archivo | índice, orden de adopción, reglas transversales |
| **01** | [`01-MATERIAL-LIQUID-GLASS.md`](01-MATERIAL-LIQUID-GLASS.md) | el material: 17 tokens, variantes, la lente, y **las soluciones a los hallazgos** |
| **02** | [`02-APPNAV.md`](02-APPNAV.md) | la barra, el menú, el buscador — dos disposiciones |
| **03** | [`03-PRODUCT-SHOWCASE.md`](03-PRODUCT-SHOWCASE.md) | el zapato con scrollover |
| **04** | [`04-ESCENARIO-Y-MARCA.md`](04-ESCENARIO-Y-MARCA.md) | fondos, grano, tokens de marca, BrandMark |
| **05** | [`05-MANIFIESTO.md`](05-MANIFIESTO.md) | qué archivo copiar, dependencias, orden de import |
| **06** | [`06-PRODUCT-ACCORDION.md`](06-PRODUCT-ACCORDION.md) | el acordeón de productos — con detalle en el sitio y **contrato de dependencias** |
| **07** | [`07-PRODUCT-HONEYCOMB.md`](07-PRODUCT-HONEYCOMB.md) | el panal — hexágonos de vidrio, y **el filo reproducido sobre un polígono** |
| **08** | [`08-PRODUCT-REEL.md`](08-PRODUCT-REEL.md) | el rollo — carrusel a pantalla completa con ficha de dos columnas |
| **09** | [`09-PRODUCT-DIPTYCH.md`](09-PRODUCT-DIPTYCH.md) | el díptico — lámina fija + carrusel de hexágonos |
| **10** | [`10-SITE-FOOTER.md`](10-SITE-FOOTER.md) | el pie — la única pieza del paquete que **no** usa el material |

Y aparte, en esta misma carpeta:

- [`AUDITORIA-LIQUID-GLASS.md`](AUDITORIA-LIQUID-GLASS.md) — la auditoría de compatibilidad con la arquitectura del backend y el listado de hallazgos con severidad.

---

## Orden de adopción recomendado

No copiar todo de golpe. Este orden hace que cada paso se pueda verificar solo:

```
1. Tokens y escenario   (doc 04)  →  se ve el fondo con su rampa y su grano
2. Material liquid glass (doc 01) →  se ve una superficie de vidrio flotando
3. BrandMark            (doc 04)  →  se ve la marca sobre el fondo
4. AppNav               (doc 02)  →  la tienda ya se navega
5. ProductShowcase      (doc 03)  →  la landing ya cuenta algo
6. ProductAccordion     (doc 06)  →  la landing enseña catálogo
7. ProductHoneycomb     (doc 07)  →  y enseña que hay muchos más
8. ProductReel          (doc 08)  →  un producto en pedestal, con su ficha
9. ProductDiptych       (doc 09)  →  cierra la landing
10. SiteFooter          (doc 10)  →  el marco, con AppNav
```

**El orden de ADOPCIÓN no es el orden de la PÁGINA.** En la landing el rollo va
entre el acordeón y el panal (escaparate · acordeón · rollo · panal · díptico);
aquí va detrás porque depende de todo lo anterior y no al revés. El porqué del
orden de la página está en los comentarios de `pages/index.vue`.

Los diez pasos existen ya en el prototipo. El paso 6 va justo debajo del showcase
y **reutiliza `colorways.js`**; el doc 06 trae su contrato de dependencias
completo (§14) — son **tres imports, un componente, un token y una clase**, y
nada más.

El paso 2 ya no tiene deuda: los siete arreglos del doc 01 (§5, §6, §7 y los cinco menores de §8) están **aplicados**. El doc 01 los conserva explicados — y en el caso del §7, con la corrección de un cálculo que estaba mal.

---

## Reglas transversales

Estas valen para **todo** el paquete y son decisiones tomadas, no preferencias. Si algo en el código futuro las contradice, es el código el que está mal.

### R1 · Nunca versales

Primera mayúscula y el resto minúsculas. Sea un título, una etiqueta o una fila. **Ni con `text-transform` ni escritas a mano.**

Y con las versales se va también el trazo ancho que las acompañaba (`.2em`, `.42em`): ese aire estaba para que un bloque de mayúsculas se leyera, y en minúscula sólo descose la palabra.

> Se eliminó de siete sitios.

**UNA excepción en todo el paquete, y está escrita: `.ps__word`**, el texto
gigante del fondo del escaparate. Pasó de `ADIDAS` a `Adidas` por esta regla y
**volvió a `ADIDAS`** después, porque ahí la palabra no es un título que se lee
sino la MASA que ocupa el fondo: en caja baja las descendentes rompen la banda.
Ver doc 03 §5. Ninguna otra pieza la tiene, **y el título del rollo tampoco**
—ese es mayúsculas por `text-transform` en una ficha, y es deuda pendiente—.

### R2 · Un solo cuerpo y un solo peso por panel

En la barra y sus paneles: **13.5 px en peso 500**. Sin excepción, títulos incluidos. Nada de negrita en ningún sitio.

**Lo que separa un título de una fila es el COLOR** — blanco puro contra el 72% de siempre — nunca el cuerpo ni el peso.

Excepciones, y están escritas:
- Los **badges numéricos** (contador de la bolsa, píldora de descuento): un número dentro de una burbuja no es texto corrido.
- El **showcase tiene su propia escala** (doc 03), porque es una pieza de display, no de interfaz.

> El input del buscador también bajó a 13.5. Se sabe que por debajo de 16 px iOS hace zoom sobre la página al enfocar el campo; **se aceptó ese coste a cambio de no romper la regla**. Es una decisión consciente, no un descuido.

### R3 · El vidrio puede anidarse hasta dos niveles

Panel → ficha. **Nunca tres.**

A partir de la tercera instancia repetida en pantalla (listas, grillas), usar la variante `sheet`, que conserva el material y quita la lente — que es lo único que escala mal. Ver doc 01 §5.

> Esto **sustituye** a la antigua regla "nada de vidrio sobre vidrio", que fue **retirada a propósito**: las cards liquid dentro del menú son el efecto buscado.

### R4 · El material vive en `glass.css`, nunca en el CSS del componente

Si un componente necesita otros valores de vidrio:
- **un token** → una línea de CSS en el componente
- **varios tokens sincronizados** → una variante nueva en `glass.css`

Reescribir tokens crudos en el `<style scoped>` de un componente es el anti-patrón que rompió esto una vez. Ver doc 01 §4.

### R6 · Un margen y un botón para toda la página

Las piezas a pantalla completa **no se ven solas**, se ven en scroll una detrás
de otra. Dos medidas dejaron de ser de cada componente:

| token | qué gobierna |
|---|---|
| `--av-gutter` | el margen lateral de **lo que se lee** en las cinco piezas |
| `--av-action-*` | alto, ancho mínimo, relleno, cuerpo y glifo de **los cinco botones** |

**Lo que queda fuera del margen y es la mitad de la regla:** lo que va a sangre
por diseño —el texto gigante del fondo, el plano de color del acordeón, las
fotos del panal, el plafón de cada sección—. **El margen es de lo que se lee, no
del fondo.**

Detalles y desviaciones consentidas en el doc 04 §3b.

> El síntoma de que esta regla se está rompiendo es siempre el mismo: un
> `min-width` o un `clamp` suelto en el `<style scoped>` de un componente que
> gana al token. Es lo primero que hay que buscar.

### R5 · Los paneles de vidrio van con `v-show`, nunca con `v-if`

Con `v-if` el panel se monta y se destruye en cada apertura, así que su `<filter>` SVG se crea y se borra cada vez y el navegador no llega a resolver la referencia del `backdrop-filter`.

**El menú del prototipo estuvo sin deformación durante días exactamente por esto.** Ver doc 01 §6.

---

## Cómo entregarle esto a otra sesión

**Primero se arma la carga**, que mete el código dentro de la propia carpeta:

```
node PAQUETE-COMPONENTES/empaquetar.mjs
```

Eso crea `PAQUETE-COMPONENTES/codigo/` con las **26 entradas** que el doc 05
manda copiar — 64 archivos contando lo que hay dentro de las cuatro carpetas de
assets, unos 3.3 MB— — componentes, composables, CSS y assets — con su estructura de carpetas
intacta. Se genera y no se guarda en git a propósito: dos copias del mismo
componente derivan en cuanto alguien toca una.

Después se copia la carpeta `PAQUETE-COMPONENTES/` completa — que ya lleva
documentos **y** código — al repo del e-commerce, y se da esta instrucción:

> Lee `PAQUETE-COMPONENTES/00-LEEME-PRIMERO.md` y sigue el orden de adopción.
> Los archivos están en `PAQUETE-COMPONENTES/codigo/` con la estructura que les
> toca: **cópialos, no los reescribas.** El doc 05 dice cuáles y en qué orden.
> Los números que aparecen en los documentos son decisiones tomadas mirando el
> resultado, no valores por defecto: no los ajustes sin pedirlo.

> ⚠️ Aquí decía «los hallazgos del doc 01 §3-§7 están sin aplicar — aplícalos al
> reconstruir», y **contradecía a la cabecera de este mismo documento**, que dice
> que ya lo están. Lo cierto es lo segundo: los siete están aplicados y el doc 01
> los marca uno a uno.

---

## Estado del prototipo en el momento de empacar

- Último commit: `af23549 Armonía entre componentes: botones, márgenes y tipografía`
- `useGlassLight.js` fue **eliminado**: la luz ya no sigue al ratón. El filo es
  estático a `--lg-ang: 135deg`. Ver doc 01 §2.
- Cuatro variantes de material vivas: `panel`, `light`, `sheet`, `dropdown`.

### ⚠️ La tipografía está en migración y desincronizada

**Es lo único del paquete que no se puede copiar tal cual hoy.** `nuxt.config.ts`
descarga **Oswald** y `tokens.css` pide **`"Anton"`**, así que la página se pinta
con la reserva (Impact) y nunca cambia. En tres días la familia ha sido Playfair
→ Outfit → Anton → Oswald.

Lo que falta es una línea —poner la familia buena en `--av-font` con una reserva
de las mismas proporciones— y decidir si el `font-synthesis-weight: none` de
`main.css` se queda, porque se puso por una limitación de Anton que Oswald no
tiene. **El detalle y la regla general están en el doc 04 §3c.**

### Cambios sin commitear

| Archivo | Qué | Doc |
|---|---|---|
| `ProductReel.vue` | la ficha rehecha a dos columnas 65/35, el zapato al fondo | 08 §4 |
| `ProductDiptych.vue` | fondo negro y sombra de la lámina fuera | 09 §2 |
| `pages/index.vue` | orden restituido; se le quitó el `:bg` claro al rollo | 05 |
| `tokens.css` · `main.css` · `nuxt.config.ts` | la migración de letra de arriba | 04 §3c |
| `ProductShowcase.vue` | fuera un comentario que decía lo contrario del código | 03 §5 |

### Lo que cambió respecto a la versión anterior del paquete

- **Tres componentes nuevos documentados:** el rollo (08), el díptico (09) y el
  pie (10). El rollo llegó a tener un piso de marcas encima y se eliminó entero;
  `brands.js` sobrevivió porque el pie lo usa.
- **Dos medidas se volvieron transversales** — la R6 de arriba es nueva.
- **La barra cambió mucho** y el doc 02 estaba parado desde el 22 de agosto: la
  marca volvió a una burbuja de vidrio, la píldora se centra sobre la pantalla y
  no sobre su hueco, los enlaces perdieron el icono, el ⋯ y la lupa
  desaparecieron de escritorio, los paneles van a sangre con `100vw`, el
  buscador de escritorio es una barra con desplegable `dropdown`, y la ficha de
  resultado es `light sheet` con la tinta forzada a blanco. Todo en el doc 02
  §2b, §3 y §4.
- **El filo especular se rehizo entero:** un solo anillo, monótono desde los
  bordes, con suelo 0.17 y sin la viñeta oscura que dejaba fleco negro en las
  esquinas. Doc 01 §3.
- **El acordeón ya no es una especificación.** Está construido, y se aparta de lo
  planificado en dos cosas: **sí lleva liquid glass** (los controles que flotan
  sobre el plano de color, no el plano) y el clic **no navega** — abre la ficha
  completa en el sitio.
- **El panal (doc 07) trae un hallazgo que afecta al material**, no sólo a él: el
  filo se dibuja con una máscara sobre el `border-radius`, así que no puede
  seguir a una forma que no sea un rectángulo redondeado. Cualquier pieza futura
  con `clip-path` se encontrará lo mismo — al díptico ya le pasó.
