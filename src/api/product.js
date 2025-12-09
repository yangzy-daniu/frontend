import request from './request'

export function getPopularProducts() {
    return request({
        url: '/products/popular',
        method: 'get'
    })
}

export function getCategorySales(type = 'sales') {
    return request({
        url: '/products/category-sales',
        method: 'get',
        params: { type }
    })
}
