# Artefacto 02 — LiquidGlass + fondos de marca

> ## ⚠ HISTÓRICO — no describe el código
>
> Este documento es el banco de pruebas del que salió el material, y explica
> **por qué** el material es como es: la lente, los topes, el `scale` negativo,
> el `sRGB` obligatorio y los fondos. Todo eso sigue siendo cierto y sigue
> siendo la mejor explicación que hay.
>
> Lo que **ya no** vale de aquí: los cinco materiales, el velo adaptativo y el
> glifo adaptativo. El material es uno y cerrado —«Velo negro»— y está en
> [`01-velo-negro.md`](01-velo-negro.md). El velo es negro fijo `#0E0E0F` y el
> glifo es blanco fijo al 72%. Se acabó el muestreo de luminancia.


Prototipo: `20av-liquid-glass.html` (Vue 3, self-contained, Vue inlineado).
Banco de pruebas del material: el vidrio, el fondo y el color del glifo, todo
editable en vivo. El reparto material ↔ componente está en el artefacto 03.

**Fuente única de valores: `materials.js`.** De ese módulo salen las custom
properties CSS, las variables de Figma y los props de `<GlassSurface>`. Las tablas
de este documento describen lo que hay ahí; si divergen, manda el módulo.

---

## 0. Valores canónicos — modelo Clear

Este es el estado del panel tal como quedó ajustado. Es el que se implementa.

| Parámetro | Valor | CSS | Figma |
|---|---|---|---|
| Compresión del filo | 82 | `--lg-scale: -82` | `refraction: 0.82` |
| Grosor de la lente | 26 px | `--lg-edge` | `depth: 26` |
| Aberración cromática | 0 % | `--lg-aberr` | `dispersion: 0` |
| Desenfoque | 3 px | `--lg-blur` | `radius: 3` |
| Saturación | 1.00 | `--lg-sat` | — |
| Brillo | 0.85 | `--lg-bri` | — |
| Velo | 0.42 | `--lg-tint-a` | opacidad del relleno |
| Cobertura del velo | 100 % | `--lg-tint-cover` | — |
| Filo especular | 0.50 | `--lg-spec` | `lightIntensity: 0.5` |
| Elevación | 0.80 | `--lg-elev` | `DROP_SHADOW` |
| Radio | 20 px | `--lg-r` | `cornerRadius: 20` |
| Refracción | activa | | |
| Color del glifo | blanco fijo | `--ink` | |
| Umbral de luminancia | 0.80 | | |

**`saturación` y `brillo` no cruzan a Figma.** Figma no expone saturate/brightness
sobre el backdrop. Son la única pérdida real del salto artefacto → Figma, y la
razón por la que el prototipo HTML sigue siendo la referencia de verdad.

### Esto ya no es el Clear del artefacto 03

El Clear original era **velo 0.00, blur 1, sat 1.12, aberr 3 %** — vidrio limpio,
el más transparente del mapa. Lo de arriba conserva su **óptica** (lente 26,
compresión 82) pero le mete un velo de 0.42.

Consecuencia que hay que mirar de frente: **0.42 lo vuelve el material más opaco
del sistema** — por encima de Sheet (0.34), Regular (0.12) y Dock (0.05). El mapa
del artefacto 03 ordenaba los materiales por cuánta legibilidad garantizan; con
este valor, «Clear» pasa de un extremo al otro de esa escala sin cambiar de
nombre. Funciona para la barra de navegación, que es justo lo que pedía la nota
de la página *Liquid Glass* del Figma, pero el nombre ya no describe la cosa.

Queda por decidir: renombrarlo (`nav`, `clear-nav`) y devolver `clear` a sus
valores limpios, o aceptar que en 20av «Clear» significa esto. Hasta que se
decida, `materials.js` lo tiene bajo la clave `clear`.

### La altura de la pieza cambia el material

Los dos topes de seguridad (§3) se aplican **antes** de pintar:

