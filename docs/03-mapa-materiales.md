# Artefacto 03 — Mapa de materiales

> ## ⚠ HISTÓRICO — no describe el código
>
> Este documento repartía **cinco** materiales entre los componentes. Ese mapa
> quedó superado: hay **uno solo**, «Velo negro», y vale para todo. Ver
> [`01-velo-negro.md`](01-velo-negro.md).
>
> Lo que **sí** sigue vigente, y es la parte que importa, son las reglas de uso
> del §4: nada de vidrio sobre vidrio, nada de vidrio en la capa de contenido,
> la acción principal no es de vidrio, y la altura manda sobre el material. Esas
> se conservan tal cual en el documento 01 §6.


Prototipo: `20av-materiales.html` (Vue 3, self-contained).
Pregunta que responde: **qué material de vidrio le toca a cada componente de la tienda.**

Valores: `materials.js` (ver artefacto 02 §0). Este documento decide **qué va dónde**;
el módulo decide **cuánto vale cada cosa**.

---

## 1. El criterio

No es estético. El material lo deciden dos cosas:

1. **Cuánto tiene que leer el usuario en ese componente.**
2. **Qué tan impredecible es lo que hay detrás.**

De ahí sale todo lo demás. Un menú con ocho categorías y un badge de "−20%" no
pueden llevar el mismo vidrio aunque los dos floten sobre la misma foto.

Guía de Apple, resumida:

- **Regular es el por defecto.** Es el que "da legibilidad independientemente del
  contexto" y el que se usa en navegación y controles.
- **Clear sólo vale si se cumplen las tres a la vez:** está sobre contenido rico
  en media, el contenido de abajo aguanta una capa de atenuación, y lo que va
  encima es grueso y brillante. Clear no tiene el comportamiento adaptativo de
  Regular: es permanentemente más transparente.
- **Nada de vidrio sobre vidrio.** Lo que va encima de una superficie de vidrio
  se resuelve con relleno y tipografía, no con otra capa de material.
- **Nada de vidrio en la capa de contenido** — listas, tablas, tarjetas de una
  grilla que hace scroll. Confunde qué flota y qué no.
- **Limitarlo a los elementos funcionales importantes.** Aplicado en todo, deja
  de dirigir la atención.
- **Fallback obligatorio** para quien active reducir transparencia o movimiento.

---

## 2. Los materiales

| | blur | lente | compresión | sat | velo | aberr | para qué |
|---|---|---|---|---|---|---|---|
| **Clear** | 3 | 26 | 82 | 1.00 | **0.42** | 0% | barra de navegación — ver aviso abajo |
| **Regular** | 14 | 20 | 52 | 1.30 | 0.12 | 2% | el por defecto: controles |
| **Dock** | 6 | 32 | 96 | 1.18 | 0.05 | 4% | rails y barras con pocos iconos |
| **Sheet** | 32 | 14 | 24 | 1.32 | 0.34 | 1% | listas, formularios, precios |
| **Sólido** | — | — | — | — | opaco | — | capa de contenido y acción principal |

> **Aviso — Clear ya no es el material más limpio.** Los valores de arriba son el
> ajuste que salió del panel: conserva la óptica de Clear (lente 26, compresión 82)
> pero sube el velo de **0.00 a 0.42**. Eso lo convierte en **el material más opaco
> del mapa**, por encima de Sheet. La tabla ya no está ordenada de limpio a
> legible, y el nombre «Clear» ya no describe lo que hace.
>
> Esto **no es un error**: resuelve la objeción anotada en la página *Liquid Glass*
> del Figma — que una barra de navegación no puede llevar Clear porque sus opciones
> tienen que ser totalmente visibles. Pero conviene decidir el nombre antes de que
> se escriba en veinte plantillas. Dos salidas:
>
> - **Renombrar** a `nav` y devolver `clear` a 0.00 / blur 1 / sat 1.12 / aberr 3%.
>   Son cinco materiales y cada nombre vuelve a describir su cosa.
> - **Aceptar** que en 20av «Clear» significa esto, y anotar que el mapa de Apple
>   no aplica tal cual.

