import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const staffList = params => {
  return getRequest('/property/staff', params)
}

export const staff = (id, params) => {
  return getRequest('/property/staff/' + id, params)
}

export const staffCreate = params => {
  return postRequest('/property/staff/', params)
}

export const staffDelete = (id, params) => {
  return deleteRequest('/property/staff/' + id, params)
}

export const staffDeletes = params => {
  return deleteRequest('/property/staff/delete/', params)
}

export const staffEdit = (id, params) => {
  return putRequest('/property/staff/' + id, params)
}

export const staffBatchCreate = params => {
  return postRequest('/property/staff/batch-create', params)
}
