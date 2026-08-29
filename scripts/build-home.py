#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Arma los assets de <HomeHero> — el cartel de portada con la tira de categorias.

    python scripts/build-home.py

Lee de `resources/categories/`, escribe en `public/home/`. Tres trabajos y cada
uno con su problema:

  1. LAS CINCO CATEGORIAS. Fotos de campana de 1633x2048 y 5-6 MB cada una. Son
     opacas enteras —comprobado: alfa minimo 255— asi que van a RGB y a webp:
     de 5.7 MB a unos 60 KB sin que se note, porque la card las pinta a 254 px de
     ancho en un monitor de 1440 y a 508 en una pantalla de doble densidad.

     NO SE RECORTAN. La proporcion de origen es 4:5 y la de la card tambien, asi
     que `object-fit: cover` no tiene nada que cortar. Recortarlas aqui ademas se
     comeria el rotulo de campana, que va CENTRADO en la foto.

  2. LA FIGURA. Ya viene recortada con alfa de verdad —21% de pixeles opacos— asi
     que aqui solo se le quita el aire transparente que le sobra por los cuatro
     lados. Ese margen no es inocente: la figura se ancla al borde derecho del
     cartel, y un lienzo con 100 px de nada a la derecha la despega de ahi sin
     que ninguna medida del CSS lo explique.

  3. EL SWOOSH, y este es el unico que tiene truco. El PNG de origen no trae
     transparencia: trae el DAMERO DE TRANSPARENCIA PINTADO COMO PIXELES. Se ve
     en los datos — la imagen entera tiene dos valores, 230 y 255, en cuadros de
     15x15 perfectamente alineados al origen.

     Y no se puede separar por color, porque el logo es BLANCO y la mitad del
     damero tambien: los cuadros claros del fondo son exactamente el mismo 255
     que el trazo.

     Lo que si se puede es usar la mitad que NO es ambigua. En los cuadros
     GRISES, un pixel blanco solo puede ser logo. Eso da el trazo muestreado en
     un tablero de ajedrez —la mitad de los pixeles, exactos— y el resto se
     rellena difundiendo esa informacion hacia los cuadros claros: la frontera
     del swoosh es localmente una linea recta a lo largo de 15 px, asi que
     interpolarla no inventa nada. Y el resultado se reduce despues 5 veces, con
     lo que cualquier error de medio cuadro acaba por debajo del pixel.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
ORIGEN = os.path.join(RAIZ, 'resources', 'categories')
DESTINO = os.path.join(RAIZ, 'public', 'home')

# fichero de origen -> fichero de salida. El ORDEN es el de la tira.
CATEGORIAS = [
    ('Categoria hoodie.png',    'cat-hoodies.webp'),
    ('categoria tops.png',      'cat-tops.webp'),
    ('categoria playera.png',   'cat-playeras.webp'),
    ('categoria calzado.png',   'cat-calzado.webp'),
    ('categoria accesorio.png', 'cat-accesorios.webp'),
]

# El ancho de la card en un monitor de 1440 es 254 px; 640 cubre el doble de
# densidad y sobra. Subir de aqui es peso que nadie ve.
ANCHO_CAT = 640

CUADRO = 15          # el lado del damero del swoosh, medido en los datos
ANCHO_SWOOSH = 420   # se pinta a ~150 px; 420 cubre densidad doble con margen


