<template>
  <div class="global">
    <page-view :avatar="userAvatar"
               bg
               :title="false">
      <div slot="headerContent">
        <div class="title">{{ timeFix }}，{{ UserName }}<span class="welcome-text">，{{ welcome }}</span></div>
        <div clss="info">{{userStaff ? userStaff.position : '超级管理员'}}</div>
      </div>
      <div slot="extra">
        <!-- <Row class="more-info">
          <Col :span="8">
          <head-info title="社区数"
                     content="56"
                     :center="false"
                     :bordered="false" />
          </Col>
          <Col :span="8">
          <head-info title="待办项"
                     content="8/24"
                     :center="false"
                     :bordered="false" />
          </Col>
          <Col :span="8">
          <head-info title="暂留"
                     content="2,223"
                     :center="false" />
          </Col>
        </Row> -->
      </div>

    </page-view>
    <div>
      <Row :gutter="24">
        <Col :xl="24"
             :lg="24"
             :md="24"
             :sm="24"
             :xs="24">

        </Col>

      </Row>
    </div>
  </div>
</template>

<script>
import pageView from '@/components/layouts/pageView'
import { HeadInfo, ArticleListContent, getValueArray } from '@/components/tools'
import { timeFix, welcome } from '@/libs/util'
export default {
  name: 'home',
  components: {
    pageView,
    HeadInfo,
    ArticleListContent
    // list
  },
  data () {
    return {
      loading: false,
      timeFix: timeFix(),
      welcome: welcome()
    }
  },
  computed: {
    userAvatar () {
      return this.$store.state.user.avatarImgPath
    },
    UserName () {
      return this.$store.state.user.userName
    },
    userStaff () {
      return this.$store.state.user.staff
    }
    // userCommunity () {
    //   return this.$store.state.user.userCommunity
    // }
    // userStaff () {
    //   return this.$store.state.user.staff
    // }
  },
  methods: {
    inCommunity (data) {
      this.$store.commit('updateGlobalState', false)
      window.localStorage.setItem('updateGlobalState', false)
      this.$store.dispatch('handleCurrentCommunity', data)
      this.$router.push('/community-home')
    }
  },
  mounted () {
    // console.log(this.$store.getters.communityEnableList)
    // this.data = this.communityList
  }
}
</script>

<style>
.count-style {
  font-size: 50px;
}
.info {
  font-size: 14px;
}
.more-info {
  margin-top: 10px;
}
</style>
