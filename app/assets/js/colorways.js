/**
 * Colorways — las variantes de <ProductShowcase>.
 *
 * Un colorway es UN objeto: el color solido del frame, el tono del texto
 * gigante del fondo, la tinta, el acento y la secuencia de frames del zapato.
 * Anadir un zapato es anadir una entrada aqui, no tocar el componente.
 *
 * Los tonos de `samba-green` estan muestreados de la foto del Samba OG:
 * ante verde colegial, tres bandas hueso, suela de goma y el «SAMBA» amarillo.
 */

/**
 * La secuencia del scrollover.
 *
 * El orden NO es el de los ficheros originales: es el de la rotacion. La camara
 * da la vuelta al zapato -- 3/4 delantero, perfil exterior, 3/4 trasero, perfil
 * interior -- y luego lo vuelca: cenital y suela. Cambiar el orden es reordenar
 * este array y nada mas.
 *
 * Las dos fotos `detail-view` que venian en resources/ NO estan aqui, y no es
 * una preferencia: son macros que sangran hasta el borde del encuadre (su caja
 * de contenido es la imagen entera). Metidas en la secuencia obligarian al
 * encuadre comun a ser el frame completo y encogerian los otros seis. Van en
 * `details`, para una galeria.
 */
const SAMBA_FRAMES = [
  { src: '/products/samba/01.webp', label: '3/4 delantero' },
  { src: '/products/samba/02.webp', label: 'Perfil exterior' },
  { src: '/products/samba/03.webp', label: '3/4 trasero' },
  { src: '/products/samba/04.webp', label: 'Perfil interior' },
  { src: '/products/samba/05.webp', label: 'Cenital' },
  { src: '/products/samba/06.webp', label: 'Suela' },
]

/**
 * NIKE MIND 001 -- la secuencia del scrollover, y la que se ve al entrar.
 * Sustituye al Samba en el escaparate; el Samba se queda porque `brands.js` lo
 * usa para Adidas y `pages/frame.vue` para las capturas.
 *
 * EL ORDEN ES EL DE LOS FICHEROS, S1..S6, y eso NO es una coincidencia
 * alfabetica: las tomas vienen numeradas en el orden de la orbita, asi que la
 * vuelta ya esta dada. No hay nada que reordenar y no se debe -- cualquier
 * permutacion rompe el giro.
 *
 * LOS SEIS SALEN DE `scripts/build-mind001.py`, que hace tres cosas y las tres
 * hacen falta:
 *
 *   1. RECORTA S2, el unico que llegaba con fondo. Su sombra de estudio no se
 *      separa por color -- el cuerpo arranca en d=25 y la sombra llega a 67, se
 *      solapan enteros -- asi que se corta por la envolvente inferior de los
 *      nodos naranjas: debajo de la suela no hay zapato.
 *
 *   2. NORMALIZA EL ALTO de la puntera y el talon. Esas dos tomas estan
 *      disparadas mucho mas cerca que las otras cuatro: la tinta de un perfil
 *      mide 768 px de alto y la de la puntera 1583, mas del doble. Sin
 *      corregirlo el zapato pegaba un salto de tamano justo al girar hacia
 *      ellas. Se normaliza por ALTO y no por ancho ni por area porque la camara
 *      orbita alrededor de un eje vertical, y en ese giro la altura del zapato
 *      es lo unico que no cambia.
 *
 *   3. CAJA UNION 2007x1054, reducida a 1160x609. Lo mismo que se hizo con el
 *      Samba y con los Jordan, y por lo mismo: sin encuadre comun el zapato
 *      cambia de tamano aparente al girar, que es lo unico que un scrollover no
 *      puede permitirse.
 */
const MIND_FRAMES = [
  { src: '/products/mind001/01.webp', label: 'Perfil exterior' },
  { src: '/products/mind001/02.webp', label: '3/4 delantero' },
  { src: '/products/mind001/03.webp', label: 'Puntera' },
  { src: '/products/mind001/04.webp', label: 'Perfil interior' },
  { src: '/products/mind001/05.webp', label: '3/4 trasero' },
  { src: '/products/mind001/06.webp', label: 'Talon' },
]

const SAMBA_DETAILS = [
  '/products/samba/detail-1.webp',
  '/products/samba/detail-2.webp',
]

