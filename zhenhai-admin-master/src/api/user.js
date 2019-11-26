import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const userList = params => {
  return getRequest('/base/admin/users', params)
}

export const user = (id, params) => {
  return getRequest('/base/admin/users/' + id, params)
}

export const userCreate = params => {
  return postRequest('/base/admin/users/', params)
}

export const userDelete = (id, params) => {
  return deleteRequest('/base/admin/users/' + id, params)
}

export const userDeletes = params => {
  return deleteRequest('/base/admin/users/delete/', params)
}

export const userEdit = (id, params) => {
  return putRequest('/base/admin/users/' + id, params)
}

export const enableUser = id => {
  return putRequest('/base/admin/users/' + id + '/editState', { state: 1 })
}

export const disableUser = id => {
  return putRequest('/base/admin/users/' + id + '/editState', { state: 0 })
}

// 登陆
export const login = ({ username, password }) => {
  return postRequest('/base/admin/login', { username, password })
}
// 获取用户登录信息
export const userInfo = params => {
  return getRequest('/base/admin/users/info', params)
}
// 退出
export const logout = params => {
  return deleteRequest('/base/admin/logout', params)
}

// 用户修改密码
export const passwordEdit = params => {
  return postRequest('/base/admin/passwordEdit', params)
}

// 用户修改资料
export const userInfoEdit = params => {
  return postRequest('/base/admin/users/updateInfo', params)
}

// 获取当前用户菜单
export const userMenu = params => {
  return getRequest('/base/admin/userMenu', params)
}

// 发送验证码 找回密码
export const passwordRetrieveCode = params => {
  return postRequest('/base/admin/password-retrieve-code', params)
}

// 验证 找回密码 验证码
export const verifyPasswordCode = params => {
  return postRequest('/base/admin/verify-password-code', params)
}

// 通过验证码 修改密码
export const resetPassword = params => {
  return postRequest('/base/admin/reset-password', params)
}
