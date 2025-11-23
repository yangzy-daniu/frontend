import request from './request'

// 认证API
export const login = (data) => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
