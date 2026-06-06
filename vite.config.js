import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Obfuscates our own source (everything under src/) in the production build so
    // the shipped JavaScript — web bundle AND the Electron app.asar — becomes
    // unreadable scrambled code instead of clean, copy-pasteable source.
    // Scoped to src/ only: third-party libraries (React, etc.) are left untouched
    // so startup stays fast and nothing breaks. Dev mode is unaffected (apply:build).
    obfuscator({
      apply: 'build',
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: [/node_modules/],
      options: {
        compact: true,
        identifierNamesGenerator: 'hexadecimal',
        simplify: true,
        numbersToExpressions: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        // Pull every string literal into an encoded array → no plain-text labels,
        // messages, or logic strings survive in the shipped files.
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        stringArrayCallsTransform: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        // Kept off on purpose: these can break a React app or bloat it heavily.
        deadCodeInjection: false,
        selfDefending: false,
        debugProtection: false,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
      },
    }),
  ],
  base: './', // relative asset paths — required so the packaged Electron app loads via file://
  server: {
    host: true, // expose on LAN so the app opens from any device on the same network
    port: 5173,
  },
})