/**
 * `short` — la palabra del texto gigante del acordeon.
 *
 * No vale `name` para eso: los cuatro paneles son el MISMO modelo, asi que los
 * cuatro dirian «Samba OG» y el texto dejaria de distinguir nada. Lo que los
 * separa es el colorway, y eso es lo que se pinta grande.
 *
 * En caja de frase, regla R1: ni `text-transform` ni escrito en versales.
 *
 * OJO con el nombre: el campo `word` de aqui abajo YA existe y es un COLOR —
 * el del texto gigante del showcase. Por eso este se llama `short` y no `word`.
 */
/**
 * Las tallas del Air Jordan 1. PLACEHOLDER: hoy es un array literal y todos los
 * colorways comparten el mismo, porque el stock real no existe todavía. Cuando
 * llegue el backend, cada producto traerá las suyas — y con disponibilidad, que
 * es lo que de verdad falta: aquí todas se pintan como si hubiera de todo.
 */
const TALLAS_AJ1 = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5]

/**
 * Las del Suede Classic. MISMO PLACEHOLDER que los dos de arriba —no hay stock
 * de verdad—, y el tramo vuelve al del Jordan: el Suede es un zapato de corte
 * bajo y horma estrecha que se pide en tallaje de hombre de EE. UU. arrancando
 * en la 4, así que las diez del centro de la campana caen medio punto por
 * debajo de las del 9060, que es un zapato de horma mucho más ancha.
 *
 * DIEZ Y NI UNA MÁS, en los tres arrays, y no es casualidad: la rejilla de la
 * ficha es de 5 × 2 —está medida en `06-PRODUCT-ACCORDION.md` §2.2—, así que
 * una talla de más abre una tercera fila y le come el alto al zapato.
 */
const TALLAS_SUEDE = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5]

