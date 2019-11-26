import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'view-design'
import { setToken, getToken, localSave, localRead } from '@/libs/util'
import config from '@/config'
const { homeName } = config

Vue.use(Router)
const router = new Router({
  routes
  // mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'
let flag = false
const turnTo = (to, from, next) => {
  // meta区分全局和社区路由
  // 跳进全局代表跳出社区：清空社区信息
  // 无社区id 拦截 跳入社区菜单

  if (to.meta.community == undefined) {
    next()
  } else if (to.meta.community == false && from.meta.community == true) {
    iView.Modal.confirm({
      title: '确认退出',
      content: '确定要退出社区吗',
      onOk: () => {
        store.commit('setCurrentCommunity', '')
        window.localStorage.setItem('community', '')
        store.commit('updateGlobalState', true)
        window.localStorage.setItem('updateGlobalState', true)
        next()
      }
    })
  } else if (to.meta.community == true && !store.getters.community.id) {
    // iView.Notice.warning({
    //   title: '进入社区姿势错误',
    //   desc: '请从社区管理或者右上角切换社区来进入并管理社区。'
    // })
    next(false)
  } else {
    if (to.name == 'building-list' && to.query.actions == 'edit') {
      iView.LoadingBar.start()
      flag = true
      next()
    } else {
      if (flag) {
        // 如果路由发生变化判断信号
        iView.Modal.confirm({
          title: '确认退出',
          content: '请确认是否编辑完成，未完成退出将影响系统正常使用',
          onOk: () => {
            flag = false
            store.dispatch('deleteCommunityTreeCache').then(() => {
              store.dispatch('getCommunityTree')
            })
            iView.LoadingBar.start()
            next()
          }
        })
      } else {
        iView.LoadingBar.start()
        next()
      }
    }
  }
}

router.beforeEach((to, from, next) => {
  // console.log(to)
  const token = getToken() || null
  // if (to.name === homeName) {
  //   localSave('currNav', '')
  //   store.commit('setCurrNav', '')
  // }
  // console.log(to.meta)
  // 判断下当前路由是否隐藏左侧菜单
  // to.meta.menu
  //   ? store.commit('updatemenuShow', 'block')
  //   : store.commit('updatemenuShow', 'none')
  if (!token && to.name !== LOGIN_PAGE_NAME && to.name !== 'recover') {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if ((!token && to.name === LOGIN_PAGE_NAME) || to.name === 'recover') {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    if (store.state.user.hasGetInfo) {
      // next()
      turnTo(to, from, next)
    } else {
      iView.LoadingBar.start()
      // 刷新重新计算一次pid
      // initParentList()
      // 同步一下当前一级菜单选择状态
      // store.commit('setCurrNav', localRead('currNav'))
      store
        .dispatch('getUserInfo')
        .then(user => {
          next({
            ...to,
            replace: true
          })
        })
        .catch(() => {
          setToken('')
          next({
            name: 'login'
          })
        })
    }
  }
  // 判断to的页面如果去全局1级菜单修改选中
  // const globalCurrNav = store.state.app.navList.filter(v => v.name == to.name)
  // globalCurrNav[0] && store.commit('setCurrNav', globalCurrNav[0].name)
  // globalCurrNav[0] && localSave('currNav', globalCurrNav[0].name)
})

router.afterEach(to => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
