<template>
  <div class="login">
    <h1>密码找回</h1>
    <Card class="forgat"
          :bordered="false">
      <Steps class="steps"
             :current="currentTab">
        <Step title="身份验证" />
        <Step title="重置密码" />
        <Step title="完成" />
      </Steps>
      <div class="content">
        <step1 v-if="currentTab === 0"
               @nextStep="changeStep" />
        <step2 v-if="currentTab === 1"
               :mobile="form.mobile"
               :code="form.code"
               @nextStep="nextStep"
               @prevStep="prevStep" />
        <step3 v-if="currentTab === 2"
               @prevStep="prevStep"
               @finish="finish" />
      </div>
    </Card>
  </div>
</template>

<script>
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

export default {
  name: 'StepForm',
  components: {
    Step1,
    Step2,
    Step3
  },
  data () {
    return {
      description: '将一个冗长或用户不熟悉的表单任务分成多个步骤，指导用户完成。',
      currentTab: 0,

      // form
      form: {}
    }
  },
  methods: {
    changeStep (v) {
      if (event) {
        this.form = v
        this.nextStep()
      }
    },
    // handler
    nextStep () {
      if (this.currentTab < 2) {
        this.currentTab += 1
      }
    },
    prevStep () {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
    },
    finish () {
      this.currentTab = 0
    }
  }
}
</script>

<style lang="less">
@import "../login/login.less";

.forgat {
  width: 55%;
  height: 30%;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  margin: auto;
}
.steps {
  margin: 30px 0px 30px 14%;
}
.login .ivu-steps .ivu-steps-title {
  line-height: 26px;
}
</style>
