import request from './request'

// 用户管理API
export const getUserInfo = () => request.get('/user/info')
export const listUser = () => request.get('/users/getAllUsers')
export const addUser = (data) => request.post('/users/addUser', data)
export const delUser = (id) => request.delete(`/users/${id}`)
export const listUserByPage = (params) => request.get('/users/getUsersPage', { params })
export const batchDeleteUsers = (ids) => request.post('/users/batch-delete', ids)
export const updateUser = (id, data) => request.put(`/users/${id}`, data)
