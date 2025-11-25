import request from './request'

export const analysisApi = {
    // 获取系统统计
    getSystemStats() {
        return request.get('/analysis/stats')
    },

    // 获取访问趋势
    getAccessTrend(days = 7) {
        return request.get(`/analysis/access-trend?days=${days}`)
    },

    // 获取角色分布
    getRoleDistribution() {
        return request.get('/analysis/role-distribution')
    },

    // 获取最近访问记录
    getRecentAccessLogs() {
        return request.get('/analysis/recent-access')
    }
}
