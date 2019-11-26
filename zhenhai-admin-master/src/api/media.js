import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const mediaList = params => {
  return getRequest('/base/admin/media', params)
}

export const media = (id, params) => {
  return getRequest('/base/admin/media/' + id, params)
}

export const mediaCreate = params => {
  return postRequest('/base/admin/media/', params)
}

export const mediaDelete = (id, params) => {
  return deleteRequest('/base/admin/media/' + id, params)
}

export const mediaDeletes = params => {
  return deleteRequest('/base/admin/media/delete/', params)
}

export const mediaEdit = (id, params) => {
  return putRequest('/base/admin/media/' + id, params)
}
