# 03 · `<ProductShowcase>` — el escaparate con scrollover

> **Guía de migración.** Todo lo que hay que saber para reconstruir esta pieza
> desde cero en el ecommerce nuevo, incluidas las decisiones que costaron y las
> que hoy están mal y hay que arreglar al pasarlas.
>
> **Archivo:** `app/components/product/ProductShowcase.vue` — 606 líneas.
> **Depende de:** `assets/js/colorways.js` · `composables/useScrollSequence.js` ·
> `composables/useFitText.js` · `<GlassSurface>` · los tokens del anfitrión (§10).

---

## 1 · Qué es

El primer bloque de la landing, a pantalla completa. Un zapato en el centro que
**gira con el scroll** mientras el resto de la composición se queda quieta.

Dos capas y tres filas, y eso es literalmente todo:

```
┌──────────────────────────────────────────────────────┐
│  FRAME DE ATRÁS · la palabra gigante, desenfocada    │
│                                                      │
│    fila 1        Mind 001 · Light Bone · Hyper…      │  ← eyebrow
│                                                      │
│    fila 2              👟  (gira)                    │  ← la secuencia
│                                                      │
│    fila 3   Original          ┌────────┐        02   │  ← info + acción
│             Mind 001          │ Comprar│   3/4 del.  │
│             95$               └────────┘    ▬▬▭▭▭▭   │
│             [Color] [Size]                           │
└──────────────────────────────────────────────────────┘
```

**La idea que lo sostiene:** el producto se enseña, la página no se agita. Ni el
texto del fondo ni las dos columnas se mueven durante el scrollover — sólo el
zapato. Si algo más se moviera, el gesto dejaría de leerse como «estoy girando
un objeto» y pasaría a ser «la página hace cosas».

---

## 2 · Proporciones de ocupación

**Medidas reales, tomadas del DOM.** Tres encuadres, porque la pieza se comporta
distinto en cada uno.

### 2.1 · La medida de diseño — `frame="fixed"`, 1440 × 1024

Es la ruta `/frame`, la de las capturas y la que va a Figma. **Ésta es la
referencia canónica**: no depende del viewport, así que es la única que se puede
comparar contra un diseño.

| zona | posición | tamaño | % del ancho | % del alto |
|---|---|---|---|---|
| **frame** | 0, 0 | 1440 × 1024 | 100 % | 100 % |
| relleno | — | 87 arriba · 57.6 lados · 40.96 abajo | 4 % lados | 8.5 % arriba |
| **fila 1** · eyebrow | y 87 | 1324.8 × 49.8 | 92 % | **4.9 %** |
| **fila 2** · banda | y 136.8 | 1324.8 × 722.8 | 92 % | **70.6 %** |
| **fila 3** · info | y 859.5 | 1324.8 × 123.5 | 92 % | **12.1 %** |
| zapato (caja) | x 360.7, y 317.3 | 718.6 × 361.8 | **49.9 %** | **35.3 %** |
| palabra (caja) | x 76.9, y 154.3 | 1286.2 × 687.8 | 89.3 % | 67.2 % |
| palabra (tinta) | — | alto 636.2 | — | 62.1 % del frame · **88 % de la banda** |
| info izquierda | x 57.6 | 556.4 × 123.5 | 38.6 % | 12.1 % |
| botón | x 638, y 939 | 164 × 44 | 11.4 % | 4.3 % |
| info derecha | x 826 | 556.4 × 65.8 | 38.6 % | 6.4 % |

**El reparto vertical en una línea:** 8.5 % de aire arriba (la barra) · 4.9 % de
eyebrow · **70.6 % de banda** · 12.1 % de info · 4 % de aire abajo.

**El reparto horizontal de la fila 3:** `1fr auto 1fr` → 38.6 % · 11.4 % · 38.6 %,
con 24 px de hueco entre las tres.

### 2.2 · Fluido en escritorio — 1280 × 720

| zona | tamaño | % del alto |
|---|---|---|
| sticky | 1265 × 720 | 100 % |
| fila 1 | 1162.6 × 49.8 | 6.9 % |
| fila 2 | 1162.6 × 430.9 | 59.9 % |
| fila 3 | 1162.6 × 123.5 | 17.2 % |
| zapato | 505.3 × 254.4 | **35.3 %** |
| palabra (tinta) | 379.3 | **88 % de la banda** |

**Dos invariantes que se conservan entre encuadres**, y son los que hay que
verificar al reconstruir:

