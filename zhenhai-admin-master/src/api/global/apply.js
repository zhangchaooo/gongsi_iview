import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const applyList = params => {
  return getRequest('/base/admin/apply', params)
}

export const apply = (id, params) => {
  return getRequest('/base/admin/apply/' + id, params)
}

// 判断当前社区菜单 社区内启用、禁用应用后调取 维护菜单
export const communityApply = () => {
  return getRequest('/base/admin/community-apply')
}

// export const applyCreate = params => {
//   return postRequest('/base/admin/apply/', params)
// }

// export const applyDelete = (id, params) => {
//   return deleteRequest('/base/admin/apply/' + id, params)
// }

// export const applyDeletes = params => {
//   return deleteRequest('/base/admin/apply/delete/', params)
// }

// 应用开关
export const applySwitch = (id, params) => {
  return putRequest('/base/admin/apply/' + id + '/switch', params)
}

export const applyEdit = (id, params) => {
  return putRequest('/base/admin/apply/' + id, params)
}
