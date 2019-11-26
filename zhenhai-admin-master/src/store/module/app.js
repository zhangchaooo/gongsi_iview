import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead
  // getMenuByRouter
} from '@/libs/util'
import { communityApply } from '@/api/global/apply'
import beforeClose from '@/router/before-close'
// import { saveErrorLogger } from '@/api/data'
import router from '@/router'
import routers from '@/router/routers'
import config from '@/config'
import { getValueArray } from '@/libs/tools'
const { homeName } = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

export default {
  state: {
    added: false, // 加载路由标志
    globalState: false, // 默认全局状态
    menuShow: 'block', // 左侧菜单默认展开
    globalMenuList: [],
    menuList: [],
    menuListBackups: [],
    allList: [],
    navList: [], // 顶部菜单
    routers: [routers],
    currNav: '', // 当前顶部菜单name
    currNavTitle: '', // 当前顶部菜单标题
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: getHomeRoute(routers, homeName),
    local: localRead('local'),
    errorList: [],
    hasReadErrorPage: false,
    buttonLoading: false
  },
  getters: {
    // menuList: (state, getters, rootState) => getMenuByRouter(routers, rootState.user.access),
    errorCount: state => state.errorList.length
  },
  mutations: {
    updatemenuShow (state, v) {
      state.menuShow = v
    },
    updateGlobalState (state, v) {
      state.globalState = v
    },
    updateButtonLoading (state, v) {
      state.buttonLoading = v
    },
    updateMenulist (state, routes) {
      state.menuList = routes
    },
    updateMenulistBackups (state, routes) {
      state.menuListBackups = routes
    },
    updateGlobalMenulist (state, routes) {
      state.globalMenuList = routes
    },
    // 动态添加主界面路由，需要缓存
    updateAppRouter (state, routes) {
      state.routers.push(...routes)
      router.addRoutes(routes)
    },
    // 动态添加全局路由404、500等页面，不需要缓存
    updateDefaultRouter (state, routes) {
      router.addRoutes(routes)
    },
    setAdded (state, v) {
      state.added = v
    },
    setNavList (state, list) {
      state.navList = list
    },
    setAllList (state, list) {
      state.allList = list
    },
    setCurrNav (state, v) {
      state.currNav = v
    },
    setCurrNavTitle (state, v) {
      state.currNavTitle = v
    },
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      if (
        route.meta &&
        route.meta.beforeCloseName &&
        route.meta.beforeCloseName in beforeClose
      ) {
        new Promise(beforeClose[route.meta.beforeCloseName]).then(close => {
          if (close) {
            closePage(state, route)
          }
        })
      } else {
        closePage(state, route)
      }
    },
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },
    addError (state, error) {
      state.errorList.push(error)
    },
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    }
  },
  actions: {
    addErrorLog ({ commit, rootState }, info) {
      if (!window.location.href.includes('error_logger_page')) {
        commit('setHasReadErrorLoggerStatus', false)
      }
      const {
        user: { token, userId, userName }
      } = rootState
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userId,
        userName
      }
      // saveErrorLogger(info).then(() => {
      //   commit('addError', data)
      // })
    },
    handleCommunityApply ({ commit, state }) {
      // 获取当前社区的应用权限列表
      return new Promise((resolve, reject) => {
        communityApply()
          .then(res => {
            if (res) {
              const applyMenuList = JSON.parse(
                JSON.stringify(state.menuListBackups)
              )
              applyMenuList.forEach(e => {
                if (e.name == 'community-app') {
                  e.children = e.children.filter(item =>
                    getValueArray(res, 'name').includes(item.title)
                  )
                }
              })
              commit('updateMenulist', applyMenuList)
              resolve()
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  }
}
