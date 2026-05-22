import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run')
          ) {
            return 'vendor-router'
          }

          if (
            id.includes('node_modules/@reduxjs') ||
            id.includes('node_modules/react-redux') ||
            id.includes('node_modules/zustand')
          ) {
            return 'vendor-state'
          }

          if (id.includes('node_modules/@ant-design/icons')) {
            return 'vendor-icons'
          }

          if (
            id.includes('node_modules/antd') ||
            id.includes('node_modules/@ant-design') ||
            id.includes('node_modules/rc-')
          ) {
            return 'vendor-antd'
          }

          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/@ant-design/plots')
          ) {
            return 'vendor-charts'
          }

          if (
            id.includes('node_modules/@tiptap') ||
            id.includes('node_modules/prosemirror')
          ) {
            return 'vendor-editor'
          }

          const modulePath = id.split('node_modules/')[1]
          if (!modulePath) {
            return 'vendor'
          }

          const [scopeOrName, maybeName] = modulePath.split('/')
          const packageName =
            scopeOrName.startsWith('@') && maybeName
              ? `${scopeOrName}/${maybeName}`
              : scopeOrName

          return `vendor-${packageName.replace('@', '').replace('/', '-')}`
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
