#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Arma las fotos de <ProductPoster>, el cartel de doble columna.

    python scripts/build-poster.py

Lee de `resources/new component/` y escribe en `public/products/poster/`.

══ EL REPARTO VIENE EN EL NOMBRE DEL FICHERO ═══════════════════════════════════

Los originales estan nombrados por su hueco, no por lo que se ve en ellos, y eso
es lo que manda:

    card 1 fondo.png              -> c1       (columna 1)
    card 2 fondo y frente.png     -> c2 Y c4  (columna 1)   <- la misma foto, dos veces
    card 3 fondo.png              -> c3       (columna 1)
    png.png                       -> heroe    (columna 1)
    card 1.1 fondo.png            -> c1       (columna 2)
    ... el sufijo `.1` es la SEGUNDA columna
    logo para ambos.png           -> el logotipo, COMPARTIDO

`card 2` se usa dos veces a proposito: el mismo par va en la tarjeta alta del
fondo y en la chica que pasa por delante del heroe. No es un descuido del
reparto -- esta escrito en el nombre del fichero, "fondo y frente".

══ DOS CLASES DE ORIGEN, Y SE TRATAN DISTINTO ══════════════════════════════════

  LAS TARJETAS son fotos OPACAS sobre blanco puro (255,255,255 en las cuatro
  esquinas, comprobado). No se recortan: el blanco de la foto y el blanco de la
  tarjeta son el mismo, asi que la foto se funde con su tarjeta y el zapato se
  lee flotando en ella. Recortarlas a silueta seria trabajo para empeorarlas.

  EL HEROE Y EL LOGOTIPO llegan con alfa de verdad, y esos SI se recortan a
  tinta. El heroe va suelto sobre el collage y su margen transparente decide
  cuanto ocupa dentro de su hueco: sin recortar, dos zapatos con margenes
  distintos salen a tamanos distintos con las mismas medidas de maquetacion.
  Recortado, la foto ES el zapato y el hueco lo llena entero.

  Esa es ademas la condicion para que la pieza pueda volverse dinamica: quien
  suba una foto no puede tener que ajustar ademas unas coordenadas a mano.

LA REGLA DEL RECORTE: `alfa > 8` y no `> 0`. El contorno lleva un halo de un par
de pixeles casi transparente; midiendo desde 0 la caja crece de forma distinta en
cada foto, que es justo la variacion que esto viene a quitar.
"""
import os
import sys

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
ORIGEN = os.path.join(RAIZ, 'resources', 'new component')
DESTINO = os.path.join(RAIZ, 'public', 'products', 'poster')

# Lado mayor de cada pieza. 900 para el heroe -- es el que se ve grande -- y 560
# para las tarjetas, que en escritorio no pasan de 340 px de ancho reales. El
# logotipo es pequeno en pantalla pero se pide a 360 porque un trebol de adidas
# a 180 se le empastan las hojas.
LADO_HEROE = 900
LADO_CARTA = 560
LADO_LOGO = 360

LOGO = 'logo para ambos.png'

CARTELES = {
    'campus': {
        'heroe': 'png.png',
        'c1':    'card 1 fondo.png',
        'c2':    'card 2 fondo y frente.png',
        'c3':    'card 3 fondo.png',
        'c4':    'card 2 fondo y frente.png',   # la misma que c2 — «fondo y frente»
    },
    'samba-beige': {
        'heroe': 'png .1.png',
        'c1':    'card 1.1 fondo.png',
        'c2':    'card 2.1 fondo y frente.png',
        'c3':    'Card 3.1 fondo.png',
        'c4':    'card 2.1 fondo y frente.png',
    },
}


def tinta(im):
    """Caja de lo que no es transparente. Ver la nota del cabecero."""
    a = np.asarray(im.getchannel('A'))
    ys, xs = np.where(a > 8)
    if not len(xs):
        sys.exit('foto sin tinta')
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def tiene_alfa(im):
    a = np.asarray(im.getchannel('A'))
    return int(a.min()) < 250


def prepara(ruta, lado):
    im = Image.open(ruta).convert('RGBA')
    # Sólo se recorta lo que trae alfa: heroe y logotipo. Las tarjetas son
    # opacas y su blanco es el de la tarjeta que las va a contener.
    if tiene_alfa(im):
        im = im.crop(tinta(im))
    k = min(1.0, lado / float(max(im.width, im.height)))
    if k < 1.0:
        im = im.resize((max(1, int(round(im.width * k))),
                        max(1, int(round(im.height * k)))), Image.LANCZOS)
    return im


def guarda(im, ruta):
    im.save(ruta, 'WEBP', quality=88, method=6)
    return os.path.getsize(ruta) // 1024


def main():
    if not os.path.isdir(ORIGEN):
        sys.exit('no existe %s' % ORIGEN)

    os.makedirs(DESTINO, exist_ok=True)

    # El logotipo, UNO para los dos carteles: las dos columnas son adidas.
    ruta = os.path.join(ORIGEN, LOGO)
    if not os.path.exists(ruta):
        sys.exit('FALTA %s' % ruta)
    im = prepara(ruta, LADO_LOGO)
    kb = guarda(im, os.path.join(DESTINO, 'logo-adidas.webp'))
    print('logo-adidas.webp   %dx%-4d %d KB  (compartido)' % (im.width, im.height, kb))

    for cartel, piezas in CARTELES.items():
        salida = os.path.join(DESTINO, cartel)
        os.makedirs(salida, exist_ok=True)
        print('\n' + cartel)
        for hueco, fichero in piezas.items():
            ruta = os.path.join(ORIGEN, fichero)
            if not os.path.exists(ruta):
                sys.exit('FALTA %s' % ruta)
            im = prepara(ruta, LADO_HEROE if hueco == 'heroe' else LADO_CARTA)
            kb = guarda(im, os.path.join(salida, hueco + '.webp'))
            print('  %-6s %-30s %4dx%-4d ratio %.2f  %d KB'
                  % (hueco, fichero, im.width, im.height, im.width / im.height, kb))


if __name__ == '__main__':
    main()
