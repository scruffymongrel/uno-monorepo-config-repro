import { defineConfig, presetWebFonts, presetUno } from 'unocss'

export default () => {
  return defineConfig({
    cli: {
      entry: {
        patterns: [
          '**/*.jsx'
        ]
      }
    },
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
