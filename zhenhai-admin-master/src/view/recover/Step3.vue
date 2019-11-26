<template>
  <Form ref="loginForm"
        :model="form"
        @keydown.enter.native="handleSubmit">
    <FormItem>
      <Alert type="success"
             show-icon>
        新密码设置成功
        <span slot="desc">请牢记您新设置的密码</span>
      </Alert>
    </FormItem>
    <FormItem style="margin-bottom:15px;">
      <Button @click="handleSubmit"
              type="primary"
              long>前往登录</Button>
    </FormItem>

  </Form>
</template>

<script>

export default {
  name: 'Step3',
  data () {
    return {
      description: '将一个冗长或用户不熟悉的表单任务分成多个步骤，指导用户完成。',
      currentTab: 0,

      // form
      form: null
    }
  },
  methods: {
    handleSubmit () {
      this.$router.push({
        name: 'login'
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
