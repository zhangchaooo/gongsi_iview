<template>
  <div class="header-bar">
    <div class="logo-con">
      <img v-show="!collapsed"
           :src="maxLogo"
           key="max-logo" />
      <img v-show="collapsed"
           :src="minLogo"
           key="min-logo" />
    </div>
    <!-- 顶部菜单 -->
    <div class="header-middle-con"
         v-if="menuShow=='none'">
      <!-- <Menu mode="horizontal"
            :active-name="currNav"
            @on-select="selectNav">
        <Menu-Item v-for="(item, i) in navList.slice(0, 5)"
                   :key="i"
                   :name="item.name">
          <Icon :type="item.icon"
                style="margin-bottom:3px" />
          {{item.title}}
        </Menu-Item>
        <Submenu name="sub"
                 v-if="navList.length>5">
          <template slot="title">更多</template>
          <Menu-Item v-for="(item, i) in navList.slice(5, navList.length)"
                     :key="i"
                     :name="item.name">
            <Icon :type="item.icon"
                  style="margin-bottom:3px" />
            {{item.title}}
          </Menu-Item>
        </Submenu>
      </Menu> -->
    </div>
    <!-- <a href="javascript:void(0)"
       @click="inCommunity">进入社区</a>
    <a href="javascript:void(0)"
       @click="backCommunity">返回</a> -->
    <!-- <sider-trigger :collapsed="collapsed"
                   icon="md-menu"
                   @on-change="handleCollpasedChange"></sider-trigger> -->

    <div class="custom-content-con">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import {
  localSave, initRouter
} from '@/libs/util'
import siderTrigger from './sider-trigger'
import minLogo from '@/assets/images/logo-min.jpg'
import maxLogo from '@/assets/images/logo.jpg'
import './header-bar.less'
export default {
  name: 'HeaderBar',
  components: {
    siderTrigger
  },
  props: {
    collapsed: Boolean
  },
  data () {
    return {
      minLogo,
      maxLogo
    }
  },
  computed: {
    menuShow () {
      return this.$store.state.app.menuShow
    },
    currNav () {
      return this.$store.state.app.currNav
    },
    navList () {
      return this.$store.state.app.navList
    }
  },
  methods: {
    // 选择菜单后 初始化新的子菜单
    selectNav (name) {
      this.$store.commit('setCurrNav', name)
      localSave('currNav', name)
      // 清空所有已打开标签
      // this.$store.commit("clearAllTags");
      this.$router.push({
        name
      })
      // 点击的时候先默认展开
      // this.$store.commit('updatemenuShow', 'block')
      initRouter(this)
    },
    handleCollpasedChange (state) {
      this.$emit('on-coll-change', state)
    }
  }
}
</script>