- **el zapato ocupa siempre el 35.3 % del alto** — 361.8/1024 y 254.4/720;
- **la tinta de la palabra ocupa siempre el 88 % de la banda.**

Lo que sí cambia es la fila 1 y la 3: miden **lo mismo en píxeles** (49.8 y
123.5) a cualquier altura, porque su contenido es texto de cuerpo fijo. Por eso
su porcentaje sube cuando la ventana es más baja, y por eso la banda se
estrecha. **Esto es la causa de casi todos los bugs de esta pieza** — ver §6.

### 2.3 · Teléfono — 375 × 812

| zona | tamaño | % del alto | qué cambia |
|---|---|---|---|
| fila 1 | 343 × 53.5 | 6.6 % | — |
| fila 2 | 343 × 341.8 | 42.1 % | se encoge: la fila 3 crece |
| fila 3 | 343 × 297.3 | **36.6 %** | se apila en una columna |
| zapato | 315.5 × 158.9 | 19.6 % | **manda el ANCHO**, no el alto |
| botón | 343 × 44 | 5.4 % | ancho completo, `order: 1` |
| palabra (tinta) | 168.7 | 49.4 % de la banda | **manda el ANCHO** |

Relleno lateral: **16 px** (el mínimo del gutter). En teléfono cada píxel de
margen es alto de zapato.

---

## 3 · API

```vue
<ProductShowcase
  variant="mind-001"     <!-- id de colorways.js -->
  frame="fluid"          <!-- 'fluid' | 'fixed' -->
  :hold="55"             <!-- vh de scroll por frame -->
  :still="0"             <!-- sólo en fixed: qué frame se pinta -->
  word="Nike"            <!-- el texto del fondo -->
  eyebrow=""             <!-- fila 1; vacío = nombre · línea -->
  @buy="({ id, size }) => {}"
/>
```

| prop | tipo | por defecto | notas |
|---|---|---|---|
| `variant` | String | `DEFAULT_COLORWAY` | validado contra `COLORWAY_IDS` |
| `frame` | String | `'fluid'` | validado: `fluid` \| `fixed` |
| `hold` | Number | `55` | vh de scroll por frame extra |
| `still` | Number | `0` | ignorado en `fluid` |
| `word` | String | `'Nike'` | ⚠️ ver la deuda de §9 |
| `eyebrow` | String | `''` | vacío ⇒ `${name} · ${line}` |

**Slots:** `left` y `right` — sustituyen los dos bloques de la fila 3 cuando un
producto pida algo que no cabe en el molde.

**Evento:** `buy` con `{ id, size }`. Aquí `size` va **siempre `null`** — el
escaparate no pide talla, sus «Color» y «Size» son maquetas sin estado. La forma
se respeta igual para que la página enganche showcase, acordeón y rollo al mismo
manejador.

### Dos ejes independientes

`variant` es **qué zapato**; `frame` es **cómo se encuadra**. Se combinan sin
tocarse: cualquier colorway en cualquiera de los dos encuadres.

---

## 4 · El carril y el scroll

```
carril = 100dvh + (nº frames − 1) × hold vh
       = 100 + 5 × 55 = 375vh          ← 6 frames, hold 55
```

Medido a 1280×720: carril **2700 px**, recorrido útil **1980 px** (carril menos
viewport), 6 frames → **330 px de scroll por frame**.

Dentro, un `.ps__sticky` de `100dvh`. Mientras el carril cruza el viewport la
pieza se queda quieta y sólo cambia qué frame está visible.

### Por qué la posición del carril y no la rueda

`useScrollSequence` lee `getBoundingClientRect()` del carril y saca el progreso
de ahí. **No acumula eventos `wheel`.** Tres razones, y las tres importan:

1. funciona igual con rueda, trackpad, barra de scroll y teclado;
2. es **reversible** — si el usuario sube, el zapato gira al revés sin
   desincronizarse, que es lo que rompe cualquier acumulador;
3. no hay estado que se pueda corromper: el índice es una función pura de la
   posición.

```js
const p = clamp(-r.top / (r.height - innerHeight), 0, 1)
index = min(n - 1, floor(p * n))     // bandas iguales, última alcanzable
```

Se mide dentro de un `requestAnimationFrame` y sólo cuando el scroll cambia —
una lectura de rect por evento, que es lo más barato que hay para esto. Sin
listener por frame y sin `IntersectionObserver` por imagen.

### Por qué los frames van apilados

