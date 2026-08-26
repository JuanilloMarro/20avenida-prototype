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
 *
 * SE MIDE LA TINTA, NO LA CAJA DE LINEA, y esto costo tener la palabra a un
 * tercio del tamano que le tocaba. La version anterior comparaba `scrollHeight`
 * contra el tope, y `scrollHeight` es la caja de linea del elemento: para Bebas
 * Neue son 1.05 em cuando la TINTA -- de la base de las mayusculas al alto de
 * mayuscula -- son 0.740. O sea que el tope se gastaba en aire por encima y por
 * debajo de las letras, que no se ve, y el numero que se escribia aqui no
 * significaba lo que decia.
 *
 * Medida contra tinta, `fillH: 0.95` quiere decir literalmente «que las letras
 * ocupen el 95% del alto de la caja», y sale igual con cualquier tipografia --
 * que es justo lo que no pasaba antes: el numero habia que reajustarlo cada vez
 * que cambiaba la familia, porque cada una tiene su reparto entre tinta y aire.
 *
 * La tinta se mide con `measureText` sobre un canvas suelto, que es la unica
 * forma de saber donde empieza y acaba de verdad: `actualBoundingBoxAscent` y
 * `Descent` son las cotas reales del trazado, no las metricas declaradas de la
 * fuente.
 */
/**
 * Cuanto ocupa el trazado de este texto, en em.
 *
 * Se mide sobre un canvas y a un cuerpo de referencia grande —100 px— y no al
 * cuerpo que tenga puesto el elemento: el resultado es una PROPORCION, y a
 * cuerpos chicos el redondeo del rasterizador la ensucia.
 *
 * El canvas no hereda nada del documento, asi que la fuente hay que armarla a
 * mano desde el estilo computado. `letter-spacing` no entra: no cambia el alto.
 *
 * Si `measureText` no trae las cotas reales —Safari viejo— se cae a 0.72, que
 * es el alto de mayuscula tipico de una grotesca. Un numero de reserva
 * razonable es mejor que desactivar el tope y que la palabra se salga.
 */
function tintaPorEm(el) {
  try {
    const cs = getComputedStyle(el)
    const cv = (tintaPorEm.cv ||= document.createElement('canvas').getContext('2d'))
    const M = 100
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${M}px ${cs.fontFamily}`
    const m = cv.measureText(el.textContent.trim() || 'M')
    const alto = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
    return alto > 0 ? alto / M : 0.72
  } catch {
    return 0.72
  }
}

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

    /* Y el tope de alto. Se mide la TINTA y no `scrollHeight` — ver la nota de
       `fillH` arriba. `tintaPorEm()` devuelve cuanto ocupa de verdad el trazado
       por cada em, asi que el alto real es esa fraccion por el cuerpo, y la
       reduccion vuelve a ser una regla de tres. */
    const targetH = fillH ? box.clientHeight * fillH : 0
    if (targetH) {
      const alto = next * tintaPorEm(el)
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
