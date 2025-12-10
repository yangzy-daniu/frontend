import request from './request'

// 系统信息API
export const getSystemInfo = () => request.get('/system-monitor/info')

// 系统更新API
export const checkSystemUpdates = (version) =>
        request.get('/system/updates/check', { params: { version } })

export const getUpdateHistory = () =>
        request.get('/system/updates/history')

export const applySystemUpdate = (id) =>
        request.put(`/system/updates/${id}/apply`)

export const getCurrentVersion = () =>
        request.get('/system/updates/current-version')
