/**
 * useScrollSequence — el scroll mueve el zapato.
 *
 * Un carril alto con una pieza `sticky` dentro: mientras el carril pasa por el
 * viewport, la pieza se queda quieta y lo único que cambia es qué frame se ve.
 * El progreso sale de la posición del carril, no de un acumulador de eventos
 * `wheel` — así funciona igual con rueda, con trackpad, con barra de scroll y
 * con teclado, y sobre todo es *reversible*: si el usuario sube, el zapato gira
 * al revés sin desincronizarse.
 *
 * Se mide en un rAF y solo cuando el scroll cambia. No hay listener por frame
 * ni IntersectionObserver por imagen: es una lectura de `getBoundingClientRect`
 * por evento de scroll, que es lo más barato que hay para esto.
 *
 * Los frames se apilan todos en el DOM y se conmuta la opacidad. Cambiar el
 * `src` de un solo <img> parpadea la primera vez que toca cada frame, porque la
 * decodificación no es instantánea; apilados, el navegador los tiene decodifica-
 * dos y el cambio es un compositor, no una carga.
 */

export function useScrollSequence(trackRef, count) {
  const index = ref(0)
  const progress = ref(0)

  let raf = 0
  let pending = false

  function measure() {
    pending = false
    // toValue, no unref: `count` llega como getter y `unref` de una función
    // devuelve la función, no su valor — y el índice sale NaN.
    const el = toValue(trackRef)
    const n = toValue(count)
    if (!el || !n) return

    const r = el.getBoundingClientRect()
    const travel = r.height - window.innerHeight
    if (travel <= 0) { progress.value = 0; index.value = 0; return }

    const p = Math.min(1, Math.max(0, -r.top / travel))
    progress.value = p
    // bandas iguales por frame, y la última alcanzable al llegar al final
    index.value = Math.min(n - 1, Math.floor(p * n))
  }

  function schedule() {
    if (pending) return
    pending = true
    raf = requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (raf) cancelAnimationFrame(raf)
  })

  return { index, progress, measure: schedule }
}
