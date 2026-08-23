# 06 · `<ProductAccordion>` — el acordeón de productos

> ⚠️ **Estado: PLANIFICADO, no construido.** Este documento es la especificación
> para implementarlo. Todo lo demás del paquete describe código que existe; esto
> describe código que va a existir.

**Sitio:** en la landing, **justo debajo de `<ProductShowcase />`**, sustituyendo parte del banco de pruebas actual de `pages/index.vue`.
**Depende de:** `assets/js/colorways.js` · `composables/useFitText.js`
**No usa liquid glass.** Es una pieza sólida, como el showcase.

---

## 1 · Qué es

Cuatro paneles verticales de color, cada uno con un producto. Al señalar uno **se expande al 40% y los otros se reparten el 60% restante**, contrayéndose. El expandido revela el producto completo, su nombre, su precio y una acción; los contraídos dejan el producto recortado y nada más.

```
reposo        ┌────┬────┬────┬────┐      25 · 25 · 25 · 25
              └────┴────┴────┴────┘

hover en #2   ┌──┬───────┬──┬──┐         20 · 40 · 20 · 20
              └──┴───────┴──┴──┘
```

**La idea central, y de donde sale todo lo demás:** el panel contraído **recorta** el producto; al expandirse no lo escala, lo **destapa**. Es una ventana que se abre, no una foto que crece.

---

## 2 · La proporción

```
expandido  = 40%
contraído  = (100 − 40) / (n − 1)
```

| paneles | expandido | cada contraído |
|---|---|---|
| 3 | 40% | 30% |
| **4** | **40%** | **20%** ✅ el caso pedido |
| 5 | 40% | 15% |
| 6 | 40% | 12% |

**En reposo** (nadie señalado) todos valen `100/n` — con 4, un 25% cada uno.

> Con más de 5 paneles el contraído baja de 15% y el producto deja de reconocerse. **Si hace falta más catálogo, es otro componente** (una grilla), no más paneles.

---

## 3 · Interacción

| Entrada | Comportamiento |
|---|---|
| **Puntero fino** (ratón, trackpad) | `hover` expande. Al salir, vuelve a reposo. |
| **Táctil** | **Tap** expande. Segundo tap en el ya expandido → navega al producto. |
| **Teclado** | `Tab` expande vía `:focus-within`. `Enter` navega. |

### Cómo se distinguen puntero y tacto

**No con `@media (hover: hover)` sólo.** Un portátil táctil tiene las dos cosas. La regla:

```css
/* el hover expande SÓLO donde hay puntero fino */
@media (hover: hover) and (pointer: fine) {
  .pa__panel:hover { --pa-w: var(--pa-open); }
}
```

y el estado por tap vive en el script (`activo`), que funciona en las dos. **El hover no escribe estado en JS** — así el ratón no deja el acordeón "pegado" en un panel al salir.

### El doble tap

En táctil, el primer tap **expande** y el segundo **navega**. Es lo mismo que hace cualquier carrusel de producto y evita el problema clásico del hover en móvil: que el primer toque dispare la navegación sin que el usuario haya llegado a ver lo que abrió.

```js
function tocar(id) {
  if (activo.value === id) { emit('select', id); return }   // 2º tap → navega
  activo.value = id                                          // 1er tap → expande
}
```

---

## 4 · El recorte — la técnica

Esto es lo único no obvio del componente. **Copiarlo tal cual.**

El contenido de cada panel vive en una caja de **ancho fijo igual al del panel expandido**, centrada y absoluta. El panel recorta con `overflow: hidden`. Así, al contraerse, el producto se recorta simétricamente por los dos lados en vez de encogerse.

```css
.pa {
  container-type: inline-size;   /* ← la clave */
  display: flex;
  overflow: hidden;
}

.pa__panel {
  position: relative;
  overflow: hidden;
  flex: 0 0 var(--pa-w);
  transition: flex-basis .5s cubic-bezier(.22, 1, .36, 1);
}

.pa__body {
  position: absolute;
  inset-block: 0;
  left: 50%;
  transform: translateX(-50%);
  /* 40cqw = el 40% del ancho del ACORDEÓN, no del panel.
     Fijo: no encoge cuando el panel se estrecha, y por eso se recorta. */
  width: 40cqw;
}
```

**`cqw` y no `vw`:** `40vw` sólo valdría si el acordeón ocupa el ancho entero del viewport. Con `container-type: inline-size` en la raíz, `40cqw` es el 40% del acordeón sea cual sea su ancho — funciona igual dentro de un contenedor con márgenes.

> **Fallback** si hay que soportar navegadores sin container queries: `40vw` y aceptar que el componente tiene que ir a sangre.

