#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Arma el catalogo del rollo -- <ProductReel>.

    python scripts/build-sneakers.py

Lee de `resources/sneakers sin fondo/` y escribe en `public/products/sneakers/`.
Los seis vienen ya recortados, con su canal alfa: aqui NO se recorta nada.
La regla es la misma que en `build-mind001.py` -- si la fuente trae alfa, se
respeta tal cual y no se le anade ni color ni sombra ni un segundo recorte.

FUERON CATORCE, de cuatro marcas. Se cayeron las cinco New Balance 9060 y los
tres Veja Campo porque 20 Avenida no vende esas dos marcas -- quedan los tres
Samba y los tres Dunk Low. Y la caja union CAMBIO al quitarlas: era 1160x599 y
ahora es 1160x550, porque la altura la marcaba el 9060, que es el mas alto de
todos. Las seis que quedan se reencuadran mas ajustadas, que es lo correcto: la
caja tiene que ser la union de lo que se ensena, no de lo que se enseno una vez.

QUE HACE, y por que cada paso:

  1. Recorta cada foto a su TINTA.
  2. NORMALIZA POR LARGO -- ver `LARGO_REF`. Este es el paso que hace que el
     rollo funcione.
  3. Pega todo centrado en un lienzo comun, la CAJA UNION.

NO ENTRAN S1..S6: esos son la secuencia del escaparate, del Nike Mind 001, y los
arma `build-mind001.py`. Viven en la misma carpeta porque salieron de la misma
exportacion, no porque sean lo mismo.

LOS ESPEJADOS SE QUEDAN COMO ESTAN, y es una decision tomada mirando: tres de
los seis son imagen espejo -- los Samba, con el «SAMBA» del lateral leyendose al
reves. Voltearlas arregla el texto y rompe algo peor: los seis apuntan la
puntera a la IZQUIERDA, y en un carrusel que intercambia posiciones, tres
zapatos mirando al otro lado se lee como un fallo de montaje en cada giro. Entre
una palabra invertida a tamano pequeno y la direccion de la pieza, manda la
direccion.

Eran seis de catorce cuando estaban los Veja, que tenian el mismo problema con
su «VEJA» lateral.
"""
import os
import sys

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FUENTE = os.path.join(RAIZ, 'resources', 'sneakers sin fondo')
DESTINO = os.path.join(RAIZ, 'public', 'products', 'sneakers')

MARGEN = 24
MAX_LADO = 1160

# ── EL CATALOGO ─────────────────────────────────────────────────────────────
#
# `(fichero, id)`. El `id` es el que usa `colorways.js`, asi que renombrar aqui
# obliga a renombrar alli: son la misma clave vista desde los dos lados.
#
# EL ORDEN ES EL DEL ROLLO y esta puesto a mano: se ALTERNAN LAS MARCAS en vez de
# agruparlas. Agrupadas, el rollo ensena tres Dunk seguidos y parece que la
# tienda solo vende eso; alternadas, cada giro cambia de marca y de silueta, que
# es lo que un escaparate tiene que hacer.
#
# Con dos marcas la alternancia es exacta -- Dunk, Samba, Dunk, Samba... -- y por
# eso el orden de aqui abajo ya no es el mismo que el de cuando habia cuatro.
CATALOGO = [
    ('Captura de pantalla 2026-08-25 112808 (1).png',  'dunk-universidad'),
    ('Captura de pantalla 2026-08-25 111919 (1).png',  'samba-bosque'),
    ('Captura de pantalla 2026-08-25 112940 (1).png',  'dunk-carmin'),
    ('Captura de pantalla 2026-08-25 112257.png',      'samba-canamo'),
    ('Captura de pantalla 2026-08-25 112913 (1).png',  'dunk-niebla'),
    ('Captura de pantalla 2026-08-25 112410.png',      'samba-tiza'),
]

# ── EL LARGO AL QUE SE LLEVAN TODOS ─────────────────────────────────────────
#
# POR LARGO Y NO POR ALTO, que es la diferencia con `build-mind001.py` y no es un
# capricho: alli las seis fotos son EL MISMO zapato girando, y lo que no cambia
# en un giro sobre eje vertical es la altura. Aqui son CATORCE zapatos
# DISTINTOS, y lo que de verdad comparten no es la altura -- una 9060 es mucho
# mas alta que una Samba -- sino el LARGO: un 42 mide un 42 lo fabrique quien lo
# fabrique.
#
# Normalizar por alto seria mentir sobre el producto: dejaria la Samba tan
# voluminosa como la 9060 y la 9060 tan plana como la Samba, y la silueta es
# justamente lo que distingue a un modelo de otro. Normalizando por largo, cada
# uno conserva SU proporcion y los catorce quedan a la misma escala -- que es lo
# que pide la regla del rollo: un rollo, un encuadre.
#
# 1900 y no el maximo: casi todas las fuentes rondan los 2048 de ancho con algo
# de aire, asi que este numero deja a la mayoria practicamente sin reescalar y
# solo corrige a las que vienen mas apretadas o mas holgadas.
LARGO_REF = 1900


def tinta(im):
    """La caja de lo que no es transparente.

    Umbral en 8 y no en 0: el recorte deja un halo casi transparente de un par
    de pixeles, y midiendo desde 0 la caja crece distinto en cada foto -- que es
    justo el salto que la caja union existe para evitar.
    """
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 8)
    if not len(xs):
        sys.exit('foto vacia')
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def main():
    piezas = []
    for fichero, ident in CATALOGO:
        ruta = os.path.join(FUENTE, fichero)
        if not os.path.exists(ruta):
            sys.exit('FALTA %s' % ruta)
        im = Image.open(ruta).convert('RGBA')
        im = im.crop(tinta(im))
        ancho0 = im.width
        k = LARGO_REF / float(im.width)
        im = im.resize((max(1, int(round(im.width * k))),
                        max(1, int(round(im.height * k)))), Image.LANCZOS)
        piezas.append((im, ident))
        print('  %-18s tinta %dx%d  largo %d -> %d  (x%.3f)'
              % (ident, im.width, im.height, ancho0, im.width, k))

    ancho = max(p[0].width for p in piezas) + MARGEN * 2
    alto = max(p[0].height for p in piezas) + MARGEN * 2
    escala = min(1.0, MAX_LADO / float(max(ancho, alto)))
    lienzo = (int(round(ancho * escala)), int(round(alto * escala)))
    print('\ncaja union %dx%d  ->  lienzo %dx%d (escala %.3f)'
          % (ancho, alto, lienzo[0], lienzo[1], escala))

    os.makedirs(DESTINO, exist_ok=True)
    for im, ident in piezas:
        hoja = Image.new('RGBA', (ancho, alto), (0, 0, 0, 0))
        # CENTRADO EN LOS DOS EJES y no apoyado en la suela. En el rollo el
        # zapato va girado y escalado desde su centro, asi que el centro es el
        # punto que tiene que coincidir entre uno y otro. Alineando por la suela,
        # los altos se agarran abajo y el giro balancea.
        hoja.paste(im, ((ancho - im.width) // 2, (alto - im.height) // 2))
        if escala < 1.0:
            hoja = hoja.resize(lienzo, Image.LANCZOS)
        dst = os.path.join(DESTINO, '%s.webp' % ident)
        hoja.save(dst, 'WEBP', quality=88, method=6)
        print('  %-18s %d KB' % (ident + '.webp', os.path.getsize(dst) // 1024))


if __name__ == '__main__':
    main()
