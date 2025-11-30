import request from './request'

// 系统统计API
export const getDashboardStats = () => request.get('/stats/dashboard-stats')
export const getSystemStats = () => request.get('/stats/system')
