import Cookies from 'js-cookie'
import lazyLoading from './lazyLoading.js'
// cookie保存的天数
import config from '@/config'
import axios from 'axios'
import { forEach, hasOneOf, objEqual } from '@/libs/tools'
const base =
  process.env.NODE_ENV === 'development'
    ? config.baseUrl.dev
    : config.baseUrl.pro
export const TOKEN_KEY = 'token'

export const setToken = token => {
  Cookies.set(TOKEN_KEY, token, { expires: config.cookieExpires || 1 })
}

export const getToken = () => {
  const token = Cookies.get(TOKEN_KEY)
  if (token) return token
  else return false
}

export function timeFix () {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9
    ? '早上好'
    : hour <= 11
      ? '上午好'
      : hour <= 13
        ? '中午好'
        : hour < 20
          ? '下午好'
          : '晚上好'
}

export function welcome () {
  const arr = [
    '休息一会儿吧',
    '准备吃什么呢?',
    '今天天气不错!',
    '我猜你可能累了'
  ]
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

export const hasChild = item => {
  return item.children && item.children.length !== 0
}

const showThisMenuEle = (item, access) => {
  if (item.meta && item.meta.access && item.meta.access.length) {
    if (hasOneOf(item.meta.access, access)) return true
    else return false
  } else return true
}
/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @returns {Array}
 */
export const getMenuByRouter = (list, access) => {
  let res = []
  forEach(list, item => {
    if (!item.meta || (item.meta && !item.meta.hideInMenu)) {
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: item.meta
      }
      if (
        (hasChild(item) || (item.meta && item.meta.showAlways)) &&
        showThisMenuEle(item, access)
      ) {
        obj.children = getMenuByRouter(item.children, access)
      }
      if (item.meta && item.meta.href) obj.href = item.meta.href
      if (showThisMenuEle(item, access)) res.push(obj)
    }
  })
  return res
}

// 查找父节点id
export const findParentId = (id, data) => {
  if (data[id] != undefined) {
    return findParentId(data[id], data)
  }
  return id
}

// 查找父节点数据
export const findParent = id => {
  // 读取父节点缓存数据
  let parentList = window.localStorage.getItem('parentList')
  if (!parentList) {
    return
  }
  var pid = findParentId(id, JSON.parse(parentList))
  // 读取缓存数据
  let data = window.localStorage.getItem('menuData')
  if (!data) {
    return
  }
  // 取出点击标签的父级名称
  var result = JSON.parse(data).find(function (v) {
    return v.id == pid
  })
  return result.name
}

// 初始化父节点数据
export const initParentList = vm => {
  // 读取缓存数据
  let data = window.localStorage.getItem('menuData')
  if (!data) {
    return
  }
  let menuData = JSON.parse(data)
  let parentList = {}
  // 缓存数据 pid列表
  window.localStorage.setItem(
    'parentList',
    JSON.stringify(getParentList(parentList, menuData))
  )
}

// 递归父节点
const getParentList = (list, data) => {
  data.forEach(g => {
    if (g.parent_id != undefined && g.parent_id != 0) {
      let pid = g.parent_id
      let id = g.id
      list[id] = pid
    }
    if (g.children && g.children.length > 0) getParentList(list, g.children)
  })
  return list
}

