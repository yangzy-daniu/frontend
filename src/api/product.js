import request from './request'

export function getPopularProducts() {
    return request({
        url: '/products/popular',
        method: 'get'
    })
}
