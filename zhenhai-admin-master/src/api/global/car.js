import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const carsList = params => {
  return getRequest('/cars', params)
}

export const cars = (id, params) => {
  return getRequest('/cars/' + id, params)
}

export const carsCreate = params => {
  return postRequest('/cars/', params)
}

export const carsDelete = (id, params) => {
  return deleteRequest('/cars/' + id, params)
}

export const carsDeletes = params => {
  return deleteRequest('/cars/delete/', params)
}

export const carsEdit = (id, params) => {
  return putRequest('/cars/' + id, params)
}
