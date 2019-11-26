import { getRequest, postRequest } from '@/libs/request'
// 访问日志
export const systemLogGet = params => {
  return getRequest('/base/admin/system-log', params)
}

export const settingSiteGet = params => {
  return getRequest('/base/admin/setting/site', params)
}

export const settingSiteSet = params => {
  return postRequest('/base/admin/setting/site', params)
}

export const settingWechatGet = params => {
  return getRequest('/base/admin/setting/wechat', params)
}

export const settingWechatSet = params => {
  return postRequest('/base/admin/setting/wechat', params)
}

