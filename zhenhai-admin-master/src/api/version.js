import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const versionList = params => {
  return getRequest('/base/admin/version', params)
}

export const version = (id, params) => {
  return getRequest('/base/admin/version/' + id, params)
}

export const versionCreate = params => {
  return postRequest('/base/admin/version/', params)
}

export const versionDelete = (id, params) => {
  return deleteRequest('/base/admin/version/' + id, params)
}

export const versionDeletes = params => {
  return deleteRequest('/base/admin/version/delete/', params)
}

export const versionEdit = (id, params) => {
  return putRequest('/base/admin/version/' + id, params)
}
