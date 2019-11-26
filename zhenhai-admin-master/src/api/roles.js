import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const rolesList = params => {
  return getRequest('/base/admin/roles', params)
}

export const roles = (id, params) => {
  return getRequest('/base/admin/roles/' + id, params)
}

export const rolesCreate = params => {
  return postRequest('/base/admin/roles/', params)
}

export const rolesDelete = (id, params) => {
  return deleteRequest('/base/admin/roles/' + id, params)
}

export const rolesDeletes = params => {
  return deleteRequest('/base/admin/roles/delete/', params)
}

export const rolesEdit = (id, params) => {
  return putRequest('/base/admin/roles/' + id, params)
}

// 分配给角色相应权限
export const editRolePermission = (id, params) => {
  return postRequest('/base/admin/role-permission/' + id, params)
}