```
lente     ≤ 34% del lado corto
compresión ≤ 3.2 × lente
```

Para que la lente de 26 sobreviva entera hace falta **lado corto ≥ 77 px**. Por eso
el rail horizontal del prototipo mide 74 px: ahí el tope apenas roza (lente → 25.2).

En una barra de 56 px el tope muerde fuerte: **lente → 19.0 y compresión → 60.9**.
Sigue siendo un material válido, pero **ya no es el que se ajustó en el panel**. Si
la barra tiene que verse exactamente como el panel, la barra mide 77 px o más.
Es una decisión de layout, no de material.

---

## 1. La marca

Amarillo muestreado del letrero (`Captura de pantalla 20260817 160359.png`):
12,766 px amarillos, moda **#FFD600**, media #F8CB00, hue 49–52°, saturación 100%.

```css
--av-y-400:#FFD600;  /* marca */
--av-ink:#0E0E0F;    /* tinta */
--av-paper:#FBFAF7;
```

**#FFD600 no se usa como fondo plano de página.** Va como rampa, como banda
corta o como acento.

---

## 2. Fondos — rampa continua, no mancha

Tres, más la imagen que subas:

| id | nombre | uso |
|---|---|---|
| `amanecer` | Amanecer | default de tienda — papel → amarillo |
| `negro` | Negro | grafito limpio, sin nada de color |
| `oro` | Negro + oro | la variante cálida (a descartar o no) |
| `blanco` | Blanco | control: aquí el vidrio desaparece |

Los tres son **una sola rampa lineal de 9 paradas a 157°**. Nada de radiales:
un radial cierra su borde dentro del encuadre y se lee como mancha en la esquina.
La intensidad sube de una esquina a la otra, de forma continua.

```css
.av-bg--amanecer{
  background-color:#FFFCF0;
  background-image:linear-gradient(157deg,
    #FFFFFF 0%,  #FFFEFA 14%, #FFFCEF 28%, #FFF8DF 41%, #FFF3CB 54%,
    #FFECB2 67%, #FFE494 79%, #FFDC72 90%, #FFD53F 100%);
}
.av-bg--negro{
  background-color:#000000;
  background-image:linear-gradient(157deg,
    #262626 0%, #252525 14%, #232323 28%, #202020 41%, #1C1C1C 54%,
    #171717 67%, #111111 79%, #0A0A0A 90%, #000000 100%);
}
```

Las paradas se guardan **como dato, no como texto**: el mismo array pinta el CSS
y alimenta el muestreador de luminancia (§4). Si se tocan los colores, las dos
cosas quedan sincronizadas solas.

**Banding.** Una rampa amarilla de 8 bits se escalona en pantallas grandes. Se
arregla con grano al 3–6% (`feTurbulence`, `mix-blend-mode:overlay`) **debajo**
del vidrio en orden de pintado; si va encima, el `backdrop-filter` no lo recoge.

Sobre `negro` el grano hace además un segundo trabajo: **le da al vidrio algo que
refractar**. Sobre un negro plano la lente no tiene detalle que doblar y el
material desaparece aunque los parámetros estén bien.

---

## 3. El material — sólo lente

Cuatro capas, ninguna con fondo opaco:

```
.lg               radio, sombra exterior, isolation
 ├ .lg__back      backdrop-filter: url(#mapa) blur() saturate() brightness()
 ├ .lg__tint      velo
 ├ .lg__spec      filo especular + volumen interior
 └ .lg__body      el contenido
```

La refracción es un `feDisplacementMap` cuyo mapa es una rampa roja en X y una
verde en Y con el centro neutralizado (`#808080`). El desenfoque del mapa es lo
que convierte un filo duro en bisel convexo. Se regenera por instancia con un
`ResizeObserver`.

### Lo verificado en Chromium, con capturas

