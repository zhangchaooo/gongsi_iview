<style lang="less">
@import "./login.less";
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Header />
      <!-- <Card icon="log-in"
            title="欢迎登录"
            :bordered="false"> -->
      <div class="form-con">
        <login-form @on-success-valid="handleSubmit"></login-form>
        <!-- <p class="login-tip">输入任意用户名和密码即可</p> -->
      </div>
      <!-- </Card> -->
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import Header from '_c/login-form/header'
import { mapActions } from 'vuex'
import { initRouter } from '@/libs/util'
export default {
  components: {
    LoginForm,
    Header
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ username, password }) {
      this.handleLogin({ username, password }).then(res => {
        this.getUserInfo().then(res => {
          initRouter(this)
          // this.getMenuList().then(res => {})
          // 初始化菜单
          // util.initRouter(this)
          this.$router.push({
            name: this.$config.homeName
          })
        })
      })
    }
  }
}
</script>

<style>
</style>
