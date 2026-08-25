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
/**
 * `fillH` — el TOPE DE ALTO, en fraccion de la caja. 0 lo desactiva.
 *
 * Ajustar solo por ancho basta mientras la palabra tenga siempre las mismas
 * letras. En cuanto cambia —«ADIDAS» son seis y «NIKE» cuatro— la de menos
 * letras necesita mucho mas cuerpo para llenar el mismo ancho, y ese cuerpo se
 * le va de alto: la palabra crece hacia arriba y hacia abajo hasta salirse del
 * encuadre.
 *
 * Con el tope, manda el que quede mas pequeno de los dos: llena el ancho si
 * cabe de alto, y si no, llena el alto y deja aire a los lados. Es la regla de
 * «contain» de toda la vida, escrita a mano porque aqui lo que se escala es un
 * `font-size`, no una caja.
 */
export function useFitText(textRef, boxRef, fill = 0.99, fillH = 0) {
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
    let next = base * target / natural
    el.style.fontSize = next.toFixed(2) + 'px'

    /* Y el tope de alto, con el cuerpo nuevo ya puesto: se mide lo que ocupa de
       verdad y se reduce por la misma regla de tres. Se mide DESPUES de escribir
       el tamano porque `line-height` es relativo al cuerpo — calcularlo sobre el
       alto anterior daria un numero que no es. */
    const targetH = fillH ? box.clientHeight * fillH : 0
    if (targetH) {
      const alto = el.scrollHeight
      if (alto > targetH) {
        next = next * targetH / alto
        el.style.fontSize = next.toFixed(2) + 'px'
      }
    }
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
