<template>
  <Layout style="height: 100%"
          class="main">
    <Sider hide-trigger
           collapsible
           :width="265"
           :collapsed-width="64"
           v-model="collapsed"
           class="left-sider"
           style="overflow: hidden"
           :style="{display: menuShow}">
      <!--  社区菜单不是手风琴，只能展开一个 -->
      <!-- MenuGroup效果不好，目前先把社区菜单全部展开base -->
      <side-menu :accordion="accordion"
                 ref="sideMenu"
                 :active-name="$route.name"
                 :collapsed="collapsed"
                 @on-select="turnToPage"
                 :menu-list="menuList">

      </side-menu>
    </Sider>
    <Layout>
      <Header class="header-con">
        <header-bar :collapsed="collapsed"
                    ref="headerBar"
                    @on-coll-change="handleCollapsedChange">

          <user :user-avatar="userAvatar"
                :user-name="userName" />
          <language v-if="$config.useI18n"
                    @on-lang-change="setLocal"
                    style="margin-right: 10px;"
                    :lang="local" />
          <error-store v-if="$config.plugin['error-store'] && $config.plugin['error-store'].showInHeader"
                       :has-read="hasReadErrorPage"
                       :count="errorCount"></error-store>
          <!-- <fullscreen v-model="isFullscreen"
                      style="margin-right: 10px;" /> -->
        </header-bar>
      </Header>

      <Content class="main-content-con">
        <Layout class="main-layout-con">
          <!-- <div class="tag-nav-wrapper">
            <tags-nav :value="$route"
                      @input="handleClick"
                      :list="tagNavList"
                      @on-close="handleCloseTag" />
          </div> -->
          <!-- <page-view></page-view> -->
          <Content class="content-wrapper">
            <!-- <keep-alive :include="cacheList"> -->
            <router-view />
            <!-- </keep-alive> -->
          </Content>
        </Layout>
      </Content>
    </Layout>
  </Layout>
</template>
<script>

// import pageView from '@/components/layouts/pageView'
import SideMenu from './components/side-menu'
import HeaderBar from './components/header-bar'
import TagsNav from './components/tags-nav'
import User from './components/user'
import Language from './components/language'
import ErrorStore from './components/error-store'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { getNewTagList, getNextRoute, routeEqual, findParent, localRead, initRouter } from '@/libs/util'
import minLogo from '@/assets/images/logo-min.jpg'
import maxLogo from '@/assets/images/logo.jpg'
import './main.less'
export default {
  name: 'Main',
  components: {
    SideMenu,
    HeaderBar,
    Language,
    TagsNav,
    ErrorStore,
    User
  },
  data () {
    return {
      collapsed: false,
      minLogo,
      maxLogo,
      isFullscreen: false
    }
  },
  computed: {
    ...mapGetters([
      'errorCount'
    ]),
    menuShow () {
      return this.$store.state.app.menuShow
    },
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    tagRouter () {
      return this.$store.state.app.tagRouter
    },
    userAvatar () {
      return this.$store.state.user.avatarImgPath
    },
    userName () {
      return this.$store.state.user.userName
    },
    cacheList () {
      return this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []
    },
    accordion () {
      // return this.$store.state.app.globalState
      return false
    },
    menuList () {
      return this.$store.state.app.globalMenuList
      // return this.$store.getters.menuList
    },
    local () {
      return this.$store.state.app.local
    },
    hasReadErrorPage () {
      return this.$store.state.app.hasReadErrorPage
    }
    // breadCrumbList () {
    //   return this.$store.state.app.breadCrumbList.length > 1 ? this.$store.state.app.breadCrumbList : []
    // }
  },
  methods: {
    ...mapMutations([
      'setBreadCrumb',
      'setTagNavList',
      'addTag',
      'setLocal'
    ]),
    ...mapActions([
      // 'handleLogin',
      // 'handleCommunityList'
    ]),
    turnToPage (route) {
      let { name, params, query } = {}
      if (typeof route === 'string') name = route
      else {
        name = route.name
        params = route.params
        query = route.query
      }
      if (name.indexOf('isTurnByHref_') > -1) {
        window.open(name.split('_')[1])
        return
      }
      this.$router.push({
        name,
        params,
        query
      })
    },
    handleCollapsedChange (state) {
      this.collapsed = state
    },
    handleCloseTag (res, type, route) {
      if (type === 'all') {
        this.turnToPage(this.$config.homeName)
      } else if (routeEqual(this.$route, route)) {
        if (type !== 'others') {
          const nextRoute = getNextRoute(this.tagNavList, route)
          this.$router.push(nextRoute)
        }
      }
      this.setTagNavList(res)
    },
    handleClick (item) {
      this.turnToPage(item)
    }
  },
  watch: {
    '$route' (newRoute) {
      const { name, query, params, meta } = newRoute
      // this.addTag({
      //   route: { name, query, params, meta },
      //   type: 'push'
      // })
      this.setBreadCrumb(newRoute)
      // this.setTagNavList(getNewTagList(this.tagNavList, newRoute))
      this.$refs.sideMenu.updateOpenName(newRoute.name)
    }
  },
  mounted () {
    /**
     * @description 初始化设置面包屑导航和标签导航
     */
    // this.setTagNavList()
    // this.addTag({
    //   route: this.$store.state.app.homeRoute
    // })

    this.setBreadCrumb(this.$route)
    // 设置初始语言
    this.setLocal(this.$i18n.locale)
    // 如果当前打开页面不在标签栏中，跳到homeName页
    // if (!this.tagNavList.find(item => item.name === this.$route.name)) {
    //   this.$router.push({
    //     name: this.$config.homeName
    //   })
    // }
  }
}
</script>
