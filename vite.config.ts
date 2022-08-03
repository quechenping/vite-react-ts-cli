import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    eslintPlugin({
      include: /\.(jsx?|tsx?|ts)$/
    }),
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: (name) => {
            return `antd/lib/${name}/style/index.less`
          }
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // 路径别名
      'rc-picker/es/generate/moment': 'rc-picker/es/generate/dayjs'
    },
    extensions: ['.js', '.json', '.ts', 'tsx'] // 使用路径别名时想要省略的后缀名，可以自己 增减
  },
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#4377FE' //设置antd主题色
        }
      }
    }
  }
})
