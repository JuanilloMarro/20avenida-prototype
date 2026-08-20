/**
 * useFitText — ajusta el tamano de letra para que UNA linea llene su caja.
 *
 * Para el texto gigante del frame de atras. Con un `font-size` fijo en vw el
 * margen a los lados depende de cuantas letras tenga la palabra: "ADIDAS" deja
 * un hueco y "SAMBA" dejaria el doble. Midiendo y reescalando, el texto llena
 * siempre el mismo porcentaje del ancho, diga lo que diga.
 *
 * Se mide con el tamano actual y se reescala por regla de tres: asi no depende
 * de la tipografia que acabe usandose, ni de su ancho de trazo.
 *
 * Se repite cuando cambia el tamano de la caja y cuando terminan de cargar las
 * fuentes web: medir antes de que llegue la fuente definitiva da un numero de la
 * fuente de reserva, que es otra.
 */
export function useFitText(textRef, boxRef, fill = 0.99) {
  let ro = null

  function fit() {
    const el = toValue(textRef)
    const box = toValue(boxRef)
    if (!el || !box) return
    const target = box.clientWidth * fill
    if (!target) return

    // medir con el tamano que tenga puesto ahora mismo
    el.style.fontSize = ''
    const base = parseFloat(getComputedStyle(el).fontSize)
    const natural = el.scrollWidth
    if (!natural || !base) return
    el.style.fontSize = (base * target / natural).toFixed(2) + 'px'
  }

  onMounted(() => {
    fit()
    ro = new ResizeObserver(fit)
    const box = toValue(boxRef)
    if (box) ro.observe(box)
    if (document.fonts?.ready) document.fonts.ready.then(fit)
  })

  onBeforeUnmount(() => ro?.disconnect())

  return { fit }
}