Los seis `<img>` están **todos en el DOM** y lo único que cambia es la opacidad.
Cambiar el `src` de un solo `<img>` parpadea la primera vez que toca cada frame,
porque la decodificación no es instantánea. Apilados, el navegador los tiene ya
decodificados y el cambio es trabajo de compositor, no de carga.

El fundido es de **90 ms**: a ese tiempo se lee como continuidad y no como
diapositiva, y no deja fantasma al scrollear rápido.

El primero lleva `fetchpriority="high"`; los otros cinco, `auto`.

---

## 5 · El encuadre del zapato

```css
.ps__seq {
  --ps-shoe-max-h: 68;   /* ⚠️ ver abajo: hoy este nombre MIENTE */
  --ps-shoe-net: 58%;
  width: min(var(--ps-shoe-net),
             calc(var(--ps-shoe-max-h) * 1.032 * var(--ps-vh)),
             910px);
}
```

**Manda el ALTO, no el ancho.** Con una sola escala para los seis frames no se
pueden elegir los dos ejes por separado, y no es una limitación de CSS sino del
objeto: un zapato visto de lado es tan largo como visto desde arriba. Fijar el
ancho del perfil fija el alto de la cenital, y al revés. Como lo que molestaba
era el alto, el alto es lo que se acota.

**El tope va en `vh` y no en `%`** a propósito: un porcentaje se mide contra el
ancho de la fila, así que en una pantalla baja y ancha el zapato volvería a
salirse por arriba. En `vh` el tope aguanta sea cual sea la proporción.

**`--ps-shoe-net` es la red para pantallas estrechas y altas**, donde el que se
pasaría es el ancho. Es una **variable y no el `58%` literal** a propósito: en
móvil hay que abrirla a `92%`, y si eso se hace reescribiendo el `width` entero
**se pierde el tope por alto** — que es justo el que salva al teléfono en
horizontal, donde sobra ancho y no hay nada de alto. **Se cambia la red, nunca
la fórmula.**

### ⚠️ El `1.032` está obsoleto y el token miente

El factor sale de convertir «alto que quiero» en «ancho que le doy», y se
calculó para **el lienzo del Samba** (1103 × 1116, casi cuadrado):

```
alto_lienzo  = --ps-shoe-max-h / 0.957        ← la cenital ocupaba el 95.7 %
ancho_lienzo = alto_lienzo × (1103/1116) = --ps-shoe-max-h × 1.032
```

Con ese lienzo, `68` significaba «68 % del alto», que es lo que dice el nombre.

**Hoy el escaparate es el Mind 001 y su lienzo es 1160 × 584** — proporción
**1.986**, muy tumbada, nada que ver con la anterior. La fórmula sigue dando el
ancho correcto pero el alto resultante ya no es 68:

```
ancho = 68 × 1.032 × vh  =  70.2 % del alto de pantalla
alto  = ancho / 1.986    =  35.3 % del alto de pantalla     ← lo medido
```

Comprobado en los dos encuadres: 718.6/1024 y 505.3/720 dan **35.3 %** clavado.

**Qué hacer al migrar.** El resultado visual está calibrado y **no hay que
tocarlo**; lo que hay que arreglar es el nombre y la derivación, porque el
siguiente que lea `--ps-shoe-max-h: 68` va a creer que el zapato ocupa el 68 %
del alto y va a ajustar a ciegas. Dos salidas:

- **la buena** — renombrar a `--ps-shoe-w` y dejar el `1.032` fuera, o
  recalcular el factor con el lienzo vigente (`1/1.986`) y que `68` vuelva a
  significar alto;
- **la mínima** — dejar los números y escribir al lado que el token es un ANCHO
  disfrazado.

---

## 6 · El texto gigante del fondo

```js
useFitText(wordEl, banda, 0.995, 0.88)
//         texto   caja    ancho  alto
```

Ajusta el `font-size` para que la palabra llene su caja **sea cual sea la
palabra**. Con un tamaño fijo en `vw`, el margen a los lados dependería de
cuántas letras tenga: «Nike» necesita casi vez y media el cuerpo de «Adidas»
para llenar el mismo ancho.

**Manda el más pequeño de los dos topes**: llena el ancho si cabe de alto, y si
no, llena el alto y deja aire a los lados. Es la regla de `contain` de toda la
vida, escrita a mano porque aquí lo que se escala es un `font-size`.

### Se mide la TINTA, no la caja de línea

