<template>

  <Form ref="loginForm"
        :model="form"
        :rules="rules"
        @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input size="large"
             type="text"
             autocomplete="off"
             v-model="form.userName"
             prefix="ios-call-outline"
             placeholder="请输入手机号">

      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input size="large"
             type="password"
             autocomplete="off"
             v-model="form.password"
             prefix="ios-unlock-outline"
             placeholder="请输入密码">

      </Input>
    </FormItem>
    <!-- <FormItem prop="captcha">
      <Row type="flex"
           justify="space-between"
           style="align-items: center;overflow: hidden;">
        <Col span="18"><Input v-model="form.captcha"
               size="large"
               clearable
               placeholder="请输入图片验证码"
               :maxlength="10"
               class="input-verify" /></Col>
        <Col span="6">
        <div style="position:relative">
          <Spin v-if="loadingCaptcha"
                fix></Spin>
          <img :src="captchaImg"
               @click="getCaptchaImg"
               alt="加载失败"
               style="width:100px;cursor:pointer;display:block">
        </div>
        </Col>

      </Row>
    </FormItem> -->

    <FormItem style="margin-bottom:15px;">
      <Button @click="handleSubmit"
              type="primary"
              long>登录</Button>
    </FormItem>
    <FormItem>
      <router-link :to="{ name: 'recover' }"
                   class="forge-password"
                   style="float: right;">忘记密码</router-link>
    </FormItem>
  </Form>
</template>
<script>
// import {
//   loginCode
// } from '@/api/user'
export default {
  name: 'LoginForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ]
      }
    },
    codeRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  data () {
    return {
      loadingCaptcha: true,
      captchaImg: null,
      form: {
        userName: '',
        password: '',
        captcha: '2222',
        ckey: ''

      }
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        captcha: this.codeRules,
        password: this.passwordRules
      }
    }
  },
  mounted () {
    // this.getCaptchaImg()
  },
  methods: {
    getCaptchaImg () {
      this.loadingCaptcha = true
      loginCode().then(res => {
        this.captchaImg = res.img
        this.form.ckey = res.key
        // console.log(res)
        // if (res.success) {
        //   this.captchaId = res.result
        //   this.captchaImg = drawCodeImage + this.captchaId
        this.loadingCaptcha = false
        // }
      })
    },
    handleSubmit () {
      // console.log(this.form)
      // return false
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', {
            username: this.form.userName,
            password: this.form.password,
            ckey: this.form.ckey,
            captcha: this.form.captcha
          })
        }
      })
    }
  }
}
</script>
