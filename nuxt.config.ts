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
    },
  },
})