`scrollHeight` es la caja de línea del elemento: para una didona son ~1.05 em
cuando la tinta —de la base de las mayúsculas al alto de mayúscula— son ~0.74.
El tope se gastaba en aire que no se ve, y el número escrito no significaba lo
que decía.

La tinta se mide con `measureText` sobre un canvas suelto:
`actualBoundingBoxAscent` y `Descent` son las cotas reales del trazado, no las
métricas declaradas de la fuente. Sin ellas se cae a `0.72`.

**Medido:** `em = 0.74`, cuerpo 859.8 px, tinta 636.2 px a 1440×1024.

### La caja es `.ps__stage` — y esto es lo que costó

El tope se midió primero contra `.ps__back`, que es **la sección entera**. Y
cualquier fracción de ese alto describe una caja que la palabra no debe
respetar: arriba está el eyebrow y abajo el nombre, el precio y los selectores.

| tope | contra | tinta | resultado |
|---|---|---|---|
| `0.86` | `.ps__back` (940) | 808 px | se come la barra, el eyebrow y medio bloque |
| `0.62` | `.ps__back` (940) | 583 px | despeja: **+39 / +30** |
| `0.62` | `.ps__back` (**720**) | 446 px | **se pasa**: +5 / **−6** |
| `0.88` | `.ps__stage` | — | despeja a 720 (**+25/+26**) y a 940 (**+34/+42**) |

**Ninguna constante sobre la sección puede funcionar**, y es estructural: los dos
textos que hay que esquivar miden lo mismo en píxeles a cualquier altura, así que
la banda libre **no es una fracción constante del alto**.

`.ps__stage` es la fila 2 de la rejilla, o sea literalmente el hueco que dejan la
fila 1 y la fila 3. **La banda deja de estimarse porque la banda es un
elemento.**

Lo que se paga: la banda respeta el margen lateral, así que la palabra deja de ir
a sangre y se alinea con el resto del contenido (102 px más estrecha a 1280).

Y `0.88` y no `0.95` por una asimetría que queda: la palabra se centra en
`.ps__back` mientras que la banda **no** está centrada en ella —el bloque de
abajo es más alto que el eyebrow—, así que el aire se agota antes por abajo.

### El desenfoque

`filter: blur(7px)` sobre un cuerpo de ~860 px: el **0.8 %** de la altura de
mayúscula. Mantiene las contraformas, así que la palabra se sigue leyendo — lo
que la convertiría en mancha es bajar el contraste o cerrar las contraformas, y
ninguna de las dos se hace. La sombra de texto se quitó: con el blur puesto sólo
aportaba suciedad.

`transform: translateY(-2%)` — baja un pelo respecto al centro óptico para que el
texto asome por arriba y por abajo del zapato, no quede tapado.

### VERSALES — la única excepción a la regla de la casa

La regla del proyecto es **primera mayúscula y el resto minúsculas**, sin
excepciones. Ésta es la única, y va escrita porque es consciente:

- **no es texto, es TEXTURA.** Lleva `aria-hidden`, ningún lector lo anuncia y a
  860 px de cuerpo detrás de un zapato hace de pared, no de título;
- en caja baja **las astas descendentes** obligan a dejar aire por abajo que
  rompe la banda.

Va por `text-transform`, **no cambiando el dato**: `word` sigue siendo el nombre
de la marca y quien decide cómo se pinta es quien lo pinta.

### El interletrado y su parche

`letter-spacing: var(--av-track-display)` (**hoy `.02em`**, positivo).

CSS aplica el interletrado **también después de la última letra**, así que la
caja no acaba donde acaba la tinta y el centrado sale torcido. El
`padding-inline-start` devuelve el mismo hueco por el otro lado.

**Ojo, que cambió de lado.** Con el trazo negativo que hubo antes la caja se
quedaba corta por la derecha y el parche era `padding-inline-end`. Con el trazo
positivo la caja se pasa por la derecha y lo que hay que añadir va al principio.
Mismo problema, lado contrario. Los dos leen el mismo token, así que si uno
cambia, cambian los dos.

### ⚠️ El comentario de la fuente está obsoleto

El CSS dice «PLAYFAIR DISPLAY … es una didona». **Ya no.**
`--av-font-display` es hoy **Bebas Neue** (condensada de palo seco, con reservas
`Roboto Condensed` / `Arial Narrow`). El cambio se hizo en otra sesión y el
comentario se quedó atrás. Al migrar: **borrar ese párrafo**, no copiarlo.

---

## 7 · La fila 3