### Por qué `flex-basis` y no `grid-template-columns`

`grid-template-columns` con `fr` también se puede transicionar hoy, pero `flex-basis` es una **longitud**: interpola en todos lados sin sorpresas y no depende de soporte reciente. La animación es la misma.

---

## 5 · Los estados del contenido

| Elemento | Contraído | Expandido |
|---|---|---|
| producto (foto) | visible, **recortado** | completo |
| texto gigante | oculto | visible |
| nombre + línea | oculto | visible |
| precio | oculto | visible |
| CTA | oculto | visible |

El texto entra con un fundido corto **y un poco de retardo** respecto al ancho: si aparece a la vez, se lee como que el texto empuja al panel. Si aparece cuando el panel ya casi terminó, se lee como consecuencia.

```css
.pa__text {
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .28s ease .18s, transform .28s ease .18s;
}
.pa__panel.is-open .pa__text { opacity: 1; transform: none; }
```

**Los 180 ms de retardo son sensación, no cálculo.** Ajustar mirando.

---

## 6 · Los datos — reutiliza `colorways.js` tal cual

Aquí está la mejor noticia del componente: **no hace falta una estructura nueva.** Una entrada de `COLORWAYS` ya trae todo lo que un panel necesita.

| Campo del colorway | Uso en el acordeón |
|---|---|
| `surface` | el color del panel |
| `word` · `wordShadow` | el texto gigante |
| `ink` · `inkSoft` · `hair` | textos y filetes |
| `accent` | el CTA |
| `frames[0].src` | la foto del producto |
| `name` · `line` · `price` | el bloque de texto |

Y `toCss(id)` ya devuelve las siete custom properties `--ps-*`.

```vue
<ProductAccordion :items="['samba-green', 'samba-night', '…', '…']" />
```

### ⚠️ PLACEHOLDER — faltan colorways

Hoy sólo existen **dos** (`samba-green`, `samba-night`) y el componente pide **cuatro**. Añadir dos entradas más a `colorways.js` es todo el trabajo de datos — el componente no se toca.

> **Ojo con una diferencia:** el showcase usa `frames[]` (seis fotos, la secuencia del scrollover). El acordeón usa **una sola**, `frames[0]`. Si en el futuro un producto del acordeón no tiene secuencia, basta con que traiga un `frames` de un elemento.

### Los tokens del panel

Se reusan los `--ps-*` en vez de inventar `--pa-*` para los colores. **Un producto tiene un color, no dos según dónde se pinte.** Los `--pa-*` quedan sólo para lo que es geometría del acordeón (`--pa-w`, `--pa-open`).

---

## 7 · Tipografía

⚠️ **Igual que el showcase, esta pieza tiene su propia escala.** Es display, no interfaz — la regla R2 (13.5/500) es de la barra y sus paneles, no de aquí.

| Elemento | Referencia de partida | Notas |
|---|---|---|
| texto gigante | como `.ps__word`: peso 900, `ls -.055em`, `lh .8` | con `useFitText`, `fill` menor — ver abajo |
| nombre | como `.ps__name`: 19px / 700 | |
| línea | como `.ps__label`: 10.5px, tono suave | |
| precio | como `.ps__price`: 14px, `tabular-nums` | |
| CTA | 11.5px, como `.ps__select` | |

### El texto gigante — una decisión tomada

**Una palabra por panel, visible sólo en el expandido.** Los contraídos quedan limpios con el producto solo.

Se reutiliza `useFitText` tal cual, pero **el `fill` no es el 0.995 del showcase**: ahí la palabra llena el frame entero; aquí llena el panel expandido, que es el 40%. Empezar en **`0.90`** y ajustar mirando — hay que dejar aire lateral o la palabra choca con el recorte del panel vecino.

### ⚠️ Regla R1 — sin versales

Las referencias muestran `APPLE` y `JORDAN` en mayúsculas. **Aquí no.** Primera mayúscula y el resto minúsculas, igual que el showcase pasó de `ADIDAS` a `Adidas`.

El texto gigante sale de `colorway.name` o de un campo `word` propio, siempre en caja de frase.

---

## 8 · El CTA

En la referencia es una píldora con flecha («Ver detalles →»).

**Sólida, no de vidrio.** Es la regla del material: *la acción principal no es de vidrio porque su contraste AA no puede depender de lo que haya detrás.* Aquí el fondo es un color sólido conocido —`--ps-surface`— así que un relleno sólido con `--ps-ink` cumple y además es más barato.

> Si se quisiera de vidrio, tendría que ser `variant="sheet"` (sin lente): son 4 instancias y sólo una visible a la vez, pero el material está calibrado para flotar sobre foto, no sobre un plano de color.