def tinta(im, umbral=8):
    """La caja de lo que no es transparente."""
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > umbral)
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def categorias():
    for src, dst in CATEGORIAS:
        im = Image.open(os.path.join(ORIGEN, src)).convert('RGB')
        alto = round(im.height * ANCHO_CAT / im.width)
        im = im.resize((ANCHO_CAT, alto), Image.LANCZOS)
        ruta = os.path.join(DESTINO, dst)
        im.save(ruta, 'WEBP', quality=82, method=6)
        print('%-24s -> %-20s %dx%d  %d KB' % (src, dst, ANCHO_CAT, alto,
                                               os.path.getsize(ruta) // 1024))


def figura():
    im = Image.open(os.path.join(ORIGEN, 'png.png')).convert('RGBA')
    im = im.crop(tinta(im))
    ruta = os.path.join(DESTINO, 'figura.webp')
    im.save(ruta, 'WEBP', quality=88, method=6)
    print('%-24s -> %-20s %dx%d  %d KB' % ('png.png', 'figura.webp', im.width,
                                           im.height, os.path.getsize(ruta) // 1024))


def swoosh():
    """El damero pintado, deshecho. Ver la nota de arriba."""
    g = np.array(Image.open(os.path.join(ORIGEN, 'icono.png')).convert('L'))
    h, w = g.shape

    # El tablero: cuadro (0,0) claro, y de ahi alternando. Sale de los datos —
    # la primera fila arranca en 255 y cambia a 230 justo en x=15.
    cx = (np.arange(w) // CUADRO)[None, :]
    cy = (np.arange(h) // CUADRO)[:, None]
    claro = ((cx + cy) % 2 == 0)

    blanco = (g >= 250).astype(np.float32)
    # En los cuadros OSCUROS el dato es exacto; en los claros, desconocido.
    conocido = ~claro

    u = np.where(conocido, blanco, 0.5).astype(np.float32)
    # Difusion de Jacobi: cada pixel desconocido tiende a la media de sus
    # vecinos, y los conocidos se reescriben en cada vuelta para que manden
    # ellos. Con 260 vueltas la informacion cruza de sobra los 15 px del cuadro.
    for _ in range(260):
        s = np.zeros_like(u)
        s[1:, :] += u[:-1, :]
        s[:-1, :] += u[1:, :]
        s[:, 1:] += u[:, :-1]
        s[:, :-1] += u[:, 1:]
        n = np.full_like(u, 4.0)
        n[0, :] -= 1; n[-1, :] -= 1; n[:, 0] -= 1; n[:, -1] -= 1
        u = s / n
        u[conocido] = blanco[conocido]

    # EL SUAVIZADO, y hace falta. La difusion acierta POR DONDE va la frontera,
    # pero la deja festoneada al ritmo del damero: cada cuadro claro la desvia un
    # poco hacia dentro o hacia fuera y el borde queda con dientes de 15 px. Un
    # desenfoque de medio cuadro promedia esos dientes —la frontera de verdad es
    # recta a esa escala, asi que el promedio cae encima de ella— y el umbral
    # vuelve a sacar una curva limpia.
    u = np.array(Image.fromarray((u * 255).astype(np.uint8), 'L')
                 .filter(ImageFilter.GaussianBlur(CUADRO / 2))).astype(np.float32) / 255

    alfa = np.clip((u - .46) / .10, 0, 1)          # umbral con un pelo de borde
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = 255                            # el swoosh es blanco liso
    rgba[..., 3] = (alfa * 255).astype(np.uint8)

    im = Image.fromarray(rgba, 'RGBA')
    im = im.crop(tinta(im, 24))
    alto = round(im.height * ANCHO_SWOOSH / im.width)
    im = im.resize((ANCHO_SWOOSH, alto), Image.LANCZOS)
    ruta = os.path.join(DESTINO, 'swoosh.webp')
    im.save(ruta, 'WEBP', quality=90, method=6, lossless=True)
    print('%-24s -> %-20s %dx%d  %d KB' % ('icono.png', 'swoosh.webp',
                                           im.width, alto,
                                           max(1, os.path.getsize(ruta) // 1024)))


def main():
    if not os.path.isdir(ORIGEN):
        raise SystemExit('no encuentro ' + ORIGEN)
    os.makedirs(DESTINO, exist_ok=True)
    categorias()
    figura()
    swoosh()


if __name__ == '__main__':
    main()