```css
grid-template-columns: 1fr auto 1fr;   /* NO 1fr 1fr 1fr */
align-items: end;
gap: 24px;
```

Los dos `1fr` de los lados son iguales entre sí, así que el hueco de en medio
queda centrado en el frame pase lo que pase. Y como mide `auto`, **el botón ocupa
lo que ocupa su texto** y no estira ni encoge.

Con tres tercios el botón se centraría igual, pero el suyo sería un tercio de
pantalla: en 1440 eso son 440 px de caja para 130 de texto, y el `justify-self`
lo volvería a apretar — estaríamos describiendo dos veces la misma medida.

**El botón va en la fila y no flotando**, y es la diferencia entre estar centrado
y estar en medio: en su hueco de la rejilla comparte línea de base con el precio
y con el contador, así que el borde inferior de la composición sigue siendo uno.
En absoluto quedaría encima de la fila y taparía a alguien al estrechar.

**Es de VIDRIO**, como los otros cuatro botones de la casa, y con las medidas del
sistema (`--av-action-*`: 164 × 44, relleno 20, cuerpo 13.5, glifo 16, hueco 9).
Fue de tinta maciza del colorway y se cambió: en una página donde «Comprar ahora»
aparece en tres piezas seguidas, tener uno macizo y dos de vidrio los convierte
en tres botones distintos. Lo que se pierde es que ya no se invierte con el
zapato — y no hace falta, porque sobre el velo negro el texto es claro siempre.

---

## 8 · Breakpoints

### `max-width: 560px` — estrecho

**560 y NO los 900 del dock**, y confundirlos costaba caro: el dock aparece
cuando la barra de arriba no cabe, pero las dos columnas de la fila 3 se apilan
cuando no hay **ancho** para dos columnas. Un teléfono en horizontal mide 844 de
ancho — entra por el corte del dock, pero le sobra ancho para las dos columnas, y
apilándolas la fila pasaba de 120 px a 225 y se comía el poco alto que hay.

Qué cambia: la red del zapato se abre a `92%` (**sólo la red**, la fórmula no se
toca) · la fila 3 pasa a una columna · el botón se va al final (`order: 1`) y a
ancho completo.

**El botón a ancho completo** porque en un teléfono el pulgar no apunta, barre — y
de paso su borde coincide con el del nombre y el del precio en vez de quedar
centrado a ojo.

### `frame="fixed"` — la medida de diseño

```css
.ps--fixed { --ps-pad-x: 57.6px; --ps-vh: 10.24px; }
```

1440 × 1024 exactos. Sus medidas **no pueden depender del viewport**: con el
navegador estrecho, los cortes de arriba le metían el margen de teléfono dentro
de un lienzo de 1440, y una captura así miente.

**Va DESPUÉS de los `@media`** a propósito: misma especificidad, gana el último.
Los de dentro necesitan un descendiente porque compiten con reglas de la misma
forma.

### `prefers-reduced-motion`

La secuencia deja de depender del scroll y se queda en el primer frame. El resto
de la composición no cambia. Se quita el movimiento, no la funcionalidad.

---

## 9 · Los colorways y los assets

El colorway trae **el color y la secuencia**: `surface`, `word`, `ink`,
`ink-soft`, `hair`, `accent`, más `name`, `line`, `price`, `sizes` y `frames`.
`toCss(id)` los vuelca como `--ps-*` en la raíz de la sección.

**El del escaparate es el Nike Mind 001.** Valores vigentes:

| token | valor |
|---|---|
| `--ps-surface` | `#E9DED2` |
| `--ps-word` | `#8A3B22` |
| `--ps-ink` | `#2C1E17` |
| `--ps-ink-soft` | `rgba(44, 30, 23, .60)` |
| `--ps-hair` | `rgba(44, 30, 23, .22)` |
| `--ps-accent` | `#EC4A29` |

### ⚠️ Deuda: la marca está en dos sitios

`word="Nike"` es un prop con valor por defecto, y el colorway es otro. Si se
cambia el colorway por defecto **hay que acordarse de cambiar el `word`**. Al
migrar, la marca debería salir del propio colorway y este prop quedarse sólo como
sobreescritura.

### El orden de los frames

**No es alfabético ni casual: las tomas vienen numeradas en el orden de la
órbita**, así que `S1..S6` ya es la vuelta. No hay nada que reordenar y no se
debe — cualquier permutación rompe el giro.

```
01 Perfil exterior   ← el que se ve antes de tocar el scroll
02 3/4 delantero
03 Puntera
04 Perfil interior
05 3/4 trasero
06 Talón
```