// 动态渲染菜单
export const initRouter = vm => {
  const constRoutes = []
  const globalMenuRoutes = []
  const globalMenuData = [
    {
      path: '',
      name: 'globalMenuRoutes',
      redirect: '/home',
      component: 'Main',
      meta: { hideInMenu: true },
      children: []
    }
  ]
  const otherRoutes = []

  // 404路由需要和动态路由一起加载
  const otherRouter = [
    {
      path: '/*',
      name: 'error-404',
      meta: {
        title: '404-页面不存在'
      },
      component: 'error-page/404'
    }
  ]

  // 判断用户是否登录
  let userInfo = Cookies.get('token')
  if (!userInfo) {
    return false
    // 登录
  } else {
    if (!vm.$store.state.app.added) {
      // vm.$store.commit(
      //   'updateGlobalState',
      //   window.localStorage.getItem('updateGlobalState') != 'false'
      // )
      // vm.$store.commit(
      //   'setCurrentCommunity',
      //   window.localStorage.getItem('community')
      //     ? JSON.parse(window.localStorage.getItem('community'))
      //     : ''
      // )
      if (localStorage.getItem('community')) {
        vm.$store.dispatch(
          'handleCurrentCommunity',
          JSON.parse(window.localStorage.getItem('community'))
        )
      }
      axios
        .get(base + '/base/admin/user-menu', {
          headers: { Authorization: Cookies.get('token') },
          params: { is_overall: 1 }
        })
        .then(res => {
          if (res) {
            globalMenuData[0].children = res
            initRouterNode(globalMenuRoutes, globalMenuData, 1)
            // console.log(globalMenuRoutes)
            // 添加所有主界面路由
            vm.$store.commit('updateAppRouter', globalMenuRoutes)
            // 添加全局菜单路由
            initGlobalMenuData(vm, globalMenuData)
            window.localStorage.setItem(
              'globalMenuData',
              JSON.stringify(globalMenuRoutes)
            )
            // axios
            //   .get(base + '/base/user-menu', {
            //     headers: { Authorization: Cookies.get('token') }
            //   })
            //   .then(res => {
            //     // userMenu().then(res => {
            //     if (res) {
            //       let menuData = res
            //       initRouterNode(constRoutes, menuData)
            //       initRouterNode(otherRoutes, otherRouter)
            //       // 添加所有主界面路由
            //       vm.$store.commit(
            //         'updateAppRouter',
            //         constRoutes.filter(item => item.children.length > 0)
            //       )
            //       // 添加全局路由
            //       vm.$store.commit('updateDefaultRouter', otherRoutes)
            //       // 添加菜单路由
            //       initMenuData(vm, menuData)
            //       // 缓存数据 修改加载标识
            //       window.localStorage.setItem(
            //         'menuData',
            //         JSON.stringify(menuData)
            //       )
            //       vm.$store.commit('setAdded', true)
            //       // 调用dispatch 同步一下应用菜单
            //       vm.$store.getters.community.id &&
            //         vm.$store.dispatch('handleCommunityApply')
            //     }
            //   })
          }
        })
    } else {
      // 读取缓存数据
      let data = window.localStorage.getItem('menuData')
      if (!data) {
        vm.$store.commit('setAdded', false)
        return
      }
      let menuData = JSON.parse(data)
      // 添加菜单路由
      initMenuData(vm, menuData)
    }
  }
}

// 添加所有顶部导航栏下的菜单路由
// 如果1级菜单和2、3级菜单拆开使用的话需要处理
const initAllMenuData = (constRoutes, data) => {
  let allMenuData = []
  data.forEach(e => {
    if (e.type === -1) {
      e.children.forEach(item => {
        allMenuData.push(item)
      })
    }
  })
  initRouterNode(constRoutes, allMenuData)
}

// 生成全局菜单格式数据
const initGlobalMenuData = (vm, data) => {
  const globalMenuRoutes = []
  let globalMenuData = data[0].children
  // 顶部菜单
  /* 需要顶部菜单的话需要
  let navList = []
  globalMenuData.forEach(e => {
    let nav = {
      name: e.name,
      title: e.title,
      icon: e.icon
    }
    navList.push(nav)
  })
  if (navList.length < 1) return false
  vm.$store.commit('setNavList', navList)
  let currNav = window.localStorage.getItem('currNav')
  if (currNav) {
    // 读取缓存title
    for (var item of navList) {
      if (item.name === currNav) {
        vm.$store.commit('setCurrNavTitle', item.title)
        break
      }
    }
  } */
  // else {
  //   // 默认第一个菜单
  //   currNav = navList[0].name
  //   vm.$store.commit('setCurrNavTitle', navList[0].title)
  // }
  /* 需要顶部菜单的话需要
  vm.$store.commit('setCurrNav', currNav)
  // 谁是当前菜单渲染谁的子菜单
  for (var item2 of globalMenuData) {
    if (item2.name === currNav) {
      // 过滤
      globalMenuData = item2.children
      break
    }
  } */
  initRouterNode(globalMenuRoutes, globalMenuData)

  // 刷新全局界面菜单
  vm.$store.commit('updateGlobalMenulist', globalMenuRoutes)
}

// 生成菜单格式数据
const initMenuData = (vm, data) => {
  const menuRoutes = []
  let menuData = data
  initRouterNode(menuRoutes, menuData)

  // 刷新界面菜单
  vm.$store.commit(
    'updateMenulist',
    menuRoutes.filter(item => item.children.length > 0)
  )
  vm.$store.commit(
    'updateMenulistBackups',
    menuRoutes.filter(item => item.children.length > 0)
  )
}

// 生成路由节点
// const initGlobalRouterNode = (routers, data) => {
//   console.log(routers)
//   return false
//   for (var item of data) {
//     let menu = Object.assign({}, item)
//     menu.component = lazyLoading(menu.component)
//     if (item.children && item.children.length > 0) {
//       menu.children = []
//       initGlobalRouterNode(menu.children, item.children)
//     }