Dos notas sobre los tokens:

- **El velo es adaptativo.** En fondo claro es blanco, en oscuro es tinta:
  `--veil: 255,255,255` / `10,10,13`. Es un token, no dos componentes. Es lo que
  hace que Regular "se defienda solo".
- **Dos topes de seguridad**, aprendidos rompiéndolo:
  `lente ≤ 34% del lado corto` y `compresión ≤ 3.2 × lente`. Sin ellos una
  píldora de talla de 40 px se deforma entera y el número deja de leerse.
  Consecuencia práctica: **una pieza con lente 26 necesita 77 px de lado corto**
  para verse como está especificada. Por debajo, el material que se pinta no es
  el de la tabla. Ver artefacto 02 §0.

---

## 3. Dónde va cada uno

| Componente | Material | Por qué |
|---|---|---|
| **Barra de navegación** | **Clear (velo 0.42)** | Seis opciones que tienen que leerse sobre lo que sea que haya detrás |
| Rail lateral | Dock | Pocos iconos, mucho recorrido por encima de la página |
| **Menú desplegable** | **Sheet** | El usuario elige entre varias opciones: legibilidad sobre efecto |
| Buscador | Regular | El placeholder y lo tecleado se ven mientras el fondo se mueve |
| Barra de compra fija | Regular | Poco texto, pero es la conversión |
| Panel de filtros | Sheet | Formulario denso con estados marcados |
| Mini-carrito | Sheet | Cifras que se comparan y se suman |
| Aviso / toast | Regular | Aparece sobre cualquier cosa y dura tres segundos |
| Tallas y filtros rápidos | Clear *(óptica, velo bajo)* | Dos o tres caracteres gruesos; el activo va sólido |
| Badge sobre foto | Clear *(óptica, velo bajo)* | Etiqueta corta en negrita; deja ver la foto, que es lo que vende |
| Controles de galería | Clear *(óptica, velo bajo)* | Caso de manual: media rica debajo + atenuación |
| Tarjeta de producto (grilla) | **Sólido** | Capa de contenido, hace scroll, y cuesta rendimiento por tarjeta |
| Tooltip | Regular | Cuerpo de letra pequeño: con Clear se pierde |

Las tres filas marcadas *(óptica, velo bajo)* son las que sí querían el Clear
original. Son la razón principal para separar los dos materiales en vez de
sobreescribir uno: talla, badge y galería quieren velo ~0; la nav quiere 0.42.

Regla práctica que resume la tabla: **si el componente contiene una decisión
—precio, talla, cantidad, categoría— sube a Sheet. Si contiene una etiqueta,
baja a Clear. Todo lo demás es Regular.**

---

## 4. Reglas que no se negocian

1. **Vidrio sobre vidrio, no.** El "42" activo entre las tallas es sólido por eso,
   y el ítem activo de la nav también.
2. **Vidrio en la capa de contenido, no.** El vidrio es de la capa que flota.
3. **La acción principal no es de vidrio.** "Añadir a la bolsa" va en tinta
   sólida: el contraste AA de la conversión no puede depender de la foto de detrás.
4. **Clear pide atenuación.** Si va sobre foto, la foto lleva debajo una capa
   oscura. Sin ella no es un material, es un accidente.
5. **Contraste de glifos.** El vidrio limpio no garantiza contraste: los símbolos
   llevan su propia sombra (halo claro + sombra oscura), como los de iOS.
6. **`prefers-reduced-transparency` → sólido**, con el mismo radio y la misma
   sombra. Nada de layout se mueve.
7. **La altura manda sobre el material.** Antes de fijar un material, comprobar
   que el lado corto de la pieza aguanta su lente. Si no, o sube la pieza o baja
   el material.

---

## 5. Porte a Nuxt

