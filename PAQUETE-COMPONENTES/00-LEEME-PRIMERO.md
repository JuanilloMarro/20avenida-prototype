# Paquete de componentes · 20 Avenida → e-commerce oficial

**Qué es esto.** El prototipo `20avenida-prototype` no se va a migrar: se va a **reconstruir** dentro del repo oficial del front. Este paquete existe para que esa reconstrucción salga **exactamente igual** que el prototipo, sin tener que abrir el prototipo ni adivinar por qué un número es el que es.

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
| **06** | [`06-PRODUCT-ACCORDION.md`](06-PRODUCT-ACCORDION.md) | el acordeón de productos — ⚠️ **planificado, no construido** |

Y aparte, en la carpeta padre:

- [`../AUDITORIA-LIQUID-GLASS.md`](../AUDITORIA-LIQUID-GLASS.md) — la auditoría de compatibilidad con la arquitectura del backend y el listado de hallazgos con severidad.

---

## Orden de adopción recomendado

No copiar todo de golpe. Este orden hace que cada paso se pueda verificar solo:

```
1. Tokens y escenario   (doc 04)  →  se ve el fondo con su rampa y su grano
2. Material liquid glass (doc 01) →  se ve una superficie de vidrio flotando
3. BrandMark            (doc 04)  →  se ve la marca sobre el fondo
4. AppNav               (doc 02)  →  la tienda ya se navega
5. ProductShowcase      (doc 03)  →  la landing ya cuenta algo
6. ProductAccordion     (doc 06)  →  la landing enseña catálogo   ← A CONSTRUIR
```

El paso 6 es el único que **no existe todavía**: el doc 06 es su especificación,
no su documentación. Va justo debajo del showcase en la landing y **reutiliza
`colorways.js` sin cambios** — sólo pide dos entradas más de datos.

El paso 2 es el que tiene deuda pendiente. **No copiarlo tal cual**: el doc 01 trae los cinco arreglos aplicados y explicados.

---

## Reglas transversales

Estas valen para **todo** el paquete y son decisiones tomadas, no preferencias. Si algo en el código futuro las contradice, es el código el que está mal.

### R1 · Nunca versales

Primera mayúscula y el resto minúsculas. Sea un título, una etiqueta o una fila. **Ni con `text-transform` ni escritas a mano.**

Y con las versales se va también el trazo ancho que las acompañaba (`.2em`, `.42em`): ese aire estaba para que un bloque de mayúsculas se leyera, y en minúscula sólo descose la palabra.

> Se eliminó de siete sitios. Incluso el texto gigante del showcase pasó de `ADIDAS` a `Adidas`.

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

### R5 · Los paneles de vidrio van con `v-show`, nunca con `v-if`

Con `v-if` el panel se monta y se destruye en cada apertura, así que su `<filter>` SVG se crea y se borra cada vez y el navegador no llega a resolver la referencia del `backdrop-filter`.

**El menú del prototipo estuvo sin deformación durante días exactamente por esto.** Ver doc 01 §6.

---

## Cómo entregarle esto a otra sesión

Copiar la carpeta `PAQUETE-COMPONENTES/` completa al repo del e-commerce y dar esta instrucción:

> Lee `PAQUETE-COMPONENTES/00-LEEME-PRIMERO.md` y sigue el orden de adopción.
> Los números que aparecen en los documentos son decisiones tomadas mirando el
> resultado, no valores por defecto: no los ajustes sin pedirlo.
> Los hallazgos del doc 01 §3-§7 están sin aplicar en el prototipo — aplícalos
> al reconstruir.

---

## Estado del prototipo en el momento de empacar

- Último commit: `70f9217 Liquid Improvements and search bar`
- Hay **un cambio sin commitear** en `AppNav.vue`: se quitó el recuadro de fondo de la foto en la ficha del buscador (quitaba una tercera superficie apilada). Está recogido en el doc 02.
- `useGlassLight.js` fue **eliminado** en ese commit: la luz ya no sigue al ratón. Ver doc 01 §2.