//     let meta = {}
//     // 给页面添加权限、标题、第三方网页链接
//     meta.permTypes = menu.permTypes ? menu.permTypes : null
//     meta.title = menu.title ? menu.title : null
//     meta.url = menu.url ? menu.url : null
//     meta.id = menu.id ? menu.id : null
//     meta.menu = menu.menu ? menu.menu : true
//     // meta.notCache = menu.notCache ? menu.notCache : true // 设为true后页面不会缓存,关闭所有页面标签，刷新网页才会生效
//     menu.meta = meta
//     routers.children.push(menu)
//   }
// }

// 生成路由节点
const initRouterNode = (routers, data, globalMenu = 0) => {
  for (var item of data) {
    let menu = Object.assign({}, item)
    menu.component = lazyLoading(menu.component)
    if (item.children && item.children.length > 0) {
      menu.children = []
      initRouterNode(menu.children, item.children, globalMenu)
    }

    let meta = {}
    // 给页面添加权限、标题、第三方网页链接
    meta.permTypes = menu.permTypes ? menu.permTypes : null
    meta.title = menu.title ? menu.title : null
    meta.url = menu.url ? menu.url : null
    meta.id = menu.id ? menu.id : null
    meta.community = !globalMenu
    // meta.menu = true
    // meta.menu = menu.menu ? menu.menu : !globalMenu // 暂时没有隐藏的需求
    // meta.notCache = menu.notCache ? menu.notCache : true // 设为true后页面不会缓存,关闭所有页面标签，刷新网页才会生效
    menu.meta = meta
    routers.push(menu)
  }
}

/**
 * @param {Array} routeMetched 当前路由metched
 * @returns {Array}
 */
export const getBreadCrumbList = (route, homeRoute) => {
  let homeItem = {
    ...homeRoute,
    icon: (homeRoute.meta && homeRoute.meta.icon) || ''
  }
  let routeMetched = route.matched
  if (routeMetched.some(item => item.name === homeRoute.name)) return [homeItem]
  let res = routeMetched
    .filter(item => {
      return item.meta === undefined || !item.meta.hide
    })
    .map(item => {
      let meta = { ...item.meta }
      if (meta.title && typeof meta.title === 'function') {
        meta.title = meta.title(route)
      }
      let obj = {
        icon: (item.meta && item.meta.icon) || '',
        name: item.name,
        meta: meta
      }
      return obj
    })
  res = res.filter(item => {
    return !item.meta.hideInMenu
  })
  // 判断当前是否在社区，如果在社区要把第一个首页替换成社区首页
  if (route.meta && route.meta.community && route.name != 'community-home') {
    let one = {
      path: '/community-home',
      to: '/community-home',
      title: '社区工作台',
      name: 'community-home',
      meta: { title: '社区工作台', community: true }
    }
    return [one, ...res]
  } else {
    return [{ ...homeItem, to: homeRoute.path }, ...res]
  }
}

export const getRouteTitleHandled = route => {
  let router = { ...route }
  let meta = { ...route.meta }
  let title = ''
  if (meta.title) {
    if (typeof meta.title === 'function') title = meta.title(router)
    else title = meta.title
  }
  meta.title = title
  router.meta = meta
  return router
}

export const showTitle = (item, vm) => {
  let title = item.meta.title
  if (vm.$config.useI18n) {
    if (title.includes('{{') && title.includes('}}') && vm.$config.useI18n) {
      title = title.replace(/({{[\s\S]+?}})/, (m, str) =>
        str.replace(/{{([\s\S]*)}}/, (m, _) => vm.$t(_.trim()))
      )
    } else title = vm.$t(item.name)
  } else title = (item.meta && item.meta.title) || item.name
  return title
}

/**
 * @description 本地存储和获取标签导航列表
 */
export const setTagNavListInLocalstorage = list => {
  localStorage.tagNaveList = JSON.stringify(list)
}
/**
 * @returns {Array} 其中的每个元素只包含路由原信息中的name, path, meta三项
 */
export const getTagNavListFromLocalstorage = () => {
  const list = localStorage.tagNaveList
  return list ? JSON.parse(list) : []
}

/**
 * @param {Array} routers 路由列表数组
 * @description 用于找到路由列表中name为home的对象
 */
export const getHomeRoute = (routers, homeName = 'home') => {
  let i = -1
  let len = routers.length
  let homeRoute = {}
  while (++i < len) {
    let item = routers[i]
    if (item.children && item.children.length) {
      let res = getHomeRoute(item.children, homeName)
      if (res.name) return res
    } else {
      if (item.name === homeName) homeRoute = item
    }
  }
  return homeRoute
}

/**
 * @param {*} list 现有标签导航列表
 * @param {*} newRoute 新添加的路由原信息对象
 * @description 如果该newRoute已经存在则不再添加
 */