export const COLORWAYS = {
  /* ── Nike Mind 001 ─ el del escaparate ───────────────────────────────
     Zapato real: Mind 001, la mula de la linea Mind de Nike, en el colorway
     LIGHT BONE / HYPER CRIMSON / BUFF / CHROME (codigo HQ4307-002, enero de
     2026, 95 $ de calle). Los 22 nodos de espuma de la suela son el argumento
     del modelo, y son justo lo naranja.

     LOS SIETE TONOS SALEN DE LA FOTO, muestreados sobre los pixeles opacos de
     los propios recortes y no elegidos a ojo:

       cuerpo   #E8E3DD   Light Bone      -- hsv 33, 5, 91
       nodos    #EC4A29   Hyper Crimson   -- hsv 10, 83, 93
       forro    #BE9179   Buff            -- hsv 21, 36, 75  (el talon)

     Y de ahi salen los del frame, que es lo que pedia el encargo -- el fondo
     con los colores del zapato:

       `surface` es el BUFF DEL TALON aclarado. No puede ser el Light Bone del
       cuerpo, que seria lo primero que uno prueba: el zapato ES Light Bone, y
       sobre su propio tono desaparece. El forro es el otro tono claro que el
       zapato ya tiene, es mas calido y mas saturado, y contra el la espuma
       hueso se recorta sola.

       `word` es el Hyper Crimson bajado a terracota. El naranja puro a 300 px
       de cuerpo se come el encuadre entero -- es un acento, y un acento del
       tamano del fondo deja de serlo. Bajado de valor conserva el matiz del
       zapato y se queda donde tiene que estar: detras.

       `accent` si es el Hyper Crimson tal cual. Es el unico sitio donde el
       naranja va a plena potencia, igual que en el zapato.

     Contraste medido sobre `surface` por la formula de la WCAG: la tinta da
     12.1:1 y el texto gigante 5.9:1. */
  'mind-001': {
    name: 'Mind 001',
    short: 'Hueso',
    line: 'Light Bone · Hyper Crimson · Buff',
    /* el color solido del frame — el forro del talon, aclarado */
    surface: '#E9DED2',
    /* el texto gigante del frame de atras — el crimson bajado a terracota */
    word: '#8A3B22',
    wordShadow: 'rgba(44, 30, 23, .10)',
    ink: '#2C1E17',
    inkSoft: 'rgba(44, 30, 23, .60)',
    hair: 'rgba(44, 30, 23, .22)',
    accent: '#EC4A29',
    frames: MIND_FRAMES,
    /* Sin `details`: de este zapato no hay macros. El componente ya lo trata
       como opcional — el Samba es el unico que las tiene. */
    price: '95$',
  },

  'samba-green': {
    name: 'Samba OG',
    short: 'Verde',
    line: 'Collegiate Green · Off White · Gum',
    /* el color sólido del frame */
    surface: '#DCE5DA',
    /* el texto gigante del frame de atrás — tonos verdes, como pediste */
    word: '#37624E',
    wordShadow: 'rgba(22, 38, 31, .10)',
    ink: '#16261F',
    inkSoft: 'rgba(22, 38, 31, .60)',
    hair: 'rgba(22, 38, 31, .22)',
    accent: '#F0D24B',
    frames: SAMBA_FRAMES,
    details: SAMBA_DETAILS,
    price: '120$',
  },

  /* La misma pieza en oscuro. Existe para demostrar que el componente es una
     plantilla y no un dibujo: cambia el colorway, no el template. */
  'samba-night': {
    name: 'Samba OG',
    short: 'Noche',
    line: 'Collegiate Green · Night',
    surface: '#16261F',
    word: '#2B4A3B',
    wordShadow: 'rgba(0, 0, 0, .25)',
    ink: '#E8EFE6',
    inkSoft: 'rgba(232, 239, 230, .58)',
    hair: 'rgba(232, 239, 230, .24)',
    accent: '#F0D24B',
    frames: SAMBA_FRAMES,
    details: SAMBA_DETAILS,
    price: '120$',
  },

  /* ── Puma Suede Classic ─ los cuatro del acordeón ────────────────────
     Cuatro colorways del MISMO modelo, que es lo que pide un acordeón: lo que
     se compara es el color, no el zapato.

     SON LOS TERCEROS EN ESE SITIO. Primero estuvieron los cuatro Jordan, luego
     cuatro New Balance 9060, y ahora éstos — y el motivo del último cambio no es
     de diseño sino de catálogo: 20 Avenida no vende New Balance. Los 9060 ya no
     están en este fichero: se fueron enteros con la marca, junto con sus cinco
     entradas de `sneakers.js` y su entrada de `brands.js`.

     Los Jordan SÍ se quedan, aquí abajo, aunque tampoco estén en ninguna pieza:
     `brands.js` los sigue pidiendo por id para la marca Air Jordan.

     EL ZAPATO. El Suede salió en 1968 y es, sin discusión, el zapato con más
     vidas del catálogo: cancha de baloncesto con Walt «Clyde» Frazier, podio de
     México 68 con Tommie Smith, y de ahí a las pistas de baile del Bronx, donde
     los b-boys lo adoptaron porque el ante aguanta el giro y la suela de goma
     agarra el cartón. La forma no ha cambiado: puntera redonda, cuello bajo,
     la formstrip cosida por encima del ante y la suela de goma con el grabado
     de guijarro. Es un zapato de UNA pieza de material y un solo detalle, y por
     eso funciona en un acordeón — lo único que separa a los cuatro es el tinte
     del ante, que es exactamente lo que la pieza compara.

     EL PLANO DE COLOR SALE DEL ANTE, muestreado sobre los píxeles opacos del
     propio recorte y no elegido a ojo. Es el mismo problema que tenían los 9060
     y se resuelve igual: los cuatro son neutros cálidos de la misma familia
     —matiz entre 17 y 40— así que un plano del color del corte haría
     desaparecer el zapato. Se baja el VALOR y se sube la SATURACIÓN, y la
     separación entre paneles se busca por saturación además de por valor:

       plano     ante       zapato/plano   blanco/plano   qué es
       #6B5B3B   #ECDCBC      4.6 : 1        6.6 : 1      oro apagado
       #4C3F2C   #CCB494      4.9 : 1       10.2 : 1      tabaco
       #291B16   #6C4434      6.1 : 1       16.6 : 1      casi negro
       #5E5B53   #D4CCBC      3.9 : 1        6.8 : 1      gris cálido

     LA COLUMNA «zapato/plano» ESTÁ MEDIDA CONTRA EL RECORTE ENTERO —suela y
     formstrip incluidas, luminancia media de los píxeles opacos— y no contra el
     tono del ante. La diferencia importa y costó una vuelta: medido sólo contra
     el ante, el plano casi negro daba 2.0 : 1 y parecía el peor de los cuatro;
     contra el zapato de verdad da 6.1 y es el MEJOR, porque ese modelo lleva
     media silueta en blanco. Medir el material y no la foto engaña.

     Y LOS CUATRO PLANOS SON OSCUROS, que no es una preferencia: la ficha de
     `<ProductAccordionPanel>` va en BLANCO FIJO en las cuatro medidas —está
     escrito allí y es a propósito, para que se lea igual en todos los paneles—,
     así que un plano hueso, que es lo que pedían estos cuatro zapatos, dejaría
     el nombre y el precio ilegibles. El más claro da 6.6 : 1 contra blanco, que
     es el mismo suelo que ya tenía el 9060 más claro.

     LOS DOS DE LOS EXTREMOS COMPARTEN LUMINANCIA —«Miel» y «Hueso», los
     dos a 6.6 y 6.8 contra blanco— y se distinguen sólo por saturación: uno es
     oro y el otro gris. Se deja así a sabiendas: son las posiciones 1 y 4, o
     sea que NO SE TOCAN en ninguno de los tres estados del acordeón. Separarlos
     por valor obligaba a subir uno por encima del suelo de contraste o a bajar
     el otro hasta chocar con «Arena», que sí es su vecino.

     `frames` trae UNA entrada: el acordeón usa `frames[0]` y éstos no tienen
     secuencia de scrollover. Los cuatro recortes salen de
     `scripts/build-suede.py`, normalizados por alto y pegados en una caja unión
     de 1200×549 — sin lienzo común el zapato cambiaría de tamaño aparente al
     pasar de panel a panel, que es lo único que un acordeón de comparación no
     puede permitirse. Las cuatro tintas salen con proporciones de 2.328 a
     2.351, o sea el mismo zapato desde el mismo sitio.

     LOS `short` SON CORTOS PORQUE TIENEN QUE SERLO, y esto costó una vuelta.
     Es la palabra que `<ProductAccordionPanel>` pinta gigante al fondo, a un
     cuerpo FIJO de 33cqw — sin `useFitText`, a propósito, para que las cuatro
     tengan la misma altura de letra; está explicado allí. La palabra DEBE
     salirse del panel contraído, ése es el efecto, pero tiene que caber ENTERA
     en la ficha, que es la única medida que ese cuerpo no puede pasarse. La
     referencia que dejaron los 9060 es «ANGORA» al 84% del ancho de la ficha.

     Medido a 1425 de ancho, con la letra de la casa:

       Miel      50%        Pecana     82%   ← el techo práctico
       Arena     69%        Vainilla   93%   ← ya sin aire
       Hueso     68%        Mantequilla 145% ← se sale

     El primero iba a llamarse «Mantequilla» y por eso es «Miel»: no cabía. El
     cambio sale ganando además por otro lado — «Miel» dice AMARILLO y «Hueso»
     dice neutro, que es justo lo que separa a esos dos zapatos, los dos pálidos.
     Si entra un `short` nuevo, se mide antes: por encima de ~85% no va.

     PLACEHOLDER, dos cosas: el precio —85$ es el de calle del modelo, no un
     precio de 20 Avenida— y los NOMBRES DE COLORWAY de `line`, que describen lo
     que se ve en la foto y no están verificados contra el catálogo de Puma.
     Cuando haya catálogo real, esos tres nombres son lo primero que hay que
     confirmar. `short` y `blurb` sí son nuestros y se quedan. */

  'suede-miel': {
    name: 'Puma Suede Classic',
    short: 'Miel',
    line: 'Butter Yellow · White · Gold',
    /* el plano: el ante amarillo mantequilla, bajado a valor de fondo */
    surface: '#6B5B3B',
    word: '#8A7854',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F7F2E6',
    inkSoft: 'rgba(247, 242, 230, .62)',
    hair: 'rgba(247, 242, 230, .24)',
    accent: '#ECDCBC',
    blurb: 'Ante amarillo mantequilla con la formstrip en blanco y el sello en oro. El más claro de los cuatro y el que mejor enseña el pelo del ante: sin color que distraiga, lo que se mira es el material.',
    sizes: TALLAS_SUEDE,
    frames: [{ src: '/products/suede/miel.webp', label: 'Perfil exterior' }],
    price: '85$',
  },

  'suede-arena': {
    name: 'Puma Suede Classic',
    short: 'Arena',
    line: 'Sand Dune · Tonal · Egret',
    /* el plano: el ante arena, bajado a tabaco */
    surface: '#4C3F2C',
    word: '#695741',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F6F1E8',
    inkSoft: 'rgba(246, 241, 232, .62)',
    hair: 'rgba(246, 241, 232, .24)',
    accent: '#E0CBAE',
    blurb: 'Arena sobre arena: el único de los cuatro con la formstrip del mismo tono que el corte. Sin el contraste blanco, la silueta se lee de una sola pieza y lo que resalta es la línea.',
    sizes: TALLAS_SUEDE,
    frames: [{ src: '/products/suede/arena.webp', label: 'Perfil exterior' }],
    price: '85$',
  },

  'suede-pecana': {
    name: 'Puma Suede Classic',
    short: 'Pecana',
    line: 'Chestnut Brown · White · Gold',
    /* el plano: el castaño del ante, llevado casi a negro. El zapato es el
       único oscuro de los cuatro, así que su plano tiene que ser el más oscuro
       de todos — con cualquier otro, el ante se hunde en el fondo. */
    surface: '#291B16',
    word: '#422E26',
    wordShadow: 'rgba(0, 0, 0, .25)',
    ink: '#F7EFE9',
    inkSoft: 'rgba(247, 239, 233, .62)',
    hair: 'rgba(247, 239, 233, .24)',
    accent: '#C9A08C',
    blurb: 'Castaño con la formstrip en blanco, el contraste más alto de la serie. Es el colorway que enseña de qué va el modelo a diez metros: una banda blanca curvada sobre ante oscuro y nada más.',
    sizes: TALLAS_SUEDE,
    frames: [{ src: '/products/suede/pecana.webp', label: 'Perfil exterior' }],
    price: '85$',
  },

  'suede-hueso': {
    name: 'Puma Suede Classic',
    short: 'Hueso',
    line: 'Warm White · White · Gold',
    /* el plano: el hueso del ante, bajado a gris cálido. El único de los cuatro
       cuyo plano se separa por SATURACIÓN y no por valor — ver la nota larga de
       arriba sobre por qué comparte luminancia con «Mantequilla». */
    surface: '#5E5B53',
    word: '#7A766E',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F5F3EE',
    inkSoft: 'rgba(245, 243, 238, .62)',
    hair: 'rgba(245, 243, 238, .24)',
    accent: '#D4CCBC',
    blurb: 'Blanco cálido de arriba abajo, con los cordones y la formstrip en blanco puro. Dos blancos distintos en el mismo zapato: el del ante tira a crema y el de la banda no, y esa diferencia es todo el colorway.',
    sizes: TALLAS_SUEDE,
    frames: [{ src: '/products/suede/hueso.webp', label: 'Perfil exterior' }],
    price: '85$',
  },

  /* ── Air Jordan 1 ─ los cinco del rollo ──────────────────────────────
     ESTUVIERON EN EL ACORDEÓN y ya no: ahí van los cuatro 9060 de aquí
     arriba. Se quedan en el fichero porque `<ProductReel>` y `brands.js` los
     piden por id — borrarlos dejaría el rollo sin sus cinco puestos. Las fotos venían ya con alfa de
     verdad — no hizo falta `cutout-bg.py` — y se recortaron a una CAJA UNIÓN de
     647×636 para los cuatro (la tinta mayor más 46 px de margen por lado). Eso es lo que hace que los cuatro se lean a la
     misma escala: recortar cada uno a su propia caja normalizaría cada zapato
     al mismo tamaño aparente y el salto se notaría al pasar de panel a panel.

     `surface` es el plano de color del panel y sale del tono dominante del
     propio zapato, muestreado de la foto. `ink` se invierte con él: claro sobre
     los tres oscuros, oscuro sobre el ocre — no es una excepción de estilo, es
     que el contraste manda y el ocre es claro.

     `frames` trae UNA sola entrada: el acordeón usa `frames[0]` y estos no
     tienen secuencia de scrollover. Si algún día la tienen, se añaden aquí y
     ningún componente se entera.

     PLACEHOLDER: el precio. 180$ es el de calle del modelo, no un precio de
     20 Avenida. */

  'jordan-pine': {
    name: 'Air Jordan 1',
    short: 'Pino',
    line: 'Gorge Green · White',
    surface: '#1E5B3E',
    word: '#2D7351',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F2F7F3',
    inkSoft: 'rgba(242, 247, 243, .62)',
    hair: 'rgba(242, 247, 243, .24)',
    accent: '#E8C547',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Camina con la leyenda. Verde bosque sobre piel blanca, la silueta que abrió el camino y sigue marcándolo. Comodidad de siempre, materiales de ahora.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-pine.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  /* PLACEHOLDER COMPLETO — el quinto Jordan.
     No es un colorway real: reutiliza la foto del «pino» y sólo existe para que
     el rollo pueda enseñar sus CINCO puestos ocupados, que con cuatro dejaba
     uno vacío. Cuando llegue una quinta foto de verdad, se cambia `frames`, el
     nombre de la línea y el `short`, y nada más. Y si no llega, esto se borra:
     un catálogo con un producto inventado es peor que uno corto. */
  'jordan-royal': {
    name: 'Air Jordan 1',
    short: 'Royal',
    line: 'Game Royal · Black',
    surface: '#1B2A63',
    word: '#2C3F8C',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#F1F3FA',
    inkSoft: 'rgba(241, 243, 250, .62)',
    hair: 'rgba(241, 243, 250, .24)',
    accent: '#E8C547',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Azul de cancha sobre negro. La silueta de siempre en el par de colores que la sacó del parqué a la calle.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-pine.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  'jordan-brood': {
    name: 'Air Jordan 1',
    short: 'Orquídea',
    line: 'Brotherhood · Purple · Gold',
    surface: '#A8478E',
    word: '#BE5FA2',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#FBF3F8',
    inkSoft: 'rgba(251, 243, 248, .62)',
    hair: 'rgba(251, 243, 248, .24)',
    accent: '#F0A830',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Dos colores que no deberían funcionar juntos y llevan décadas haciendólo. Orquídea y oro sobre la silueta más reconocible del baloncesto.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-brood.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  'jordan-ochre': {
    name: 'Air Jordan 1',
    short: 'Ocre',
    line: 'Yellow Ochre · Sail · Black',
    surface: '#E9A825',
    word: '#F5BE4E',
    wordShadow: 'rgba(42, 28, 5, .14)',
    /* tinta OSCURA: el ocre es el único plano claro de los cuatro */
    ink: '#2A1C05',
    inkSoft: 'rgba(42, 28, 5, .62)',
    hair: 'rgba(42, 28, 5, .22)',
    accent: '#1A1A1A',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'Ocre, hueso y negro. La combinación más cálida de la serie, en la piel volumétrica que le dio nombre al modelo.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-ochre.webp', label: 'Perfil exterior' }],
    price: '180$',
  },

  'jordan-chi': {
    name: 'Air Jordan 1',
    short: 'Chicago',
    line: 'Varsity Red · White · Black',
    surface: '#C0182C',
    word: '#D63A4C',
    wordShadow: 'rgba(0, 0, 0, .18)',
    ink: '#FFF4F5',
    inkSoft: 'rgba(255, 244, 245, .62)',
    hair: 'rgba(255, 244, 245, .24)',
    accent: '#F5D547',
    /* PLACEHOLDER: copy de muestra, no definitivo. */
    blurb: 'El colorway que empezó todo. Rojo, blanco y negro en el orden exacto en que se vieron por primera vez en una cancha.',
    sizes: TALLAS_AJ1,
    frames: [{ src: '/products/jordan/jordan-chi.webp', label: 'Perfil exterior' }],
    price: '180$',
  },
}

export const COLORWAY_IDS = Object.keys(COLORWAYS)
/* EL DEL ESCAPARATE. `<ProductShowcase>` no recibe `variant` desde la landing,
   asi que es este el que se ve al entrar en la pagina. Cambiarlo aqui cambia el
   zapato del scrollover y nada mas: el acordeon y el rollo piden sus ids a
   mano, y `toCss()` solo lo usa de respaldo cuando le pasan un id que no
   existe. */
export const DEFAULT_COLORWAY = 'mind-001'

/** → custom properties del frame. */
export function toCss(id) {
  const c = COLORWAYS[id] || COLORWAYS[DEFAULT_COLORWAY]
  return {
    '--ps-surface': c.surface,
    '--ps-word': c.word,
    '--ps-word-shadow': c.wordShadow,
    '--ps-ink': c.ink,
    '--ps-ink-soft': c.inkSoft,
    '--ps-hair': c.hair,
    '--ps-accent': c.accent,
  }
}
