// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import iviewArea from 'iview-area'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import installPlugin from '@/plugin'
import { initRouter, localSave, localRead } from '@/libs/util'
import 'view-design/dist/styles/iview.css'
import './index.less'
import '@/assets/icons/iconfont.css'
import hasPermission from '@/libs/hasPermission'
// 实际打包时应该不引入mock
/* eslint-disable */
// if (process.env.NODE_ENV !== 'production') require('@/mock')
Vue.use(iviewArea)
Vue.use(hasPermission)
Vue.use(ViewUI, {
  i18n: (key, value) => i18n.t(key, value)
})
/**
 * @description 注册admin内置插件
 */
installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
Vue.prototype.setStore = localSave
Vue.prototype.getStore = localRead
/**
 * 注册指令
 */
importDirective(Vue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App),
  data: {
    currentPageName: ''
  },
  mounted () {
    // 初始化菜单
    initRouter(this)
    // 初始化全局数据字典
    // dictUtil.initDictData(this);
    // 动态显示页面名称
    // this.currentPageName = this.$route.name
    // 显示打开的页面的列表
    // this.$store.commit('setOpenedList');
    // this.$store.commit('initCachepage');
  }
})
