/**
 * Arma la carga del paquete: copia a `PAQUETE-COMPONENTES/codigo/` los archivos
 * que el doc 05 manda copiar, con su estructura de carpetas intacta.
 *
 *   node PAQUETE-COMPONENTES/empaquetar.mjs
 *
 * POR QUÉ ESTO EXISTE, que es lo único no obvio:
 *
 * El paquete tenía una contradicción. El doc 00 decía «copia la carpeta
 * PAQUETE-COMPONENTES/ completa» y el doc 05 listaba rutas del prototipo — así
 * que quien copiaba sólo la carpeta se quedaba con el porqué y sin el código, y
 * quien copiaba el repo entero se llevaba también lo que el doc 05 marca como
 * NO copiar.
 *
 * La alternativa era commitear los archivos duplicados dentro del paquete, y eso
 * garantiza deriva: dos copias del mismo componente que se separan en cuanto
 * alguien toca una. Generarlos justo antes de entregar no puede derivar nunca —
 * la única fuente de verdad sigue siendo `app/`.
 *
 * `codigo/` está en `.gitignore` a propósito. No es un artefacto que se guarda,
 * es uno que se produce.
 */
import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI  = dirname(fileURLToPath(import.meta.url))
const RAIZ  = resolve(AQUI, '..')
const SALIDA = join(AQUI, 'codigo')

/* La lista, agrupada como en el doc 05. Las rutas son relativas a la raíz del
   prototipo, no a `app/`, para que los assets de `public/` entren en la misma
   lista sin excepciones. */
const CARGA = {
  'Núcleo — el material (doc 01)': [
    'app/assets/css/glass.css',
    'app/components/glass/GlassSurface.vue',
    'app/composables/useGlassLens.js',
    'app/lib/glass-variants.js',
  ],
  'Escenario (doc 04)': [
    'app/assets/css/tokens.css',
    'app/assets/js/backgrounds.js',
    'app/stores/useThemeStore.js',
    'app/components/brand/BrandMark.vue',
    'public/brand/letrero-20av-cut.webp',
    /* El orden de pintado —rampa, grano, contenido, capa flotante— y el sitio
       donde se montan la barra y el pie. Faltaba, y sin él el material se ve mal
       aunque sus tokens estén bien: es el síntoma que el doc 04 §1 manda
       comprobar antes que ningún otro. */
    'app/layouts/default.vue',
  ],
  'Navegación (doc 02)': [
    'app/components/nav/AppNav.vue',
  ],
  'Producto — showcase (doc 03)': [
    'app/components/product/ProductShowcase.vue',
    'app/composables/useScrollSequence.js',
    'app/composables/useFitText.js',
    'app/assets/js/colorways.js',
    /* LA SECUENCIA, que faltaba: el escaparate es el Mind 001 y sin sus seis
       frames la pieza se monta vacía. Se copiaba `samba` y no esto. */
    'public/products/mind001',
    'scripts/build-mind001.py',
    /* Los Samba se quedan: los sigue usando `/frame` y son la otra caja unión
       de referencia. */
    'public/products/samba',
  ],
  /* LAS FOTOS DEL ACORDEÓN SON LAS NEW BALANCE, no los Jordan. Cambió al pasar
     el acordeón a `nb-sea-salt`/`nb-mushroom`/`nb-dark-mushroom`/`nb-angora`, y
     `public/products/jordan` se quedó aquí copiándose para nadie. Los Jordan
     siguen en el prototipo por si vuelven, pero no viajan en el paquete. */
  'Producto — acordeón (doc 06)': [
    'app/components/product/ProductAccordion.vue',
    'app/components/product/ProductAccordionPanel.vue',
    'public/products/nb9060',
    'scripts/build-nb9060.py',
  ],
  'Producto — panal (doc 07)': [
    'app/components/product/ProductHoneycomb.vue',
    'public/products/panel',
  ],
  /* EL CATÁLOGO VA CON EL ROLLO y no repetido en el díptico, aunque lo usen los
     dos: `sneakers.js` y sus catorce recortes son UNA cosa, y copiarla dos veces
     produciría dos carpetas iguales en el paquete. El díptico depende de lo que
     trae el rollo — está dicho en el doc 09. */
  'Producto — rollo (doc 08)': [
    'app/components/product/ProductReel.vue',
    'app/assets/js/sneakers.js',
    'public/products/sneakers',
    'scripts/build-sneakers.py',
  ],
  'Producto — díptico (doc 09)': [
    'app/components/product/ProductDiptych.vue',
    'public/products/diptico',
  ],
  /* El pie es la única pieza del paquete que no usa el material. Y es el único
     consumidor que le queda a `brands.js`, que se escribió para un rollo de
     marcas que después se quitó — no está huérfano aunque lo parezca. */
  'El pie (doc 10)': [
    'app/components/site/SiteFooter.vue',
    'app/assets/js/brands.js',
  ],
}

await rm(SALIDA, { recursive: true, force: true })

let archivos = 0
let faltan = 0

for (const [grupo, rutas] of Object.entries(CARGA)) {
  console.log('\n' + grupo)
  for (const ruta of rutas) {
    const origen = join(RAIZ, ruta)
    const destino = join(SALIDA, ruta)
    let info
    try {
      info = await stat(origen)
    } catch {
      console.log('  FALTA  ' + ruta)
      faltan++
      continue
    }
    await mkdir(dirname(destino), { recursive: true })
    await cp(origen, destino, { recursive: true })
    const marca = info.isDirectory() ? '(carpeta)' : (info.size / 1024).toFixed(1) + ' KB'
    console.log('  ok     ' + ruta.padEnd(50) + marca)
    archivos++
  }
}

console.log('\n' + '─'.repeat(64))
console.log(archivos + ' entradas copiadas a PAQUETE-COMPONENTES/codigo/')
if (faltan) {
  console.log(faltan + ' NO SE ENCONTRARON — el manifiesto del doc 05 está desfasado.')
  process.exitCode = 1
}