```
assets/js/materials.js            ← MATERIALS + clamp() + toCss() + toFigmaGlass()
composables/useGlassMaterial.js   ← lee del módulo, aplica los topes por instancia
components/glass/GlassSurface.vue ← props: m (material), r (radio)
assets/css/materials.css          ← --veil adaptativo + fallback @supports
```

`GlassSurface` recibe el material por prop, no por contexto: la nav pide
`m="clear"` y el menú que cuelga de ella pide `m="sheet"`. Así el mapa de esta
doc es literalmente lo que se escribe en el template.

shadcn-vue va **dentro** del slot. Al `DropdownMenuContent` se le quita el
`bg-popover` y se envuelve en `GlassSurface m="sheet"`; al `Button` primario no
se le toca — ese es sólido por decisión.

---

## 6. Pendiente

- **Decidir el nombre del material de la nav** (§2). Bloquea que se escriba en
  plantillas.
- Medir contraste real (APCA o WCAG) de cada componente sobre los tres fondos y
  sobre foto, y fijar el mínimo de velo por material en vez de estimarlo a ojo.
- Coste de composición: cada instancia es una capa con `backdrop-filter` y tres
  pases de desplazamiento. Falta medir cuántas aguanta una página de listado en
  un móvil de gama media, y de ahí sale el límite duro de instancias por vista.
- Componentes que faltan cuando avance el desarrollo: stepper de cantidad,
  selector de color, banner de cookies, barra de progreso de envío gratis,
  comparador.
---

## 7. Resuelto — el nombre del material de la nav · 2026-08-19

El §6 lo daba como pendiente y **bloqueaba escribir plantillas**, así que se
tomó la salida que este documento y el 02 recomendaban primero: **separarlos en
dos claves.**

```js
nav:   { blur: 3, lens: 26, compress: 82, sat: 1.00, bri: 0.85, veil: 0.42, aberr: 0 }
clear: { blur: 1, lens: 26, compress: 82, sat: 1.12, bri: 1.00, veil: 0.00, aberr: 3 }
```

Son **cinco** materiales y cada nombre vuelve a describir su cosa. La tabla del
§2 vuelve a estar ordenada de limpio a legible, y las tres filas del §3 marcadas
*(óptica, velo bajo)* —talla, badge, controles de galería— usan `clear` de
verdad, no una versión con velo que no querían.

Si se prefiere la otra salida (que en 20av «Clear» signifique el de 0.42), es
renombrar dos claves en `app/assets/js/materials.js` y nada más. Para eso existe
el módulo. **Está tomada, no confirmada** — dilo si prefieres la otra.

### La tabla del §3, actualizada

| Componente | Material | Estado |
|---|---|---|
| Barra de navegación | `nav` | ✅ implementado — `AppNav.vue` |
| Rail lateral | `dock` | pendiente |
| Menú desplegable | `sheet` | pendiente |
| Buscador | `regular` | pendiente |
| Barra de compra fija | `regular` | pendiente |
| Panel de filtros | `sheet` | pendiente |
| Mini-carrito | `sheet` | pendiente |
| Aviso / toast | `regular` | pendiente |
| Tallas y filtros rápidos | `clear` | pendiente |
| Badge sobre foto | `clear` | pendiente |
| Controles de galería | `clear` | pendiente |
| Tarjeta de producto (grilla) | **sólido** | pendiente |
| Tooltip | `regular` | pendiente |

Inventario completo con props y notas de implementación: `docs/10-componentes.md`.

### La regla 1 ya está cableada

«Vidrio sobre vidrio, no» no depende de que alguien se acuerde: el ítem activo
de la nav y la acción principal usan `--av-solid-bg` / `--av-solid-fg`, que son
tokens del escenario y se invierten con el fondo. Un componente que use el token
correcto no puede equivocarse de polaridad.

Lo que **sigue sin poder impedir el código** es que alguien meta un
`<GlassSurface>` dentro de otro. Eso es revisión, no tipo.