1. **`scale` NEGATIVO, obligatorio.** Con scale positivo el filo muestrea fuera
   del recorte del elemento; Chromium clipa la instantánea del fondo a la caja
   redondeada y devuelve transparente → aparece una banda sin filtrar del grosor
   exacto de la lente. Con scale negativo la lente comprime hacia dentro: llena
   la forma entera, y además es lo que hace un bisel convexo real.
2. **Agrandar la caja o la región del filtro no da margen de muestreo.** Probado
   con `inset:-60px` y región `x=-pad`: el resultado se desplaza y sale la misma
   banda. La instantánea siempre está recortada al elemento.
3. **`color-interpolation-filters="sRGB"` es obligatorio.** Sin él el 128 del
   mapa deja de ser neutro y toda la superficie se desplaza en diagonal.
4. **Aberración cromática:** tres pases de desplazamiento con escalas ±3%, uno
   por canal, recompuestos con `feBlend mode="screen"`. Es el fleco de color del
   filo de un vidrio real. Cuesta 3× el filtro; a partir de ~12 instancias, quitar.
   En la barra de navegación va a **0** — el fleco de color sobre tipografía de 13 px
   se lee como error de renderizado, no como material.

### Dos topes de seguridad

```js
const edge  = Math.min(material.edge, Math.min(w, h) * 0.34)
const scale = Math.min(material.strength, edge * 3.2)
```

Sin ellos una píldora de talla de 40 px se deforma entera y el número deja de
leerse. La lente no puede comerse la pieza, y la compresión no puede superar a
la lente que la produce. Ver §0 para lo que esto le hace a una barra de 56 px.

### Fallback

`backdrop-filter: url()` no existe en Safari ni Firefox. Se detecta y se cae a
`blur + saturate + specular`: se pierde la lente, el material se mantiene, y no
hay salto de layout.

---

## 4. Color adaptativo del glifo

Vidrio limpio significa que **el contraste del icono no está garantizado**: un
glifo blanco sobre el logo blanco desaparece. Es el mismo problema que resuelve
iOS haciendo que los símbolos sobre Liquid Glass cambien de color solos.

Aquí se resuelve muestreando de verdad:

1. Un canvas de **180 px de ancho** con el fondo real dibujado dentro — el
   degradado con las mismas paradas vía `createLinearGradient`, o la imagen
   subida en modo cover — y encima el letrero en su rectángulo real.
2. Cada elemento marcado `data-ink` pide la luminancia media de su propio
   rectángulo (3×3 muestras, +5 px de margen) y conmuta entre tinta y blanco.
3. **Histéresis de ±0.035** alrededor del umbral: dentro de la banda no se
   conmuta, así no parpadea al cruzar un filo. Al cambiar de fondo se decide de
   cero.
4. `transition: color .28s` — la transición es donde se nota que el material
   está vivo.

Modos: **adaptativo**, tinta fija, blanco fijo y **diferencia**
(`mix-blend-mode:difference`, contraste garantizado pero con color raro sobre
amarillo — está para comparar, no para producción).

**Estado actual: blanco fijo, umbral 0.80.** Sobre el fondo `negro` el adaptativo
no tiene nada que decidir, así que se fija y se ahorra el canvas de muestreo
completo. En el momento en que la barra flote sobre foto de producto hay que
volver a `adaptativo` — y ahí el umbral 0.80 sí importa.

Limitación conocida: el muestreo lee el fondo **sin deformar**, y el vidrio
comprime lo que hay en el filo. En el borde de un contraste fuerte la decisión
puede quedarse a un lado. Por eso los glifos llevan además halo claro + sombra
oscura: la sombra cubre el caso límite.

---

## 5. La barra: vertical y horizontal

La misma pieza en las dos orientaciones. El contenedor coloca, el vidrio sólo
se dimensiona:

```css
.railwrap.is-v{left:30px; top:50%; margin-top:-225px}
.railwrap.is-h{left:0; right:0; top:14%; display:flex; justify-content:center}
.rail.is-v{width:74px; height:450px}
.rail.is-h{height:74px}
```

