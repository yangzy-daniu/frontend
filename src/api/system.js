import request from './request'

// 系统信息API
export const getSystemInfo = () => request.get('/system/info')
export const getOnlineUserCount = () => request.get('/system/online-users/count')
export const updateSystemInfo = (params) => request.put('/system/info', null, { params })
