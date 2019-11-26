<template>
  <div class="change-pass mobile-pass">
    <Form ref="editPasswordForm"
          :model="editPasswordForm"
          :rules="passwordValidate"
          @keydown.enter.native="handleSubmit">
      <FormItem prop="newPass">
        <Poptip trigger="focus"
                placement="right"
                width="250">
          <Input type="password"
                 size="large"
                 v-model="editPasswordForm.newPass"
                 @on-change="strengthChange"
                 prefix="ios-unlock-outline"
                 placeholder="请输入新密码，长度为6-20个字符"></Input>
          <div :class="tipStyle"
               slot="content">
            <span class="words">强度 : {{strength}}</span>
            <Slider v-model="strengthValue"
                    disabled
                    :step="33"
                    style="width:95%"></Slider>
            请至少输入 6 个字符。请不要使<br>用容易被猜到的密码。
          </div>
        </Poptip>
      </FormItem>
      <FormItem prop="rePass">
        <Input type="password"
               size="large"
               prefix="ios-unlock-outline"
               v-model="editPasswordForm.rePass"
               placeholder="请再次输入新密码"></Input>
      </FormItem>

      <FormItem style="margin-bottom:15px;">
        <Button @click="handleSubmit"
                type="primary"
                long>完成</Button>
      </FormItem>

    </Form>
  </div>
</template>

<script>
import {
  resetPassword
} from '@/api/user'
export default {
  name: 'Step1',
  props: ['mobile', 'code'],
  data () {
    const valideRePassword = (rule, value, callback) => {
      if (value !== this.editPasswordForm.newPass) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      savePassLoading: false,
      tipStyle: 'password-tip-none',
      strength: '无',
      strengthValue: 0,
      editPasswordForm: {
        oldPass: '',
        newPass: '',
        rePass: ''
      },
      passwordValidate: {
        newPass: [{
          required: true,
          message: '请输入新密码',
          trigger: 'blur'
        },
        {
          min: 6,
          message: '请至少输入6个字符',
          trigger: 'blur'
        },
        {
          max: 32,
          message: '最多输入32个字符',
          trigger: 'blur'
        }
        ],
        rePass: [{
          required: true,
          message: '请再次输入新密码',
          trigger: 'blur'
        },
        {
          validator: valideRePassword,
          trigger: 'blur'
        }
        ]
      }
    }
  },
  methods: {
    checkStrengthValue (v) {
      // 评级制判断密码强度 最高5
      let grade = 0
      if (/\d/.test(v)) {
        grade++ // 数字
      }
      if (/[a-z]/.test(v)) {
        grade++ // 小写
      }
      if (/[A-Z]/.test(v)) {
        grade++ // 大写
      }
      if (/\W/.test(v)) {
        grade++ // 特殊字符
      }
      if (v.length >= 10) {
        grade++
      }
      return grade
    },
    strengthChange () {
      if (!this.editPasswordForm.newPass) {
        this.tipStyle = 'password-tip-none'
        this.strength = '无'
        this.strengthValue = 0
        return
      }
      let grade = this.checkStrengthValue(this.editPasswordForm.newPass)
      if (grade <= 1) {
        this.tipStyle = 'password-tip-weak'
        this.strength = '弱'
        this.strengthValue = 33
      } else if (grade >= 2 && grade <= 4) {
        this.tipStyle = 'password-tip-middle'
        this.strength = '中'
        this.strengthValue = 66
      } else {
        this.tipStyle = 'password-tip-strong'
        this.strength = '强'
        this.strengthValue = 100
      }
    },
    sendCode () {
    },
    handleSubmit () {
      let params = {
        password: this.editPasswordForm.newPass,
        password_confirmation: this.editPasswordForm.rePass,
        mobile: this.mobile,
        code: this.code
      }
      this.$refs['editPasswordForm'].validate(valid => {
        if (valid) {
          resetPassword(params).then(res => {
            this.$emit('nextStep')
          })
        }
      })
    }
  }
}
</script>

<style lang="less">
@import "../sys/change-pass.less";
.mobile-pass {
  .ivu-input-wrapper-large .ivu-input-prefix i {
    line-height: 40px;
  }
  .ivu-input-large {
    height: 40px;
    // padding: 8px 7px;
  }
  .ivu-btn {
    height: 40px;
  }
}
</style>
