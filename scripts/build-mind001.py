#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Arma la secuencia del scrollover del Nike Mind 001.

    python scripts/build-mind001.py

Lee de `resources/sneakers sin fondo/`, escribe en `public/products/mind001/`.
LOS SEIS FRAMES VIENEN YA RECORTADOS, con su canal alfa. Este script no recorta
nada: sólo encuadra.

HUBO UN RECORTE A MANO PARA S2 Y SE FUE ENTERO. Durante un rato S2 era el unico
que llegaba con fondo, asi que se leia de `sneaker con fondo/` y se le quitaba el
blanco aqui -- inundacion desde los bordes mas la envolvente de los nodos
naranjas de la suela, porque la sombra de estudio no se separaba por color. Nunca
quedo limpio: dejaba un halo gris bajo la suela y un parche claro detras, que es
lo que se veia en el frame 02.

Ya no hace falta: la fuente definitiva de S2 es un PNG con alfa como los otros
cinco. Un recorte hecho a mano sobre una foto que ya viene recortada solo puede
empeorarla, asi que la regla de esta pieza es UNA: si la fuente trae alfa, se
respeta tal cual y no se le anade ni se le quita nada.

POR QUE NO SIRVE `cutout-bg.py --seq`, que es la herramienta de la casa:

  * Estas fotos YA VIENEN con alfa. No hay fondo que inundar.
  * Y el `--seq` de aquel script calcula el encuadre comun en el espacio de
    coordenadas del PRIMER fichero, o sea que da por hecho que las seis fuentes
    miden lo mismo. Estas no: van de 2048x1008 a 1951x2048, porque cada toma se
    recorto por su cuenta.

LO QUE HACE ESTE, en tres pasos:

  1. Recorta cada frame a su TINTA -- a la caja de lo que no es transparente.
  2. NORMALIZA EL ALTO de los frames marcados -- ver `ALTO_REF`.
  3. Pega todos centrados en un lienzo comun, la CAJA UNION.
"""
import os
import sys

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
RECORTES = os.path.join(RAIZ, 'resources', 'sneakers sin fondo')
DESTINO = os.path.join(RAIZ, 'public', 'products', 'mind001')

MARGEN = 24
MAX_LADO = 1160

# ── EL ORDEN ES EL DE LOS FICHEROS, S1..S6 ──────────────────────────────────
#
# No es casual ni alfabetico: las tomas vienen numeradas EN EL ORDEN DE LA
# ORBITA, asi que S1..S6 ya es la vuelta. No hay nada que reordenar aqui, y no
# se debe: cualquier permutacion rompe el giro.
#
# La tercera columna es si el frame necesita que se le normalice el ALTO -- ver
# `ALTO_REF` mas abajo.
SECUENCIA = [
    ('S1', 'Perfil exterior', False),
    ('S2', '3/4 delantero',   False),
    ('S3', 'Puntera',         True),
    ('S4', 'Perfil interior', False),
    ('S5', '3/4 trasero',     False),
    ('S6', 'Talon',           True),
]

# El alto al que se llevan los frames marcados, en pixeles de la fuente.
#
# POR QUE HACE FALTA: las cuatro tomas de perfil y de 3/4 estan disparadas a una
# distancia y las dos frontales -- puntera y talon -- MUCHO mas cerca. La tinta
# de un perfil mide 768 px de alto y la de la puntera 1583: mas del doble. Como
# el encuadre comun se calcula sobre la mayor, sin corregirlo los perfiles
# quedaban en la mitad superior del lienzo y las frontales lo llenaban, asi que
# al girar el zapato pegaba un salto de tamano.
#
# POR QUE EL ALTO Y NO EL ANCHO NI EL AREA: la camara orbita alrededor de un eje
# VERTICAL, y en ese giro lo unico que no cambia es la altura del zapato -- el
# ancho aparente pasa de los 300 mm del largo a los 115 del ancho, y el area con
# el. Comprobado contra el objeto real: un perfil da 2.55:1 de proporcion y una
# frontal 1.07:1, que son las proporciones de 300x120 y 115x120 mm.
#
# 900 y no 768: en una frontal se ve el alto ENTERO del zapato, y en un perfil la
# cuna tapa parte del talon. 900 es la altura real medida en las tomas de 3/4,
# que son las que si lo ensenan.
ALTO_REF = 900


def tinta(im):
    """
    Caja de la TINTA, no la del fichero: alfa por encima de 8.

    El umbral no es 0 porque el recorte deja un halo de un par de pixeles casi
    transparente en el contorno, y midiendo desde 0 la caja crece unos pocos
    pixeles por lado de forma distinta en cada frame -- que es exactamente el
    salto de tamano que la caja union existe para evitar.
    """
    a = np.asarray(im.getchannel('A'))
    ys, xs = np.where(a > 8)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def abre(nombre):
    """Los seis, de `sneakers sin fondo/` y sin tocarles el alfa.

    Se prueban DOS nombres porque la exportacion no fue toda de una vez: cinco
    salieron con el sufijo del navegador -- `S1 (1).png` -- y S2, re-exportado
    despues para sustituir al recorte a mano, salio limpio como `S2.png`. Da
    igual cual sea: lo que importa es que el fichero traiga alfa, y los seis lo
    traen (PNG colortype 6, comprobado).
    """
    for fichero in ('%s (1).png' % nombre, '%s.png' % nombre):
        ruta = os.path.join(RECORTES, fichero)
        if os.path.exists(ruta):
            return Image.open(ruta).convert('RGBA')
    sys.exit('FALTA %s en %s' % (nombre, RECORTES))


def main():
    recortes = []
    for nombre, etiqueta, normaliza in SECUENCIA:
        im = abre(nombre)
        im = im.crop(tinta(im))
        alto0 = im.height
        if normaliza:
            k = ALTO_REF / float(im.height)
            im = im.resize((max(1, int(round(im.width * k))),
                            max(1, int(round(im.height * k)))), Image.LANCZOS)
            nota = '  alto %d -> %d  (x%.3f)' % (alto0, im.height, k)
        else:
            nota = ''
        recortes.append((im, etiqueta))
        print('  %-3s %-16s tinta %dx%d%s' % (nombre, etiqueta, im.width, im.height, nota))

    ancho = max(r[0].width for r in recortes) + MARGEN * 2
    alto = max(r[0].height for r in recortes) + MARGEN * 2
    escala = min(1.0, MAX_LADO / float(max(ancho, alto)))
    lienzo = (int(round(ancho * escala)), int(round(alto * escala)))
    print('\ncaja union %dx%d  ->  lienzo %dx%d (escala %.3f)'
          % (ancho, alto, lienzo[0], lienzo[1], escala))

    os.makedirs(DESTINO, exist_ok=True)
    for i, (im, etiqueta) in enumerate(recortes, 1):
        hoja = Image.new('RGBA', (ancho, alto), (0, 0, 0, 0))
        hoja.paste(im, ((ancho - im.width) // 2, (alto - im.height) // 2))
        if escala < 1.0:
            hoja = hoja.resize(lienzo, Image.LANCZOS)
        dst = os.path.join(DESTINO, '%02d.webp' % i)
        # `method=6` es el compresor lento de libwebp. Son seis ficheros que se
        # generan una vez: el tiempo no importa y el ahorro si.
        hoja.save(dst, 'WEBP', quality=88, method=6)
        print('  %02d.webp  %-16s %d KB' % (i, etiqueta, os.path.getsize(dst) // 1024))


if __name__ == '__main__':
    main()
