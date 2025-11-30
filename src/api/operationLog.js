import request from './request'
// 操作日志API
export const getOperationLogs = (params) => request.get('/operation-logs/detailed', { params })
export const getOperationLogDetail = (id) => request.get(`/operation-logs/${id}`)
export const getRecentLogs = () => request.get('/operation-logs/recent')
// 导出当前页日志
export const exportOperationLogs = (params) => request({
    url: '/operation-logs/export',
    method: 'get',
    params: params,
    responseType: 'blob'
})
