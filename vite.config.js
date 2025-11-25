import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'   // ← 新增

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))  // ← 关键
    }
  },
  server: {
    host: '0.0.0.0',//'0.0.0.0'：允许所有网络接口访问（包括局域网、外网） 'localhost' 或 '127.0.0.1'：只能本机访问
    port: 3000,// 不指定（Vite默认端口5173）
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist',// 打包后的文件放在 dist 文件夹
    sourcemap: false // 不生成sourcemap文件
  }
})
