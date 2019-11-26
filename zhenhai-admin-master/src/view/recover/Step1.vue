<template>
  <Form ref="loginForm"
        :model="form"
        @keydown.enter.native="handleSubmit">
    <FormItem prop="mobile">
      <Input size="large"
             type="text"
             v-model="form.mobile"
             prefix="ios-call-outline"
             placeholder="请输入手机号">

      </Input>
      <a class="code"
         :style="{color: isOvertime ? '#ddd' : '#ffab0a'}"
         @click="sendCode">{{word}}
      </a>
    </FormItem>
    <FormItem prop="code">
      <Input size="large"
             type="text"
             v-model="form.code"
             prefix="ios-unlock-outline"
             placeholder="请输入验证码">

      </Input>
    </FormItem>

    <FormItem style="margin-bottom:15px;">
      <Button @click="handleSubmit"
              type="primary"
              long>下一步</Button>
    </FormItem>

  </Form>
</template>

<script>
import {
  passwordRetrieveCode,
  verifyPasswordCode
} from '@/api/user'
export default {
  name: 'Step1',
  data () {
    return {
      currentTab: 0,
      word: '发送验证码',
      isOvertime: false,
      // form
      form: {}
    }
  },
  methods: {
    sendCode () {
      if (!this.form.mobile) {
        this.$Message.warning('请输入手机号')
      } else {
        if (!this.isOvertime) {
          passwordRetrieveCode({ mobile: this.form.mobile }).then(res => {
            let that = this
            let time = 60
            var sendTimer = setInterval(function () {
              that.isOvertime = true
              time--
              that.word = '重新发送（' + time + '）'
              if (time < 0) {
                that.isOvertime = false
                clearInterval(sendTimer)
                that.word = '获取验证码'
              }
            }, 1000)
          })
        }
        // else {
        //   this.$Message.warning('请等待倒计时结束再次获取')
        // }
      }
    },
    handleSubmit () {
      if (!this.form.mobile && !this.form.code) {
        this.$Message.warning('请先进行身份验证')
      } else {
        verifyPasswordCode({ mobile: this.form.mobile, code: this.form.code }).then(res => {
          this.$emit('nextStep', this.form)
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
