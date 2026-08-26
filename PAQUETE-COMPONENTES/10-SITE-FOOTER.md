# 10 · `<SiteFooter>` — el pie

**Archivo:** `components/site/SiteFooter.vue` (~410 líneas)
**Depende de:** `assets/js/brands.js` · `assets/js/backgrounds.js`
**No usa el material.** No hay ni una `<GlassSurface>` en el pie.

```
┌──────────────────────────────────────────────────────────────────┐
│  ▟▛ 20AV        20 AVENIDA      MÉTODOS DE PAGO     MARCAS       │
│  «la mejor       Nosotros        Envíos              Adidas      │
│   variedad…»     Términos        Tiendas             Air Jordan  │
│                  Garantía        Ayuda               Nike        │
│  f ig yt tt      Contacto        FAQ                 …           │
└──────────────────────────────────────────────────────────────────┘
```

Sustituye al **banco de pruebas del scroll** que cerraba la landing —un bloque
puesto sólo para tener altura que scrollear mientras se comprobaba que la barra
fija aguantaba hasta el final. Su propio comentario decía que se borraba en
cuanto hubiera contenido real.

---

## 1 · Vive en el LAYOUT, no en la página

```
layouts/default.vue
  <main class="stage__main"> … </main>
  <SiteFooter />          ← detrás de </main>, no dentro
```

**No es preferencia de orden.** Un `<footer>` sólo es el landmark `contentinfo`
cuando **no** está metido en `<main>` ni en otra sección. Dentro de la página el
elemento seguiría siendo válido, pero un lector de pantalla dejaría de poder
saltar a él.

Y es la simetría de `<AppNav>`, que también vive arriba en el layout: **la barra
y el pie son el marco, no la landing.**

---

## 2 · El plafón es el negro del panal, y por eso tapa el escenario

```js
bg:    { type: String, default: '#050506' },
grain: { type: Number, default: GRAIN_DEFAULT },
```

El escenario trae su rampa y aquí se pisa **con motivo**: el panal es el
componente que toca al pie por arriba, y los dos plafones tienen que leerse como
**un solo bloque negro** que cierra la página. Con la rampa debajo, el pie se
aclararía justo donde el panal es más oscuro y el empalme se vería como una
costura horizontal.

### Y por eso también lleva grano

Con el mismo `GRAIN_DEFAULT` del panal. Aquí **no** cumple la función que le da
`backgrounds.js` —no hay vidrio que refracte nada— pero sí la otra:

> Dos planos del mismo color, uno con textura y otro liso, se distinguen a
> simple vista. **Mismo grano = misma superficie.**

### El color del texto va ESCRITO, no heredado

El escenario cambia a `var(--av-ink)` cuando el fondo activo es claro
(`.is-light-bg`), y esa regla llegaría hasta aquí: sobre un plafón que es negro
**siempre**, dejaría el pie con tinta negra sobre negro.

Es el mismo motivo por el que los `--av-on-glass-*` no se invierten con el fondo
(doc 04 §3).

---

## 3 · La columna de marcas sale de `brands.js`

```js
{ id: 'marcas', titulo: 'Marcas',
  enlaces: MARCAS.map(m => ({ texto: m.name, to: `/marca/${m.id}` })) }
```

Las otras dos columnas llevan su lista escrita; ésta no. `brands.js` ya es donde
vive el mapa de marcas del proyecto, y escribirlas aquí sería **la segunda lista
de marcas de la casa** — dos listas que empiezan a separarse el primer día.
Cuando entre una marca en `brands.js`, aparece aquí sola.

> **`brands.js` sigue siendo dependencia viva del proyecto por esta línea.** Se
> escribió para un rollo de marcas que después se quitó, y el pie es hoy su
> único consumidor. Si alguien lo borra creyendo que quedó huérfano, la tercera
> columna del pie se queda vacía.

---

## 4 · Los cuatro glifos de redes van dibujados a mano

Y no importados de lucide, que es de donde salen todos los demás iconos del
proyecto: **lucide 1.0 trae `facebook` e `instagram` pero ya no trae youtube ni
tiktok**. Importar dos y dibujar dos dejaría una fila de cuatro iconos con dos
trazos distintos, y en una fila corta eso se ve.

Van los cuatro en el mismo idioma que el resto de la casa —caja de 24, trazo de
2, remates redondos— así que siguen siendo la familia de lucide aunque no vengan
del paquete. Facebook e Instagram conservan su trazado original (lucide, ISC).

---

## 5 · Pendientes, todos de CONTENIDO

- **Ninguna de las rutas existe todavía.** Se dejan escritas y apuntando a dónde
  irán en vez de a `#`: el día que existan las páginas, el pie no se toca.
  Mientras tanto un clic acaba en el 404 de Nuxt, que es información honesta
  —«esto aún no está»— y no un enlace muerto que finge funcionar.
- **La segunda columna no cuadra:** se titula «Métodos de pago» y lo que cuelga
  son envíos, tiendas, ayuda y FAQ. Viene así de la referencia y se reproduce
  tal cual para no inventar contenido. O los enlaces son otros, o la columna se
  llama «Ayuda». **Decisión de contenido, no de componente.**
- **Los perfiles de redes están sin verificar.** Los `href` son los de la marca
  en Guatemala, a ojo.
