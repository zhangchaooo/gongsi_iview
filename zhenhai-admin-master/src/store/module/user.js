import { login, logout, userInfo } from '@/api/user'
import { setToken, getToken } from '@/libs/util'

export default {
  state: {
    userNo: '',
    rolesName: '',
    userName: '',
    userId: '',
    staff: '',
    avatarImg: '',
    avatarImgPath: '',
    userCommunity: [],
    token: getToken(),
    access: '',
    hasGetInfo: false
  },
  mutations: {
    setAvatar (state, avatar) {
      state.avatarImg = avatar
    },
    setStaff (state, staff) {
      state.staff = staff
    },
    setAvatarPath (state, avatarPath) {
      state.avatarImgPath = avatarPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setUserNo (state, username) {
      state.userNo = username
    },
    setUserCommunity (state, data) {
      state.userCommunity = data
    },
    // setRolesName (state, rolesname) {
    //   state.rolesName = rolesname
    // },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { username, password }) {
      username = username.trim()
      return new Promise((resolve, reject) => {
        login({
          username,
          password
        })
          .then(res => {
            if (res) {
              const data = res
              commit('setToken', data.token_type + ' ' + data.access_token)
              // 登陆进来清空顶部菜单选中状态
              commit('setCurrNav', '')
              commit('updateGlobalState', true)
              window.localStorage.setItem('updateGlobalState', true)
              // 登陆重新计算一次pid
              resolve()
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            commit('setToken', '')
            commit('setAccess', [])
            resolve()
          })
          .catch(err => {
            reject(err)
          })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit, dispatch }) {
      return new Promise((resolve, reject) => {
        try {
          userInfo()
            .then(res => {
              const data = res
              // dispatch('handleCommunityList', {})
              commit('setAvatar', data.avatar)
              commit('setAvatarPath', data.avatar)
              commit('setUserName', data.name)
              commit('setUserNo', data.username)
              commit('setUserCommunity', data.userCommunity)
              commit('setStaff', data.staff)
              // commit('setRolesName', data.roles_name)
              commit('setUserId', data.user_id)
              // commit('setAccess', data.access)
              commit('setHasGetInfo', true)
              resolve(data)
            })
            .catch(err => {
              reject(err)
            })
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