Los 74 px no son arbitrarios: es la altura mínima a la que la lente de 26 casi no
toca el tope (§0). Bajar de ahí cambia el material.

Se arrastra con el ratón, y con "pasarla sobre el letrero" cruza sola — en
horizontal la pasada es vertical, para que atraviese el logo igual. Al cambiar
de orientación el componente se remonta (`:key="orient"`), lo que resetea el
arrastre y regenera el mapa con las nuevas medidas.

---

## 6. Tokens

```css
--lg-r           radio
--lg-blur        desenfoque del fondo
--lg-edge        grosor de la lente
--lg-scale       compresión del filo (va negativo al filtro)
--lg-aberr       aberración cromática (%)
--lg-sat / --lg-bri
--lg-tint-a      opacidad del velo
--lg-tint-cover  cobertura del velo — 0 = solo filos, 1 = película uniforme
--lg-spec        filo especular
--lg-elev        elevación → sombra exterior
--lg-ang         ángulo de la luz (sigue el cursor, en rAF)
--ink            color del glifo, lo escribe el muestreador
--veil           255,255,255 en fondo claro · 10,10,13 en oscuro
```

---

## 7. Porte a Nuxt

```
components/glass/GlassSurface.vue
composables/useLiquidGlass.js     ← mapa + topes de seguridad
composables/useAdaptiveInk.js     ← el canvas de muestreo + rAF
stores/useThemeStore.js           ← fondo activo, grano, material
assets/css/tokens.css
assets/js/materials.js            ← la fuente única (§0)
```

- `useAdaptiveInk` expone una directiva `v-ink`; el canvas es único para toda la
  página y se repinta en `ResizeObserver` + cambio de fondo, no por frame.
- El muestreo va a ~14 fps (cada 70 ms), no a 60: es una decisión de color, no
  una animación.
- shadcn-vue va dentro del slot. Al `Button` primario no se le toca — ese es
  sólido por decisión.
- `materials.js` exporta `toCss()`, `toFigmaGlass()` y `toFigmaShadow()`. Los dos
  últimos son el puente al efecto `GLASS` nativo de Figma, ver artefacto 04.

---

## 8. Pendiente

- Decidir el nombre del material de §0 (`clear` ajustado vs `nav` aparte).
- Decidir la altura de la barra: 56 px cómodo con el material recortado, o 77 px
  con el material exacto.
- Medir contraste real (APCA) del glifo tras la conmutación, no sólo luminancia
  del fondo: el velo y el specular también aportan.
- Muestrear el fondo **ya deformado** (leer del propio compositor) para que el
  caso límite del filo desaparezca. Hoy no hay API para eso sin volver a pintar.
- Coste: cada instancia es una capa con `backdrop-filter` + 3 pases. Falta medir
  el techo de instancias por vista en un móvil de gama media.
---

## 9. Estado en el prototipo Nuxt — 2026-08-19

Lo de arriba es el artefacto. Esto es lo que pasó al portarlo, y dónde vive
ahora cada cosa. Cuando los dos se contradigan, manda esta sección.

### Dónde vive

| Cosa | Fichero |
|---|---|
| Los números | `app/assets/js/materials.js` |
| Los fondos y el grano | `app/assets/js/backgrounds.js` |
| La lente (mapa + filtro + topes) | `app/composables/useLiquidGlass.js` |
| El muestreador del glifo | `app/composables/useAdaptiveInk.js` |
| Las cuatro capas | `app/assets/css/materials.css` |
| Los tokens | `app/assets/css/tokens.css` |
| La superficie | `app/components/glass/GlassSurface.vue` |
| Fondo activo, velo, glifo | `app/stores/useThemeStore.js` |
| El ángulo de la luz | `app/plugins/light-angle.client.js` |
| `v-ink` | `app/plugins/ink-directive.js` |

