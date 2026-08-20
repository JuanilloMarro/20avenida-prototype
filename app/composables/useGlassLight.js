/**
 * useGlassLight — la luz sigue al ratón.
 *
 * Un único listener global y un requestAnimationFrame para todas las
 * superficies. Cada una calcula el ángulo DESDE SU PROPIO CENTRO hacia el
 * puntero, así que dos piezas en sitios distintos de la pantalla reciben la luz
 * desde ángulos distintos — que es lo que hace que se lea como cristal físico y
 * no como un degradado pegado.
 */
import { onMounted, onBeforeUnmount, unref } from 'vue'

const nodes = new Set()
let raf = 0
let mx = 0
let my = 0
let bound = false

function apply() {
  raf = 0
  for (const el of nodes) {
    const r = el.getBoundingClientRect()
    if (!r.width) continue
    const a = Math.atan2(my - (r.top + r.height / 2),
                         mx - (r.left + r.width / 2)) * 180 / Math.PI + 90
    el.style.setProperty('--lg-ang', a.toFixed(1) + 'deg')
  }
}

function onMove(e) {
  mx = e.clientX
  my = e.clientY
  if (!raf) raf = requestAnimationFrame(apply)
}

export function useGlassLight(elRef) {
  onMounted(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = unref(elRef)
    if (!el) return
    nodes.add(el)
    if (!bound) {
      window.addEventListener('pointermove', onMove, { passive: true })
      bound = true
    }
  })

  onBeforeUnmount(() => {
    const el = unref(elRef)
    if (el) nodes.delete(el)
    if (bound && nodes.size === 0) {
      window.removeEventListener('pointermove', onMove)
      bound = false
    }
  })
}
