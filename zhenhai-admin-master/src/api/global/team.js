import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const tissueList = params => {
  return getRequest('/base/admin/tissue', params)
}

export const tissueUserList = params => {
  return getRequest('/base/admin/tissue-staff', params)
}

export const tissue = (id, params) => {
  return getRequest('/base/admin/tissue/' + id, params)
}

export const tissueCreate = params => {
  return postRequest('/base/admin/tissue/', params)
}

export const tissueDelete = (id, params) => {
  return deleteRequest('/base/admin/tissue/' + id, params)
}

export const tissueDeletes = params => {
  return deleteRequest('/base/admin/tissue/delete/', params)
}

export const tissueEdit = (id, params) => {
  return putRequest('/base/admin/tissue/' + id, params)
}

export const tissueMoveUp = (id, params) => {
  return putRequest('/base/admin/tissue/' + id + '/move-up', params)
}
