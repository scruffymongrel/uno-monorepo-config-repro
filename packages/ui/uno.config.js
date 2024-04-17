import { defineConfig, presetWebFonts, presetUno } from 'unocss'

export default () => {
  return defineConfig({
    presets: [
      presetUno(),
      presetWebFonts({
        provider: 'google',
        fonts: {
          sans: 'Roboto'
        }
      })
    ]
  })
}
