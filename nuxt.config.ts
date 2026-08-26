import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'shadcn-nuxt'],

  css: ['~/assets/css/main.css'],

  /* Los componentes se nombran por su FICHERO, no por su carpeta:
     components/nav/AppNav.vue → <AppNav>, no <NavAppNav>.
     Las carpetas son para organizar, no para renombrar. */
  components: [{ path: '~/components', pathPrefix: false }],

  /* Los stores se auto-importan igual que los composables. `imports.dirs` es
     relativo a srcDir (app/) y no depende de la versión del módulo de Pinia. */
  imports: {
    dirs: ['stores'],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  app: {
    head: {
      title: '20 Avenida',
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'color-scheme', content: 'dark' },
      ],

      /* BEBAS NEUE, y en TODO el sitio: cuerpo, títulos, banners, precios,
         navegación, pie, botones y tallas. UNA sola familia; el reparto en dos
         —rótulo aparte del cuerpo— se probó y se deshizo. La pila de reserva
         está en `tokens.css`, en `--av-font`.

         UN SOLO CORTE, el 400, y por eso `family=Bebas+Neue` va sin `wght@`: no
         es una variable a la que se le pida una instancia, y pedirle cortes que
         no tiene devuelve el mismo fichero repetido. Los pesos de 500 a 900 que
         declaran los componentes no tienen instancia, y `main.css` deja apagado
         el engorde sintético para que caigan limpios en el 400.

         NO TIENE CAJA BAJA. Los glifos de minúscula no existen en el fichero, y
         donde no hay glifo el navegador pinta la mayúscula. O sea que TODO el
         sitio se lee en versales, se escriba como se escriba en la plantilla, y
         la REGLA R1 —«nunca versales», `docs/10-componentes.md`— queda sin
         efecto mientras esta familia esté puesta.

         La regla sigue escrita y los componentes siguen escribiendo en caja de
         frase, que es lo correcto: el día que se cambie de letra, todo vuelve a
         leerse como manda R1 sin tocar una sola plantilla. Lo que NO hay que
         hacer es reescribir los textos en mayúsculas «ya que se ven así» — eso
         sí sería irreversible.

         Y EL TRAZO SÍ SE PUSO, que es la otra mitad de R1: la regla dice que
         con las versales se va el trazo ancho que las acompañaba, así que al
         volver las versales vuelve el trazo. Está en `tokens.css`, en
         `--av-track`, y es la razón de que la página ya no se lea apelmazada.

         `display=swap` porque el texto tiene que estar desde el primer frame:
         con el `block` por defecto habría hasta 3 s de hueco en blanco donde va
         la palabra. Se pinta con la de reserva y se cambia al llegar la buena, y
         el salto de ancho no descoloca nada — `useFitText` vuelve a medir con
         `document.fonts.ready`, que es justo el caso para el que está.

         Los dos `preconnect` van porque son DOS dominios: el CSS sale de
         `googleapis` y el fichero de la letra de `gstatic`. Sin el segundo, el
         navegador no abre esa conexión hasta que ha leído el CSS, y ahí se
         pierde el viaje de ida y vuelta que más se nota. `gstatic` es anónimo
         —las fuentes se piden en modo CORS— y sin `crossorigin` la conexión
         precalentada no vale para la petición real. */
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
        },
      ],
    },
  },
})
