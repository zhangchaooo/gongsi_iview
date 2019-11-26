import Main from '@/components/main'
import parentView from '@/components/parent-view'
export default [
  {
    path: '',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    meta: { hideInMenu: true }, // 隐藏不进面包屑
    // 非动态路由（非菜单使用路由）统一放到otherRouter,菜单路由统一使用页面生成和后端配合权限
    // 动态加载组件会自动把title放到meta里，暂时先写2遍
    children: [
      {
        path: '/home',
        title: '首页',
        name: 'home',
        meta: { title: '首页', community: false },
        component: () => import('@/view/single-page/home')
      },
      // {
      //   path: '/community-home',
      //   title: '社区工作台',
      //   name: 'community-home',
      //   meta: { title: '社区工作台', community: true },
      //   component: () => import('@/view/single-page/home/communityHome')
      // },
      // {
      //   path: '/own-space',
      //   title: '个人中心',
      //   name: 'ownspace_index',
      //   meta: { title: '个人中心', community: false },
      //   component: () => import('@/view/sys/own-space')
      // },
      // {
      //   path: '/house',
      //   title: 'house',
      //   name: 'house',
      //   meta: { title: 'house', community: false },
      //   component: () => import('@/view/tj/houseFramework/index')
      // },
      // {
      //   path: '/single',
      //   title: 'single',
      //   name: 'single',
      //   meta: { title: 'single', menu: true },
      //   component: () => import('@/view/tj/single-window/index')
      // },
      // {
      //   path: '/tjsingle',
      //   title: 'tjsingle',
      //   name: 'tjsingle',
      //   meta: { title: 'tjsingle', menu: true },
      //   component: () => import('@/view/tj/singleTable/index')
      // },
      {
        path: '/change-pass',
        title: '修改密码',
        name: 'change_pass',
        meta: { title: '修改密码' },
        component: () => import('@/view/sys/change-pass')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login')
  },
  {
    path: '/recover',
    name: 'recover',
    meta: {
      title: '忘记密码',
      hideInMenu: true
    },
    component: () => import('@/view/recover/index')
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500')
  }
]
