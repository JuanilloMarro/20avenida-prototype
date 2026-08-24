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
  ],
  'Navegación (doc 02)': [
    'app/components/nav/AppNav.vue',
  ],
  'Producto — showcase (doc 03)': [
    'app/components/product/ProductShowcase.vue',
    'app/composables/useScrollSequence.js',
    'app/composables/useFitText.js',
    'app/assets/js/colorways.js',
    'public/products/samba',
  ],
  'Producto — acordeón (doc 06)': [
    'app/components/product/ProductAccordion.vue',
    'app/components/product/ProductAccordionPanel.vue',
    'public/products/jordan',
  ],
  'Producto — panal (doc 07)': [
    'app/components/product/ProductHoneycomb.vue',
    'public/products/panel',
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
