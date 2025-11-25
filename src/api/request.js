import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    // baseURL: 'http://localhost:9090/api',
    baseURL: import.meta.env.VITE_API_URL || '/api',  // 环境变量优先，默认/api
    timeout: 10000
})

// 请求拦截器 - 添加token
request.interceptors.request.use(
        config => {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        error => {
            return Promise.reject(error)
        }
)

// 响应拦截器 - 处理认证失败
request.interceptors.response.use(
        response => {
            return response
        },
        error => {
            if (error.response?.status === 401) {
                ElMessage.error('登录已过期，请重新登录')
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // 使用window.location跳转，避免router依赖
                window.location.href = '/login'
            }
            if (error.response?.status === 403) {
                ElMessage.error('没有权限访问该资源')
            }
            return Promise.reject(error)
        }
)

export default request
