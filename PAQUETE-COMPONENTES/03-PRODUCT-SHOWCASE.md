# 03 · `<ProductShowcase>` — el zapato con scrollover

**Archivo:** `components/product/ProductShowcase.vue` (420 líneas)
**Depende de:** `assets/js/colorways.js` · `composables/useScrollSequence.js` · `composables/useFitText.js`
**No depende del material liquid glass.** Es una pieza sólida, independiente.

---

## 1 · Qué es

Dos capas y tres filas. Eso es todo.

```
FRAME DE ATRÁS      el texto gigante de marca. Nada más.
FRAME DE ENFRENTE
  fila 1   texto corto, centrado en horizontal y en vertical
  fila 2   el zapato — se monta sobre el texto del fondo
  fila 3   dos columnas: info izquierda · info derecha
```

**El scrollover:** un carril alto con la pieza `sticky` dentro. Mientras el carril cruza el viewport la composición se queda quieta y **lo único que gira es el zapato**. El texto gigante y las dos columnas no se mueven — es el producto el que se enseña, no la página la que se agita.

---

## 2 · API

```js
defineProps({
  variant: String,   // el colorway. default 'samba-green'
  frame:   String,   // 'fluid' | 'fixed'. default 'fluid'
  hold:    Number,   // vh de scroll por frame. default 55
  still:   Number,   // sólo en 'fixed': qué frame se pinta. default 0
  word:    String,   // el texto gigante. default 'Adidas'
  eyebrow: String,   // fila 1. default: `${name} — ${line}`
})
```

Con slots `left` y `right` para los dos bloques de info, cuando un producto pida algo que no cabe en el molde.

### Dos ejes independientes

- **`variant`** = el colorway (color del frame, tono del texto gigante, tinta, acento, secuencia de frames). Añadir un zapato es añadir una entrada en `colorways.js`, **sin tocar el componente**.
- **`frame`** = `'fluid'` ocupa el viewport y hace el scrollover · `'fixed'` fuerza **1440×1024 exactos** y un solo frame — la medida de diseño, para capturas y para llevarlo a Figma.

> La ruta `/frame` del prototipo renderiza el modo `fixed`. `?v=samba-night` cambia el colorway, `?f=3` el frame.

---

## 3 · El carril y el scroll

```js
// altura del carril
height: calc(100dvh + (frames - 1) * hold vh)
```

Con **6 frames y `hold: 55`** son **375 vh**: 100 de pieza fija + 275 de recorrido, 55 por frame.

### Por qué así y no interceptando la rueda

El progreso sale de la **posición del carril** (`getBoundingClientRect`), no de un acumulador de eventos `wheel`. Consecuencias, y las tres importan:

1. Funciona igual con rueda, trackpad, barra de scroll **y teclado**.
2. Es **reversible**: si el usuario sube, el zapato gira al revés sin desincronizarse.
3. Se mide en un `rAF` y sólo cuando el scroll cambia — una lectura de rect por evento, que es lo más barato que hay para esto. **No hay listener por frame ni IntersectionObserver por imagen.**

### Por qué los frames van apilados

Los seis `<img>` están todos en el DOM y sólo se conmuta la opacidad.

> Cambiar el `src` de un solo `<img>` **parpadea la primera vez que toca cada frame**, porque la decodificación no es instantánea. Apilados, el navegador los tiene ya decodificados y el cambio es un compositor, no una carga.

El fundido es de **`.09s linear`**: a 90 ms lee como continuidad, no como diapositiva, y no deja fantasma al scrollear rápido.

El primer frame lleva `fetchpriority="high"` y es el único en flujo (`is-flow`) — los otros cinco van absolutos encima.

---

## 4 · El encuadre del zapato — la cuenta

Esta es la parte que más cuesta reconstruir de memoria. **Copiarla tal cual.**

```css
.ps__seq {
  --ps-shoe-max-h: 68;   /* % del alto de pantalla que NO pasa ningún frame */
  --ps-shoe-net: 58%;    /* red por ancho — lo único que cambia en móvil */
  width: min(
    var(--ps-shoe-net),
    calc(var(--ps-shoe-max-h) * 1.032 * var(--ps-vh)),
    910px
  );
}
```

