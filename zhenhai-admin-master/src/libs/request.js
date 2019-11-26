import axios from 'axios'
import store from '@/store'
import { getToken, setToken } from '@/libs/util'
import router from '@/router/index'
import { Message } from 'view-design'
import Cookies from 'js-cookie'
import Qs from 'qs'
import config from '@/config'
const base =
  process.env.NODE_ENV === 'development'
    ? config.baseUrl.dev
    : config.baseUrl.pro

// 统一请求路径前缀
// let base = '/api'
// 超时设定
axios.defaults.timeout = 150000

axios.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = getToken()
    }

    // store.commit('updateButtonLoading', true)
    return config
  },
  err => {
    Message.error('请求超时')
    return Promise.resolve(err)
  }
)

// http response 拦截器
axios.interceptors.response.use(
  response => {
    const data = response.data
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    if (data.status === 'fail') {
    } else {
      // store.commit('updateButtonLoading', false)
      return data
    }
  },
  err => {
    store.commit('updateButtonLoading', false)
    if (err && err.response) {
      const errorMessage = err.response.data && err.response.data.message
      // 根据返回的code值来做不同的处理(和后端约定)
      switch (err.response.status) {
        case 401:
          // 未登录 清除已登录状态
          Cookies.set('userInfo', '')
          setToken()
          if (errorMessage !== null) {
            Message.error(errorMessage)
          } else {
            Message.error('未知错误，请重新登录')
          }
          if (router.history.current.name != 'login') {
            router.push('/login')
          }
          break
        case 403:
          // 没有权限
          if (errorMessage !== null) {
            Message.error(errorMessage)
          } else {
            Message.error('非法操作')
          }
          break
        case 500:
          // 错误
          if (errorMessage !== null) {
            Message.error(errorMessage)
          } else {
            Message.error('服务器错误')
          }
          break
        default:
          if (errorMessage !== null) {
            Message.error(errorMessage)
          } else {
            // 未知错误
            Message.error(err.toString())
          }
      }
    }

    return Promise.reject(err)
  }
)

export const getRequest = (url, params) => {
  return axios({
    method: 'get',
    url: `${base}${url}`,
    params: params,
    paramsSerializer: function (params) {
      return Qs.stringify(params, { arrayFormat: 'brackets' })
    }
    // headers: {
    //   Authorization: getToken()
    // }
  })
}

export const postRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    data: params
    // headers: {
    //   Authorization: getToken()
    // }
  })
}

export const putRequest = (url, params) => {
  return axios({
    method: 'patch',
    url: `${base}${url}`,
    data: params
    // headers: {
    //   // 'Content-Type': 'application/x-www-form-urlencoded',
    //   Authorization: getToken()
    // }
  })
}

export const deleteRequest = (url, params) => {
  return axios({
    method: 'delete',
    url: `${base}${url}`,
    data: params
    // headers: {
    //   Authorization: getToken()
    // }
  })
}

export const importRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    data: params
    // headers: {
    //   Authorization: getToken()
    // }
  })
}

// 文件上传接口
// export const uploadFile = `${base}` + '/admin/upload_image'

// 文件上传媒体库接口
// export const uploadFile = `${base}` + '/base/media'
export const uploadFile = `${base}` + '/aggregation/imageupload'
export const uploadFileRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    params: params
    // headers: {
    //   Authorization: getToken()
    // }
  })
}
