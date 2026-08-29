/**
 * Las categorías — la tira de `<HomeHero>`.
 *
 * Una categoría es un NOMBRE y una foto. Nada más: no tiene color propio ni
 * productos apuntados, porque lo que hace en la portada es llevar a un listado
 * que todavía no existe. Cuando exista, aquí entra su `href` y el componente no
 * se entera.
 *
 * EL ORDEN ES EL DE LA TIRA y no es alfabético: va de la prenda más grande a la
 * más pequeña —abrigo, top, playera— y cierra con las dos que no son ropa,
 * calzado y accesorios. Es el mismo orden con el que uno se viste, que es el
 * único que no hay que explicar.
 *
 * LAS FOTOS SALEN DE `scripts/build-home.py`, que las lee de
 * `resources/categories/` y las deja en 640×~800 —proporción 4:5, la misma que
 * la card— así que `object-fit: cover` no recorta nada. El rótulo de campaña va
 * CENTRADO dentro de cada foto: recortarlas se lo comería.
 *
 * `alt` NO REPITE EL NOMBRE. La card ya escribe «Hoodies» al pie, y un lector de
 * pantalla que oiga «Hoodies, Hoodies» está oyendo el mismo dato dos veces. Aquí
 * va lo que la foto ENSEÑA, que es lo que el rótulo no dice.
 */
export const CATEGORIAS = [
  {
    id: 'hoodies',
    name: 'Hoodies',
    foto: '/home/cat-hoodies.webp',
    alt: 'Modelo con conjunto técnico de capucha, brazos abiertos',
  },
  {
    id: 'tops',
    name: 'Tops',
    foto: '/home/cat-tops.webp',
    alt: 'Modelo con top corto de manga larga',
  },
  {
    id: 'playeras',
    name: 'Playeras',
    foto: '/home/cat-playeras.webp',
    alt: 'Modelo con conjunto verde de manga larga',
  },
  {
    id: 'calzado',
    name: 'Calzado',
    foto: '/home/cat-calzado.webp',
    alt: 'Par de zapatillas metalizadas, de perfil',
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    foto: '/home/cat-accesorios.webp',
    alt: 'Modelo sosteniendo un bolso dorado',
  },
]

export const CATEGORIA_IDS = CATEGORIAS.map(c => c.id)