### De dónde sale el 1.032

Con una sola escala para los seis frames no se pueden elegir los dos ejes por separado, **y no es una limitación del CSS sino del zapato**: la tinta del perfil mide 1055 px de ancho y la de la cenital 1068 de alto. Son casi el mismo número —un zapato visto de lado es tan largo como visto desde arriba— así que fijar el ancho del perfil fija el alto de la cenital, y al revés.

Como lo que molestaba era el alto, **el alto es lo que se acota**. La cenital es la que decide: su tinta ocupa el **95.7%** del alto del lienzo.

```
alto_lienzo  = --ps-shoe-max-h / 0.957
ancho_lienzo = alto_lienzo × (1103/1116)      ← proporción del lienzo
             = --ps-shoe-max-h × 1.032
```

### Dos decisiones que parecen detalles

- **El tope va en `vh` y no en `%`.** Un porcentaje se mide sobre el ancho de la fila, así que en una pantalla baja y ancha el zapato volvería a salirse por arriba. En `vh` el tope aguanta sea cual sea la proporción.
- **`--ps-shoe-net` es una VARIABLE y no el `58%` literal.** En móvil hay que abrir la red (a `92%`), y si eso se hace reescribiendo el `width` entero **se pierde el tope por alto** — que es justo el que salva al teléfono en horizontal, donde sobra ancho y no hay nada de alto. **Se cambia la red, nunca la fórmula.**

---

## 5 · El texto gigante del fondo

```css
.ps__word {
  font-size: 26vw;          /* sólo el punto de partida */
  font-weight: 900;
  letter-spacing: -.055em;
  padding-inline-end: .055em;
  line-height: .8;
  white-space: nowrap;
  color: var(--ps-word);
  filter: blur(var(--ps-word-blur, 7px));
}
```

### `useFitText` — por qué existe

Con un `font-size` fijo en vw **el margen a los lados depende de cuántas letras tenga la palabra**: «Adidas» deja un hueco y «Nike» dejaría el doble. Midiendo y reescalando por regla de tres, el texto llena siempre el mismo porcentaje del ancho (`fill: 0.995`), diga lo que diga.

Se mide con el tamaño actual y se reescala proporcionalmente: así **no depende de la tipografía** que acabe usándose ni de su ancho de trazo.

Se repite cuando cambia el tamaño de la caja **y cuando terminan de cargar las fuentes web** — medir antes de que llegue la fuente definitiva da el número de la fuente de reserva, que es otra.

### El `padding-inline-end: .055em`

CSS aplica el `letter-spacing` **también después de la última letra**, así que la caja acaba .055em antes que la tinta: centrada, dejaba margen a la izquierda y se comía la última letra por la derecha. Este padding devuelve ese hueco. Va en `em` para que escale con el tamaño que le ponga `useFitText`.

### El desenfoque de 7 px

Para que el foco se lo lleve el zapato. **Un blur uniforme y nada más:** mantiene las contraformas de las letras, así que la palabra se sigue leyendo — a 344 px de cuerpo, 7 px son el **2% de la altura de mayúscula**.

Lo que la convertiría en mancha es bajarle el contraste o subir el blur hasta cerrar las contraformas. **Ninguna de las dos se hace aquí.**

---

## 6 · Tipografía de la pieza

⚠️ **El showcase tiene su propia escala**, distinta de la del nav. Es una pieza de **display**, no de interfaz.

| Clase | Tamaño | Peso | Notas |
|---|---|---|---|
| `.ps__word` | 26vw → ajustado | 900 | `ls -.055em` · `lh .8` |
| `.ps__eyebrow p` | 14px | 500 | `ls .06em` |
| `.ps__label` | 10.5px | — | `ls .04em` · tono suave |
| `.ps__name` | 19px | 700 | `ls -.02em` |
| `.ps__price` | 14px | — | `tabular-nums` |
| `.ps__select` | 11.5px | — | `ls .03em` · borde 1px |
| `.ps__index` | 44px | 800 | `ls -.04em` · `tabular-nums` |
| `.ps__line` | 10.5px | — | `ls .04em` · `min-height: 1em` |

