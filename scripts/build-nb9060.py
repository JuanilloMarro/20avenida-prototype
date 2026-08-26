#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Arma los cuatro recortes del New Balance 9060 para <ProductAccordion>.

    python scripts/build-nb9060.py

Lee A1..A4 de `resources/sneakers sin fondo/`, escribe en `public/products/nb9060/`.
LAS CUATRO FUENTES YA VIENEN CON ALFA. Este script no recorta fondos: encuadra.
Misma regla que en `build-mind001.py` -- si la fuente trae alfa, se respeta tal
cual y no se le anade ni se le quita nada.

EL ORDEN ES EL DE LOS FICHEROS, A1..A4, y viene pedido asi. No es una rotacion
como la del Mind 001: son CUATRO COLORWAYS del mismo perfil exterior, o sea
cuatro fotos intercambiables. Lo que fija el orden es el catalogo, no la camara.

LO QUE HACE, en tres pasos:

  1. Recorta cada foto a su TINTA -- la caja de lo que no es transparente.

  2. NORMALIZA EL ALTO. Las cuatro tomas son el mismo zapato desde el mismo
     sitio, asi que su altura real es identica: cualquier diferencia entre las
     tintas (887, 925, 953 y 908 px) es distancia de camara, no zapato. Se
     igualan por ALTO y no por ancho porque el alto es la medida que no depende
     de que la puntera entre mas o menos en el encuadre, y se baja al MENOR de
     los cuatro para no reescalar nada hacia arriba: ampliar inventa pixeles,
     reducir no.

     Que las cuatro proporciones caigan entre 1.98 y 2.05 es la comprobacion de
     que el supuesto se sostiene -- si un recorte se hubiera comido la suela o
     hubiera arrastrado sombra, su proporcion se saldria del grupo y esto lo
     escalaria mal.

  3. CAJA UNION con margen, y las cuatro pegadas centradas en ella. Es lo mismo
     que se hizo con los Jordan y con el Samba, y por lo mismo: sin lienzo comun
     el zapato cambia de tamano aparente al pasar de panel a panel, que es justo
     lo que un acordeon de comparacion no puede permitirse.

     EL MARGEN NO ES ESTETICO. El panel contraido RECORTA la foto por los lados;
     sin aire, el zapato mas ancho de los cuatro es el primero al que se le
     corta la puntera mientras los otros tres todavia respiran. Cuatro zapatos a
     la misma escala tienen que tener tambien el mismo aire.
"""
import os
import sys

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
RECORTES = os.path.join(RAIZ, 'resources', 'sneakers sin fondo')
DESTINO = os.path.join(RAIZ, 'public', 'products', 'nb9060')

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
    ('A1.png', 'sea-salt.webp'),
    ('A2.png', 'mushroom.webp'),
    ('A3.png', 'dark-mushroom.webp'),
    ('A4.png', 'angora.webp'),
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
        ruta = os.path.join(RECORTES, src)
        im = Image.open(ruta).convert('RGBA').crop(tinta(Image.open(ruta).convert('RGBA')))
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