### Cuatro correcciones respecto a §2 y §4

**1. Las paradas de `negro` de §2 estaban desactualizadas.** Este documento
traía `#262626 → #000000`. El artefacto pinta lo contrario: `#050506 → #32323A`,
grafito que se ABRE hacia la esquina, igual que `amanecer`. Manda el artefacto,
y es lo que hay en `backgrounds.js`. Las cuatro rampas están ahí como dato.

**2. El id del filtro sale de `useId()`, no de un contador.** Un contador de
módulo se desincroniza entre servidor y cliente —el servidor sigue contando
entre peticiones— y como el id viaja dentro de `--lg-filter: url(#…)` en el
atributo `style`, Vue lo detecta como *hydration mismatch* en cada instancia.
Con SSR esto no es opcional.

**3. «Blanco fijo» ahora se llama `fixed` y sale del token `--ink`.** El estado
del panel era `white` fijo, correcto mientras el fondo era solo negro. En una
tienda donde el fondo cambia, un blanco escrito a mano deja la barra ilegible
sobre `amanecer`. `fixed` resuelve a blanco sobre oscuro y a tinta sobre claro
— sobre `negro` es exactamente el mismo píxel que antes—, y `white` / `ink`
siguen ahí para forzarlo. El canvas de muestreo solo se crea en `adaptive`.

**4. Lo que se pinta ENCIMA del vidrio también se invierte, y por token.**
`--veil` ya era adaptativo, pero el texto y los glifos no. Están en
`tokens.css` como `--av-on-glass`, `--av-on-glass-strong`, `--av-on-glass-hover`
y `--av-solid-bg` / `--av-solid-fg`, y los reescribe `.is-light-bg`. Así un
componente nuevo hereda la inversión sin escribir una regla por tema — que es
justo lo que se olvida cuando alguien añade el mini-carrito tres meses después.

### Dos trampas de CSS que costaron tiempo

**`:global()` en `<style scoped>` no aplicó.** Las reglas del tipo
`:global(.is-light-bg) .av-nav__link` no llegan a matchear. Un descendiente
normal —`.is-light-bg .hero__shot img`— sí funciona en scoped, porque Vue solo
marca el último selector. Pero la salida buena no era arreglar el selector: era
no tener reglas por tema en los componentes. Ver corrección 4.

**Un `z-index` de más mata el `mix-blend-mode`.** El letrero se recorta del
fondo con `mix-blend-mode: screen`. Con `z-index: 1` en `.stage__main` ese
contenedor crea un contexto de apilado, el degradado del escenario se queda
fuera del backdrop de sus hijos, y la foto vuelve a enseñar su caja negra. Va
sin `z-index`: el grano es posicionado y va antes en el DOM, así que el
contenido queda encima igual, por orden de árbol.

Y para que `screen` limpie del todo: `filter: brightness(.8) contrast(2.2)`
ANTES del blend. Los listones del rótulo no llegan a 0 por sí solos.

### Lo verificado en el prototipo

Con la barra a **46 px** —la altura decidida, ver D-03— medido en el DOM:

```
piezas              46×46 · 480×46 · 46×46    marca · píldora · acción
scale               -50.048                   = -(15.64 × 3.2) ← el tope mordió
lente               15.64                     = 46 × 0.34
feDisplacementMap   1 pase                    aberr 0 en el material `nav`
velo                10,10,13                  el del escenario, sin excepciones
```

Es decir: los dos topes de seguridad funcionan y **la barra no lleva el material
del panel entero**, lleva lo que cabe en 46 px. Eso no es una desviación del
material: es su propia regla. Una lente de 26 necesita 77 px de lado corto, y
una barra de navegación no los tiene.

Lo que **no** se hace, y se probó y se revirtió: ajustar el velo por instancia o
por la sección que pasa por debajo. El liquid es uno y estandarizado. Ver la
entrada revertida en `20-decisiones.md`.