---

## 9 · Accesibilidad

- **Cada panel es un `<a>`** con su `href` real al producto. El acordeón no es una lista de botones decorativos.
- **`:focus-within` expande igual que el hover.** Sin esto, con teclado sólo se ve el panel recortado.
- **`aria-expanded`** en cada panel.
- **La foto lleva `alt`** con el nombre del producto; el texto gigante va `aria-hidden` — es decoración, y su contenido ya está en el nombre.
- **`prefers-reduced-motion`:** sin transición de `flex-basis` ni de opacidad. El cambio es instantáneo, no se elimina la funcionalidad.

```css
@media (prefers-reduced-motion: reduce) {
  .pa__panel, .pa__text { transition: none; }
}
```

---

## 10 · Móvil

Decisión tomada: **el mismo acordeón, con tap en vez de hover.** No se apila ni se convierte en carrusel.

Lo que sí cambia en teléfono:

- **El alto.** A 375 px de ancho, cuatro paneles verticales son columnas de 75 px en reposo. El alto tiene que compensar: `clamp(340px, 70vh, 560px)` como punto de partida.
- **El texto gigante probablemente sobra** en el expandido: a 150 px de ancho (40% de 375) no cabe una palabra legible. Recomendación: ocultarlo por debajo de ~640 px y dejar nombre, precio y CTA.
- **El `fill` de `useFitText`** no aplica si el texto está oculto.

---

## 11 · API propuesta

```js
defineProps({
  /** ids de colorways. 3–5 recomendado. */
  items: { type: Array, required: true },
  /** % que ocupa el expandido. El resto se reparte. */
  open: { type: Number, default: 40 },
  /** cuál arranca expandido. null = todos iguales (reposo). */
  initial: { type: String, default: null },
  /** alto de la pieza. */
  height: { type: String, default: 'clamp(340px, 70vh, 560px)' },
})

defineEmits(['select'])   // el id del colorway elegido
```

**`open` como prop y no fijo en 40:** el número salió de tu referencia, pero es el tipo de valor que se ajusta mirando. Que sea prop cuesta una línea y evita tener que tocar el CSS.

---

## 12 · Riesgos y cosas a vigilar

| Riesgo | Por qué | Mitigación |
|---|---|---|
| **Las cuatro fotos cargan siempre** | Son PNG/WebP recortados grandes. En la landing, encima del pliegue. | `loading="lazy"` en las tres no iniciales, `fetchpriority="high"` en la primera. Verificar peso — el showcase ya carga 6. |
| **`container-type` crea contenedor de layout** | Puede afectar a hijos que dependan de porcentajes del viewport. | Sólo hay contenido propio dentro. Vigilar si se añade algo. |
| **El recorte necesita `overflow: hidden`** | Y eso corta cualquier sombra o filo que quiera salirse. | El diseño de referencia no los tiene. Si se añaden, van dentro. |
| **Cuatro transiciones simultáneas de `flex-basis`** | Provoca reflow del contenedor en cada frame. | Es un flex de 4 ítems: barato. Si diera problema, pasar a `transform: scaleX()` + contra-escala del contenido — más complejo, sólo si hace falta. |
| **Solapamiento con el scrollover de arriba** | `ProductShowcase` ocupa 375vh de carril. El acordeón entra justo después. | Verificar que el `sticky` del showcase ya soltó antes de que el acordeón entre en viewport. |

---

## 13 · Orden de construcción sugerido

```
1. La rejilla y la proporción     → 4 paneles de color que se expanden al hover
2. El recorte del producto        → la foto se destapa en vez de crecer
3. El estado táctil               → tap/tap
4. El contenido del expandido     → texto, precio, CTA con su retardo
5. El texto gigante + useFitText  → el último, es el que más se ajusta mirando
6. Teclado y reduced-motion
```

Cada paso se ve funcionar solo. **El 5 es el que va a pedir más idas y venidas** — igual que pasó con la lente.

---

## 14 · Preguntas abiertas

Ninguna bloquea empezar, pero conviene resolverlas antes del paso 4:

1. **¿Los dos colorways que faltan son del mismo Samba u otros productos?** Cambia si el acordeón enseña *colorways de un modelo* (como la referencia de los Jordan y los AirPods, que son el mismo producto en 4 colores) o *productos distintos*. La referencia sugiere lo primero.
2. **¿El CTA navega al detalle del producto o filtra la tienda?** Hoy `AppNav` ya manda a `/tienda?f=…`; el acordeón podría ir a `/producto/:id`.
3. **¿Lleva título de sección encima?** Las referencias no lo muestran, pero una landing suele necesitarlo.
