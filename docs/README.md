# 20 Avenida — las bases

Documentación viva del prototipo. Se lee en este orden.

| | |
|---|---|
| [`00-arquitectura.md`](00-arquitectura.md) | Stack, estructura, dónde vive cada valor. **Empieza aquí.** |
| [`01-velo-negro.md`](01-velo-negro.md) | **El material. Único y cerrado.** Es la especificación que manda. |
| [`10-componentes.md`](10-componentes.md) | Inventario: qué existe, con qué props, qué falta. |
| [`20-decisiones.md`](20-decisiones.md) | Lo que está abierto y a quién le toca cerrarlo. |
| [`02-liquid-glass.md`](02-liquid-glass.md) | **Histórico.** El banco de pruebas del que salió el material. |
| [`03-mapa-materiales.md`](03-mapa-materiales.md) | **Histórico.** El mapa de cinco materiales, superado por el 01. |
| `_origen/` | Los artefactos tal como llegaron. No se edita. |

---

## Las dos reglas

**Un material.** «Velo negro», y no cambia por nada: ni por el componente, ni
por el fondo, ni por la sección que le pase por debajo. Un material que se
adapta al contexto deja de ser un sistema y vuelve a ser un efecto. Los valores
viven en `app/assets/css/glass.css` y de ahí los lee la lente en runtime.

**Un valor vive en un sitio.** Los colorways de producto están en
`app/assets/js/colorways.js`; los fondos, en `app/assets/js/backgrounds.js`. Si
un documento y el código divergen, manda el código — y hay que arreglar el
documento.

Los documentos 02 y 03 se conservan porque explican **por qué** el material es
como es y qué se rompió por el camino, pero ya no describen lo que hay. La
cabecera de cada uno lo dice.
