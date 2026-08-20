# raw/

Originales sin procesar. **No se sirven**: de aquí salen los assets de
`public/` pasando por `scripts/`.

## Qué falta ahora mismo

`raw/samba.webp` — la foto del Samba OG verde. **webp vale perfectamente**, y de
hecho es el formato preferido: soporta alfa, pesa la mitad que el PNG y lo leen
todos los navegadores. jpg y png también sirven de entrada.

```bash
python scripts/cutout-bg.py raw/samba.webp public/products/samba-green.webp
```

La extensión de salida decide el formato.

Y `<ProductShowcase>` la recoge sola: la ruta ya está en el colorway
`samba-green` de `app/assets/js/colorways.js`.
