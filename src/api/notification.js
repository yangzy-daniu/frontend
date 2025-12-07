import request from './request'

// 获取通知列表
export function getDashboardNotifications() {
    return request({
        url: '/notification/dashboard',
        method: 'get'
    })
}

// 获取通知列表
export function getNotifications(params) {
    return request({
        url: '/notification/list',
        method: 'get',
        params
    })
}

// 获取通知详情
export function getNotificationDetail(id) {
    return request({
        url: `/notification/${id}`,
        method: 'get'
    })
}

// 标记为已读
export function markNotificationAsRead(id) {
    return request({
        url: `/notification/${id}/read`,
        method: 'put'
    })
}

// 获取未读数量
export function getUnreadCount() {
    return request({
        url: '/notification/unread-count',
        method: 'get'
    })
}

// 批量标记已读
export function markAllAsRead() {
    return request({
        url: '/notification/mark-all-read',
        method: 'put'
    })
}

// 删除通知
export function deleteNotification(id) {
    return request({
        url: `/notification/${id}`,
        method: 'delete'
    })
}
