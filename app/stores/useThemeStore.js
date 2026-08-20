/**
 * Estado del escenario: qué fondo hay debajo y cuánto grano lleva.
 *
 * Lo que este store YA NO decide, y es la diferencia importante: nada del
 * material. El velo es negro fijo, el glifo es blanco fijo y la luz la calcula
 * cada superficie desde su propio centro. El escenario es el escenario; el
 * vidrio no le pregunta nada.
 */
import { defineStore } from 'pinia'
import {
  BACKGROUNDS, DEFAULT_BACKGROUND, backgroundById,
  toGradientCss, GRAIN_URL, GRAIN_DEFAULT,
} from '~/assets/js/backgrounds'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    backgroundId: DEFAULT_BACKGROUND,
    grain: GRAIN_DEFAULT,          // 0–100 · 3–6 % mata el banding de 8 bits
  }),

  getters: {
    backgrounds: () => BACKGROUNDS,
    background: state => backgroundById(state.backgroundId),
    isDark() { return this.background.dark },

    stageStyle() {
      return {
        backgroundColor: this.background.stops.at(-1)[1],
        backgroundImage: toGradientCss(this.background),
      }
    },

    grainStyle() {
      return { backgroundImage: GRAIN_URL, opacity: this.grain / 100 }
    },
  },

  actions: {
    setBackground(id) { this.backgroundId = id },
  },
})
