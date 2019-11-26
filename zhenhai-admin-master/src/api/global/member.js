import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const memberList = params => {
  return getRequest('/community/app-users', params)
}

export const member = (id, params) => {
  return getRequest('/community/app-users/' + id, params)
}

export const memberCreate = params => {
  return postRequest('/community/app-users/', params)
}

export const memberDelete = (id, params) => {
  return deleteRequest('/community/app-users/' + id, params)
}

export const memberDeletes = params => {
  return deleteRequest('/community/app-users/delete/', params)
}

export const memberEdit = (id, params) => {
  return putRequest('/community/app-users/' + id, params)
}
