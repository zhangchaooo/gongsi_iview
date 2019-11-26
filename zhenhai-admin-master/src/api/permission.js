import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

// 获取全部菜单及操作按钮
export const getAllPermissionList = params => {
  return getRequest('/base/admin/all-menu', params)
}
// 添加权限
export const permissionCreate = params => {
  return postRequest('/base/admin/permission/', params)
}
// 编辑权限
export const permissionEdit = (id, params) => {
  return putRequest('/base/admin/permission/' + id, params)
}
// 删除权限
export const permissionDelete = (id, params) => {
  return deleteRequest('/base/admin/permission/' + id, params)
}

export const permissionDeletes = params => {
  return deleteRequest('/base/admin/permission/delete', params)
}
// 搜索权限
// export const searchPermission = params => {
//   return getRequest('/permission/search', params)
// }
