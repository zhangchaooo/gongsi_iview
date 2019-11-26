import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const integralsList = params => {
  return getRequest('/community/integrals', params)
}

export const integralLogList = params => {
  return getRequest('/community/integral-log', params)
}

export const integrals = (id, params) => {
  return getRequest('/community/integrals/' + id, params)
}

export const integralsCreate = params => {
  return postRequest('/community/integrals/', params)
}

export const integralsDelete = (id, params) => {
  return deleteRequest('/community/integrals/' + id, params)
}

export const integralsDeletes = params => {
  return deleteRequest('/community/integrals/delete/', params)
}

export const integralsEdit = (id, params) => {
  return putRequest('/community/integrals/' + id, params)
}

export const integralsStart = (id, params) => {
  return putRequest('/community/integrals/start-or-stop/' + id, params)
}