export const getNewTagList = (list, newRoute) => {
  const { name, path, meta } = newRoute
  let newList = [...list]
  if (newList.findIndex(item => item.name === name) >= 0) return newList
  else newList.push({ name, path, meta })
  return newList
}

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
  if (route.meta && route.meta.access) {
    return hasOneOf(access, route.meta.access)
  } else return true
}

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
  const routePermissionJudge = list => {
    return list.some(item => {
      if (item.children && item.children.length) {
        return routePermissionJudge(item.children)
      } else if (item.name === name) {
        return hasAccess(access, item)
      }
    })
  }

  return routePermissionJudge(routes)
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
  const keyValueArr = url.split('?')[1].split('&')
  let paramObj = {}
  keyValueArr.forEach(item => {
    const keyValue = item.split('=')
    paramObj[keyValue[0]] = keyValue[1]
  })
  return paramObj
}

/**
 * @param {Array} list 标签列表
 * @param {String} name 当前关闭的标签的name
 */
export const getNextRoute = (list, route) => {
  let res = {}
  if (list.length === 2) {
    res = getHomeRoute(list)
  } else {
    const index = list.findIndex(item => routeEqual(item, route))
    if (index === list.length - 1) res = list[list.length - 2]
    else res = list[index + 1]
  }
  return res
}

/**
 * @param {Number} times 回调函数需要执行的次数
 * @param {Function} callback 回调函数
 */
export const doCustomTimes = (times, callback) => {
  let i = -1
  while (++i < times) {
    callback(i)
  }
}

/**
 * @param {Object} file 从上传组件得到的文件对象
 * @returns {Promise} resolve参数是解析后的二维数组
 * @description 从Csv文件中解析出表格，解析成二维数组
 */
export const getArrayFromFile = file => {
  let nameSplit = file.name.split('.')
  let format = nameSplit[nameSplit.length - 1]
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsText(file) // 以文本格式读取
    let arr = []
    reader.onload = function (evt) {
      let data = evt.target.result // 读到的数据
      let pasteData = data.trim()
      arr = pasteData
        .split(/[\n\u0085\u2028\u2029]|\r\n?/g)
        .map(row => {
          return row.split('\t')
        })
        .map(item => {
          return item[0].split(',')
        })
      if (format === 'csv') resolve(arr)
      else reject(new Error('[Format Error]:你上传的不是Csv文件'))
    }
  })
}

/**
 * @param {Array} array 表格数据二维数组
 * @returns {Object} { columns, tableData }
 * @description 从二维数组中获取表头和表格数据，将第一行作为表头，用于在iView的表格中展示数据
 */
export const getTableDataFromArray = array => {
  let columns = []
  let tableData = []
  if (array.length > 1) {
    let titles = array.shift()
    columns = titles.map(item => {
      return {
        title: item,
        key: item
      }
    })
    tableData = array.map(item => {
      let res = {}
      item.forEach((col, i) => {
        res[titles[i]] = col
      })
      return res
    })
  }
  return {
    columns,
    tableData
  }
}

export const findNodeUpper = (ele, tag) => {
  if (ele.parentNode) {
    if (ele.parentNode.tagName === tag.toUpperCase()) {
      return ele.parentNode
    } else {
      return findNodeUpper(ele.parentNode, tag)
    }
  }
}

export const findNodeUpperByClasses = (ele, classes) => {
  let parentNode = ele.parentNode
  if (parentNode) {
    let classList = parentNode.classList
    if (
      classList &&
      classes.every(className => classList.contains(className))
    ) {
      return parentNode
    } else {
      return findNodeUpperByClasses(parentNode, classes)
    }
  }
}

export const findNodeDownward = (ele, tag) => {
  const tagName = tag.toUpperCase()
  if (ele.childNodes.length) {
    let i = -1
    let len = ele.childNodes.length
    while (++i < len) {
      let child = ele.childNodes[i]
      if (child.tagName === tagName) return child
      else return findNodeDownward(child, tag)
    }
  }
}

export const showByAccess = (access, canViewAccess) => {
  return hasOneOf(canViewAccess, access)
}

/**
 * @description 根据name/params/query判断两个路由对象是否相等
 * @param {*} route1 路由对象
 * @param {*} route2 路由对象
 */
export const routeEqual = (route1, route2) => {
  const params1 = route1.params || {}
  const params2 = route2.params || {}
  const query1 = route1.query || {}
  const query2 = route2.query || {}
  return (
    route1.name === route2.name &&
    objEqual(params1, params2) &&
    objEqual(query1, query2)
  )
}

/**
 * 判断打开的标签列表里是否已存在这个新添加的路由对象
 */
export const routeHasExist = (tagNavList, routeItem) => {
  let len = tagNavList.length
  let res = false
  doCustomTimes(len, index => {
    if (routeEqual(tagNavList[index], routeItem)) res = true
  })
  return res
}

export const localSave = (key, value) => {
  localStorage.setItem(key, value)
}

export const localRead = key => {
  return localStorage.getItem(key) || ''
}
