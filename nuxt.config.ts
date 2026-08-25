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

      /* Playfair Display, y SÓLO para el texto gigante del fondo del showcase
         (`--av-font-display`). El cuerpo del sistema sigue siendo la pila del
         sistema: no se descarga ni un byte para leer una etiqueta.

         Se pide UN corte —900, sin cursiva— y no el rango variable entero. La
         familia es variable de 400 a 900 en dos ejes, y traerla completa son
         ~120 KB para usar exactamente un peso. Con `wght@900` Google sirve una
         instancia estática de ~30 KB. Si algún día hace falta otro peso, se
         añade aquí y no en el componente.

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
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
