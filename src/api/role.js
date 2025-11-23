// role.js
import request from './request'

// 角色管理API
export const listRoleByPage = (params) => request.get('/roles/page', { params })
export const getRoleById = (id) => request.get(`/roles/${id}`)
export const addRole = (data) => request.post('/roles', data)
export const updateRole = (id, data) => request.put(`/roles/${id}`, data)
export const deleteRole = (id) => request.delete(`/roles/${id}`)
export const batchDeleteRoles = (ids) => request.post('/roles/batch-delete', ids)
export const checkRoleCode = (params) => request.get('/roles/check-code', { params })