**Regla R1 aplicada:** todo esto llevaba `text-transform: uppercase` con trazos de `.42em`, `.2em`, `.18em` y `.12em`. Se quitaron las versales **y con ellas el trazo ancho** — ese aire estaba para separar mayúsculas y en minúscula descose la palabra. Los `ls` de la tabla son los ya corregidos.

El texto gigante pasó de `ADIDAS` a **`Adidas`** por la misma regla.

---

## 7 · Medidas del frame

```css
.ps {
  --ps-pad-x: clamp(24px, 4vw, 64px);   /* margen lateral */
  --ps-vh: 1vh;                          /* unidad de alto */
}
```

**Por qué `--ps-vh` es variable y no `vh` a pelo:** en modo `fixed` el alto se pina a 1024 px, así que la fórmula del zapato tiene que medir sobre el frame y no sobre la ventana.

### Modo `fixed` — los tres números

```css
.ps--fixed {
  width: 1440px; height: 1024px;
  --ps-pad-x: 57.6px;    /* 4% de 1440 — el mismo número que da el clamp */
  --ps-vh: 10.24px;      /* 1% de 1024 — el alto del frame, no el de la ventana */
}
```

### Móvil (`max-width: 640px` aprox.)

```css
.ps { --ps-pad-x: 16px; }
.ps__seq { --ps-shoe-net: 92%; }   /* se abre la red, la fórmula no se toca */
.ps__info { grid-template-columns: 1fr; }
```

---

## 8 · Los colorways

Un colorway es **un objeto**. Añadir un zapato es añadir una entrada, no tocar el componente.

```js
'samba-green': {
  name: 'Samba OG',
  line: 'Collegiate Green · Off White · Gum',
  surface:    '#DCE5DA',                  // el color sólido del frame
  word:       '#37624E',                  // el texto gigante
  wordShadow: 'rgba(22, 38, 31, .10)',
  ink:        '#16261F',
  inkSoft:    'rgba(22, 38, 31, .60)',
  hair:       'rgba(22, 38, 31, .22)',
  accent:     '#F0D24B',
  frames:     SAMBA_FRAMES,
  details:    SAMBA_DETAILS,
  price:      '120$',
}
```

Los tonos están **muestreados de la foto real** del Samba OG: ante verde colegial, tres bandas hueso, suela de goma y el «Samba» amarillo.

`samba-night` es la misma pieza en oscuro. **Existe para demostrar que el componente es una plantilla y no un dibujo:** cambia el colorway, no el template.

`toCss(id)` convierte el objeto en las siete custom properties `--ps-*` que consume el CSS.

### El orden de los frames

```js
01  3/4 delantero      ┐
02  Perfil exterior    │ la cámara da la vuelta
03  3/4 trasero        │
04  Perfil interior    ┘
05  Cenital            ┐ y luego lo vuelca
06  Suela              ┘
```

**El orden NO es el de los ficheros originales: es el de la rotación.** Cambiar el orden es reordenar este array y nada más.

### Las dos fotos que NO están en la secuencia

`detail-1` y `detail-2` van en `details`, no en `frames`, **y no es una preferencia**: son macros que sangran hasta el borde del encuadre (su caja de contenido es la imagen entera). Metidas en la secuencia obligarían al encuadre común a ser el frame completo y **encogerían los otros seis**. Van a una galería futura.

---

## 9 · Assets necesarios

```
public/products/samba/01.webp … 06.webp     la secuencia
public/products/samba/detail-1.webp
public/products/samba/detail-2.webp
```

Ya vienen **recortados sobre transparente**. El script que lo hizo es `scripts/cutout-bg.py`.

---

## 10 · Qué revisar al reconstruir

- [ ] Los seis frames tienen que compartir **el mismo lienzo** (misma caja unión). Si un asset nuevo tiene otra caja, la fórmula del §4 deja de valer.
- [ ] Verificar `--ps-shoe-max-h` con el nuevo producto: el 68 sale de que **ningún frame** pase ese alto.
- [ ] El `hold: 55` es sensación, no cálculo. Con más de 6 frames el carril se hace muy largo — considerar bajarlo.
- [ ] `prefers-reduced-motion`: hoy el fundido de .09s ya es casi imperceptible, pero el scrollover en sí no está desactivado. **Decidir qué hacer.**
