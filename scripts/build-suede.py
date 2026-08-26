#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Arma los cuatro recortes del Puma Suede Classic para <ProductAccordion>.

    python scripts/build-suede.py

Lee p1..p4 de `resources/sneakers sin fondo/`, escribe en `public/products/suede/`.

ES EL MISMO GUION QUE `build-nb9060.py`, y no se ha copiado por pereza: el
acordeon no cambio, asi que lo que necesita de las fotos tampoco. Cuatro
colorways del mismo perfil exterior, mismo encuadre y misma escala. Lo unico
distinto son los ficheros de entrada y la carpeta de salida. Si algun dia hay
que tocar la regla, se toca en los dos o se saca a un modulo -- lo que no vale
es que uno de los dos acordeones encuadre distinto que el otro.

LAS CUATRO FUENTES YA VIENEN CON ALFA. Este script no recorta fondos: encuadra.

EL ORDEN ES EL DE LOS FICHEROS, p1..p4, y viene pedido asi. No es una rotacion:
son CUATRO COLORWAYS del mismo perfil, o sea cuatro fotos intercambiables. Lo
que fija el orden es el catalogo, no la camara -- y ese mismo orden es el que
lleva `items` en `pages/index.vue`.

LO QUE HACE, en tres pasos:

  1. Recorta cada foto a su TINTA -- la caja de lo que no es transparente.

  2. NORMALIZA EL ALTO al menor de los cuatro. Las cuatro tomas son el mismo
     zapato desde el mismo sitio, asi que su altura real es identica: cualquier
     diferencia entre las tintas es distancia de camara, no zapato. Se igualan
     por ALTO y no por ancho porque el alto no depende de que la puntera entre
     mas o menos en el encuadre, y se baja al MENOR para no reescalar hacia
     arriba: ampliar inventa pixeles, reducir no.

     Que las cuatro proporciones caigan juntas es la comprobacion de que el
     supuesto se sostiene -- si un recorte se hubiera comido la suela o hubiera
     arrastrado sombra, su proporcion se saldria del grupo y esto lo escalaria
     mal. El guion las imprime para poder mirarlo.

  3. CAJA UNION con margen, y las cuatro pegadas centradas en ella. Sin lienzo
     comun el zapato cambia de tamano aparente al pasar de panel a panel, que es
     justo lo que un acordeon de comparacion no puede permitirse.

     EL MARGEN NO ES ESTETICO. El panel contraido RECORTA la foto por los lados;
     sin aire, el zapato mas ancho de los cuatro es el primero al que se le
     corta la puntera mientras los otros tres todavia respiran. Cuatro zapatos a
     la misma escala tienen que tener tambien el mismo aire.
"""
import os

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
RECORTES = os.path.join(RAIZ, 'resources', 'sneakers sin fondo')
DESTINO = os.path.join(RAIZ, 'public', 'products', 'suede')

# El umbral del recorte. 8 y no 0: los bordes de un recorte real traen un halo
# de alfa casi nula que no pinta nada y que, contado, agranda la caja unos
# pixeles por cada lado.
UMBRAL = 8

MARGEN = 48
# El ancho final. El cuerpo del panel mide `open`% del acordeon -- hoy 40% --
# asi que en un monitor de 2560 pide unos 1024 px. 1200 deja margen para
# pantallas mas anchas sin cargar de mas.
ANCHO_FINAL = 1200

# fichero fuente -> fichero de salida, en el orden del catalogo
SECUENCIA = [
    ('p1.png', 'miel.webp'),
    ('p2.png', 'arena.webp'),
    ('p3.png', 'pecana.webp'),
    ('p4.png', 'hueso.webp'),
]


def tinta(im):
    """La caja de lo que no es transparente."""
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > UMBRAL)
    if not len(xs):
        raise SystemExit('sin pixeles opacos')
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def main():
    if not os.path.isdir(RECORTES):
        raise SystemExit('no encuentro ' + RECORTES)
    os.makedirs(DESTINO, exist_ok=True)

    # 1. recortar a la tinta
    piezas = []
    for src, dst in SECUENCIA:
        im = Image.open(os.path.join(RECORTES, src)).convert('RGBA')
        im = im.crop(tinta(im))
        piezas.append((src, dst, im))
        print('%-8s tinta %4dx%-4d  prop %.3f' % (src, im.width, im.height, im.width / im.height))

    # 2. normalizar el alto al menor
    alto_ref = min(im.height for _, _, im in piezas)
    normal = []
    for src, dst, im in piezas:
        if im.height != alto_ref:
            k = alto_ref / im.height
            im = im.resize((max(1, round(im.width * k)), alto_ref), Image.LANCZOS)
        normal.append((src, dst, im))
    print('alto de referencia: %d px' % alto_ref)

    # 3. caja union + margen, y a pegar centradas
    ancho = max(im.width for _, _, im in normal) + MARGEN * 2
    alto = alto_ref + MARGEN * 2
    k = ANCHO_FINAL / ancho
    salida = (ANCHO_FINAL, max(1, round(alto * k)))
    print('caja union %dx%d  ->  %dx%d' % (ancho, alto, salida[0], salida[1]))

    for src, dst, im in normal:
        lienzo = Image.new('RGBA', (ancho, alto), (0, 0, 0, 0))
        lienzo.paste(im, ((ancho - im.width) // 2, (alto - im.height) // 2))
        lienzo = lienzo.resize(salida, Image.LANCZOS)
        ruta = os.path.join(DESTINO, dst)
        lienzo.save(ruta, 'WEBP', quality=88, method=6)
        print('%-8s -> %-22s %d KB' % (src, dst, os.path.getsize(ruta) // 1024))


if __name__ == '__main__':
    main()
