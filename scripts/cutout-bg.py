#!/usr/bin/env python
"""
Recorta el fondo blanco de fotos de producto y las deja con alfa.

    # una suelta
    python scripts/cutout-bg.py resources/foo.webp public/products/foo.webp

    # una SECUENCIA (encuadre comun, numerada en orden)
    python scripts/cutout-bg.py --seq public/products/samba a.webp b.webp c.webp

Por que asi, y no un umbral global:

  * **Relleno por inundacion desde los cuatro bordes.** Un umbral global se come
    las partes claras del propio zapato -- las tres bandas del Samba son casi
    blancas. La inundacion solo alcanza lo conectado con el borde de la imagen,
    asi que las bandas sobreviven.
  * **Por spans, no por pixel.** Una imagen de 2400x2400 son 5.7 M de pixeles;
    un BFS pixel a pixel en Python tarda minutos. Rellenando tramos horizontales
    enteros -- y localizando sus extremos con `searchsorted` sobre los no-blancos
    de cada fila -- son unos cientos de operaciones por imagen. Las ocho se
    procesan en menos de dos segundos.
  * **La sombra de estudio NO se quita subiendo la tolerancia.** Se probo, con
    capturas y contando pixeles: el borde de la sombra y el talon blanco del
    zapato valen practicamente lo mismo, asi que cualquier tolerancia que
    atraviese la sombra entra tambien por el talon y se lo come. Se quita por
    geometria, en `foreground()`.
  * **La sombra la pone el CSS.** Se recorta la del estudio y el componente usa
    `drop-shadow`, que sigue la silueta real y se adapta a cualquier fondo. La
    del estudio, compuesta sobre un fondo de color, ademas ACLARARIA en vez de
    oscurecer.
  * **Encuadre COMUN en modo secuencia.** Recortar cada frame a su propio
    contenido normalizaria cada zapato a su caja y el tamano saltaria de un
    frame al siguiente. Se calcula la caja union de todos y se recorta igual a
    todos: eso es lo que hace que la secuencia se lea como movimiento y no como
    un pase de diapositivas.

Opciones:
  --tol=N     tolerancia del blanco (por defecto 44). BAJA a proposito: solo
              tiene que quitar el fondo blanco, sin arriesgar la silueta. De la
              sombra se encarga la regla geometrica de `foreground()`, no esta.
              Subirla no ayuda y hace dano: a 78 la inundacion ya entra por el
              talon blanco del frame 03 y le come el borde.
  --max=N     lado maximo de salida en px (por defecto 1400). Las fuentes vienen
              a 2400 y en pantalla no se ven a mas de ~900.
  --margin=N  aire alrededor del contenido (por defecto 24).
  --dark      el fondo es OSCURO, no blanco (el letrero de la marca). Usa
              `foreground_dark`, que es mucho mas simple porque ahi el
              histograma esta partido en dos y no hay ambiguedad.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter


def span_flood(passable, seeds):
    """
    Inundacion por tramos horizontales sobre `passable` (bool HxW).
    Devuelve la mascara alcanzada desde `seeds`. Los extremos de cada tramo se
    localizan con searchsorted sobre los indices no-pasables de la fila, asi que
    el coste va con el numero de tramos, no con el de pixeles.
    """
    h, w = passable.shape
    hit = np.zeros((h, w), dtype=bool)
    stops = [np.flatnonzero(~passable[y]) for y in range(h)]

    def bounds(y, x):
        nz = stops[y]
        i = np.searchsorted(nz, x)
        left = int(nz[i - 1]) + 1 if i > 0 else 0
        right = int(nz[i]) - 1 if i < nz.size else w - 1
        return left, right

    stack = [s for s in seeds if passable[s[0], s[1]]]
    while stack:
        y, x = stack.pop()
        if hit[y, x] or not passable[y, x]:
            continue
        l, r = bounds(y, x)
        hit[y, l:r + 1] = True
        for ny in (y - 1, y + 1):
            if not (0 <= ny < h):
                continue
            seg = passable[ny, l:r + 1] & ~hit[ny, l:r + 1]
            idx = np.flatnonzero(seg)
            if idx.size == 0:
                continue
            starts = np.concatenate(([0], np.flatnonzero(np.diff(idx) > 1) + 1))
            for s in starts:
                stack.append((ny, l + int(idx[s])))
    return hit


def grow(m):
    """Dilata una mascara un pixel en las cuatro direcciones."""
    d = m.copy()
    d[1:] |= m[:-1]; d[:-1] |= m[1:]
    d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
    return d


def main_component(mask):
    """
    La mancha conectada MAS GRANDE de `mask`.

    Por tamano y no por cercania al centro de masa: sembrar en el pixel mas
    proximo al centroide parece razonable y falla en cuanto hay una mota suelta
    ahi -- en el frame 01 el centroide caia sobre una isla de 3 px y devolvia esa,
    dejando el zapato entero fuera.
    """
    comps = components(mask, min_px=1)
    return comps[0] if comps else mask


def components(mask, min_px=40):
    """Todas las manchas conectadas de `mask`, de mayor a menor."""
    out = []
    left = mask.copy()
    while left.any():
        ys, xs = np.nonzero(left)
        c = span_flood(left, [(int(ys[0]), int(xs[0]))])
        left &= ~c
        if c.sum() >= min_px:
            out.append(c)
    out.sort(key=lambda c: -c.sum())
    return out


def foreground(im, tol, sat_min=13, dark_max=125, out_max=0.35):
    """
    True donde esta el producto.

    Tres pasos, y el tercero es el que importa:

      1. **Inundacion desde los bordes** sobre el blanco: quita el fondo. Con
         tolerancia BAJA, a proposito -- ver la nota de `--tol`.
      2. **El nucleo:** lo inequivocamente zapato, o sea con COLOR (sat alta) o
         MUY oscuro. El umbral de oscuridad es 125 y no 185 por un motivo
         concreto: una sombra de estudio tambien es oscura y acromatica, y a 185
         entraba entera en el nucleo, pegada a la suela y ya inseparable. Por
         debajo de 125 no llega ninguna sombra de estas fotos, y si llegan el
         interior del zapato y los cordones. Se conserva su mancha mayor.
      3. **Lo ambiguo se decide por GEOMETRIA, no por color** -- porque por color
         no se puede. Medido sobre estas fotos: el talon blanco del Samba tiene
         saturacion 7.5 y las tres bandas entre 5.7 y 6.4. La sombra de estudio,
         entre 1.0 y 5.6. Se solapan. Y por claridad tampoco: el talon esta en
         min 215 y hay sombra en min 200.

         Lo que SI los separa es que el talon y las bandas estan METIDOS en el
         zapato y la sombra SOBRESALE al fondo. Asi que de cada mancha ambigua se
         mide que porcentaje de su contorno da al fondo, y se tira la que pase de
         `out_max`.

         El reparto no esta apretado: sobre los seis frames, lo que hay que
         conservar llega como mucho a 0.32 y lo que hay que tirar empieza en
         0.49. El 0.35 cae en medio de ese hueco.
    """
    a = np.asarray(im, dtype=np.int16)
    mn = a.min(axis=2)
    sat = a.max(axis=2) - mn
    h, w = mn.shape

    white = (a >= (255 - tol)).all(axis=2)
    seeds = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)]
    seeds += [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]
    bg = span_flood(white, seeds)
    fg = ~bg
    if not fg.any():
        return fg

    body = main_component(fg & ((sat > sat_min) | (mn < dark_max)))
    if not body.any():
        return main_component(fg)

    keep = body.copy()
    for c in components(fg & ~body):
        edge = grow(c) & ~c
        total = int(edge.sum())
        if total and int((edge & bg).sum()) / total < out_max:
            keep |= c
    return keep


def foreground_dark(im, tol):
    """
    Para fotos con el fondo OSCURO en vez de blanco -- el letrero de 20 Avenida:
    rotulo encendido sobre listones casi negros.

    Aqui no hace falta nada de la maquinaria del zapato: el histograma esta
    partido en dos (mediana del maximo de canal en 33, tercer cuartil en 253) y
    el borde no pasa de 59, asi que una inundacion sobre lo oscuro separa fondo
    y rotulo sin discusion. Se conserva todo lo que la inundacion no alcanza,
    contraformas de las letras incluidas.
    """
    a = np.asarray(im, dtype=np.int16)
    dark = (a <= tol).all(axis=2)
    h, w = dark.shape
    seeds = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)]
    seeds += [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]
    return ~span_flood(dark, seeds)


def cut(path, tol, max_side, dark=False):
    im = Image.open(path).convert('RGB')
    if max_side and max(im.size) > max_side:
        k = max_side / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    fg = foreground_dark(im, tol) if dark else foreground(im, tol)
    # medio pixel de difuminado: sin esto el recorte deja un halo blanco de un
    # pixel que sobre un fondo de color se ve muchisimo
    mask = Image.fromarray(np.where(fg, 255, 0).astype(np.uint8), 'L')
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    out = im.convert('RGBA')
    out.putalpha(mask)
    box = mask.point(lambda v: 255 if v > 8 else 0).getbbox()
    return out, box


def save(im, path):
    if path.lower().endswith('.webp'):
        im.save(path, 'WEBP', quality=90, method=6)
    else:
        im.save(path, 'PNG', optimize=True)


def pad(box, size, margin):
    l, t, r, b = box
    w, h = size
    return (max(0, l - margin), max(0, t - margin), min(w, r + margin), min(h, b + margin))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    opts = dict(f.split('=', 1) for f in flags if '=' in f)
    tol = int(opts.get('--tol', 44))
    max_side = int(opts.get('--max', 1400))
    margin = int(opts.get('--margin', 24))
    dark = '--dark' in flags

    if '--seq' in flags:
        outdir, sources = args[0], args[1:]
        os.makedirs(outdir, exist_ok=True)
        cuts = []
        for p in sources:
            im, box = cut(p, tol, max_side)
            print('  - %s  %dx%d  caja %s' % (os.path.basename(p), im.size[0], im.size[1], box))
            cuts.append((im, box))
        ls, ts, rs, bs = zip(*[c[1] for c in cuts])
        # el encuadre comun, para que el zapato no salte de tamano entre frames
        box = pad((min(ls), min(ts), max(rs), max(bs)), cuts[0][0].size, margin)
        print('encuadre comun %s -> %dx%d' % (box, box[2] - box[0], box[3] - box[1]))
        for i, (im, _) in enumerate(cuts, 1):
            dst = os.path.join(outdir, '%02d.webp' % i)
            save(im.crop(box), dst)
            print('%s  %d KB' % (dst, os.path.getsize(dst) // 1024))
    else:
        src, dst = args[0], args[1]
        im, box = cut(src, tol, max_side, dark)
        im = im.crop(pad(box, im.size, margin))
        save(im, dst)
        print('%s  %dx%d  %d KB' % (dst, im.size[0], im.size[1], os.path.getsize(dst) // 1024))


if __name__ == '__main__':
    if len([a for a in sys.argv[1:] if not a.startswith('--')]) < 2:
        print(__doc__)
        sys.exit(1)
    main()
