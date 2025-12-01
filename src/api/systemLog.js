import request from './request'

// 获取系统日志列表
export function getSystemLogs(params) {
    return request({
        url: '/system-logs',
        method: 'get',
        params
    })
}

// 获取最近日志
export function getRecentLogs() {
    return request({
        url: '/system-logs/recent',
        method: 'get'
    })
}

// 获取日志统计
export function getSystemLogStats(params) {
    return request({
        url: '/system-logs/stats',
        method: 'get',
        params
    })
}

// 清空日志
export function clearSystemLogs() {
    return request({
        url: '/system-logs/clear',
        method: 'delete'
    })
}

// 导出日志
export function exportSystemLogs(params) {
    return request({
        url: '/system-logs/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}