**Arranca en el perfil y no en la puntera**, aunque la puntera cierre la vuelta:
el perfil es el único encuadre donde se leen a la vez la silueta de cuña, el
swoosh y los nodos naranjas.

### Los assets

```
public/products/mind001/01.webp … 06.webp     caja unión 1160×584
```

Los arma `scripts/build-mind001.py` desde `resources/sneakers sin fondo/`.
**Los seis vienen ya recortados, con alfa. El script no recorta: encuadra.**

Tres pasos:

1. **recorta cada frame a su TINTA** — umbral de alfa en `> 8` y no en `> 0`: el
   recorte deja un halo casi transparente de un par de píxeles, y midiendo desde
   0 la caja crece distinto en cada foto, que es el salto que la caja unión
   existe para evitar;
2. **normaliza el ALTO** de la puntera y el talón (`ALTO_REF = 900`). Están
   disparadas mucho más cerca: la tinta de un perfil mide 768 px y la de la
   puntera 1583, más del doble. Por el **alto** y no por el ancho porque la
   cámara orbita sobre un eje vertical y lo único que no cambia en ese giro es la
   altura;
3. **caja unión**, pegando todo **centrado en los dos ejes** — la cámara orbita
   alrededor del zapato, así que lo que tiene que quedarse quieto es su centro.
   Alineando por la suela, el talón subía y bajaba.

> **La regla del material de partida:** si la fuente trae alfa, se respeta tal
> cual. No se le añade color, ni sombra, ni se le vuelve a recortar. Hubo un
> recorte a mano para `S2` —inundación desde los bordes más la envolvente de los
> nodos naranjas de la suela— y nunca quedó limpio: dejaba un halo gris bajo la
> suela y un parche claro detrás. Se borró entero.

**La sombra la pone el CSS**, no la foto: dos `drop-shadow`, una corta y densa
que ancla el zapato al suelo y otra larga y difusa que lo separa del fondo. Una
sola sombra media se lee como mancha gris — el gris no viene de que sea poco
negra, viene de que su borde tiene la misma dureza en todo el recorrido.

---

## 10 · Lo que le pide al anfitrión

**Tokens CSS** — sin ellos la pieza se monta pero se descoloca:

| token | hoy | para qué |
|---|---|---|
| `--av-gutter` | `clamp(16px, 4vw, 64px)` | margen lateral |
| `--av-nav-space` | `87px` | hueco de la barra fija, arriba |
| `--av-track` | `.05em` | interletrado del texto normal |
| `--av-track-display` | `.02em` | el de la palabra gigante **y su parche** |
| `--av-font-display` | Bebas Neue | la palabra gigante |
| `--av-action-*` | 164/44/20/13.5/9/16 | medidas del botón del sistema |
| `--av-on-glass-strong` | `#FFFFFF` | tinta sobre el vidrio |

**Componentes:** `<GlassSurface>` (el botón).
**Composables:** `useScrollSequence`, `useFitText`.
**Datos:** `colorways.js` con `toCss()`.

---

## 11 · Qué revisar al reconstruir

Una lista corta de cosas que **se rompen en silencio** y no dan error:

- [ ] **El zapato mide el 35.3 % del alto** en `fixed` y en `fluid`. Si no, la
      fórmula del `min()` se tocó o el lienzo cambió de proporción.
- [ ] **La tinta de la palabra mide el 88 % de la banda** y despeja por arriba y
      por abajo a 720, 940 y 1080. Si a alguna altura se mete en un texto, el
      ajuste está midiendo contra `.ps__back` otra vez.
- [ ] **El carril mide 375vh** con 6 frames y `hold: 55`.
- [ ] **Los seis frames comparten lienzo.** Si uno viene de otro recorte, el
      zapato pega un salto de tamaño al girar hacia él.
- [ ] **`--ps-shoe-net` se cambia; la fórmula no.** Reescribir el `width` entero
      en móvil pierde el tope por alto y rompe el teléfono en horizontal.
- [ ] **El bloque `.ps--fixed` va al final del `<style>`.** Si sube por encima de
      los `@media`, la medida de diseño hereda el margen de teléfono.
- [ ] **El primer `<img>` va en flujo** (`.is-flow`) y los otros cinco en
      absoluto. Es el que le da el alto a la caja.
- [ ] El `padding-inline-start` de la palabra **acompaña al signo del
      interletrado**. Si el trazo vuelve a negativo, el parche cambia de lado.
