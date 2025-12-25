import request from './request'

// 系统信息API
export const getSystemInfo = () => request.get('/system-monitor/info')


// 系统统计数据API
export const getSystemStats = () => request.get('/system-monitor/stats')

// 资源趋势数据API
export const getResourceTrend = (resourceType, timeRange) =>
        request.get('/system-monitor/resource-trend', {
            params: {
                resourceType,
                timeRange
            }
        })

// 系统更新API
export const checkSystemUpdates = (version) =>
        request.get('/system/updates/check', { params: { version } })

export const getUpdateHistory = () =>
        request.get('/system/updates/history')

export const applySystemUpdate = (id) =>
        request.put(`/system/updates/${id}/apply`)

export const getCurrentVersion = () =>
        request.get('/system/updates/current-version')
