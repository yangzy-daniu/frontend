import { defineConfig } from 'vite'// Vite 提供的类型提示辅助函数，用于配置智能提示。
import vue from '@vitejs/plugin-vue'// Vite 的 Vue.js 插件，支持 Vue 单文件组件（SFC）
import { fileURLToPath, URL } from 'node:url'// Node.js 模块，用于处理文件路径和 URL 转换

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',//'0.0.0.0'：允许所有网络接口访问（包括局域网、外网） 'localhost' 或 '127.0.0.1'：只能本机访问
    port: 3000,// 不指定（Vite默认端口5173）
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',// 打包后的文件放在 dist 文件夹
    sourcemap: false // 不生成sourcemap文件
  }
})
