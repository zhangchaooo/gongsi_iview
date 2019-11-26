<template>
  <div>
    <Row>
      <Card>
        <div slot="title">
          <a @click="close"
             class="back-title">
            <Icon type="ios-arrow-back"
                  style="margin: 0 0 2px 0" />返回
          </a>
        </div>
        <Form ref="form"
              :model="form"
              :label-width="90"
              :rules="formValidate">
          <FormItem label="角色标识"
                    prop="name">
            <Input v-model="form.name"
                   style="width:100%" />
          </FormItem>
          <FormItem label="角色名称"
                    prop="title">
            <Input v-model="form.title"
                   style="width:100%" />
          </FormItem>
          <Form-item>
            <Button @click="handleSubmit"
                    :loading="submitLoading"
                    type="primary"
                    style="margin-right:5px">提交并保存</Button>
            <Button @click="handleReset">重置</Button>
          </Form-item>
        </Form>
      </Card>
    </Row>
  </div>
</template>
<script>
import {
  rolesCreate,
  rolesEdit
} from '@/api/roles'
export default {
  name: 'add',
  data () {
    return {
      loading: true, // 表单加载状态
      submitLoading: false, // 表单提交状态
      form: { // 添加或编辑表单对象初始化数据
        name: '',
        title: ''
      },
      // 表单验证规则
      formValidate: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        title: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init () { },
    handleReset () {
      this.$refs.form.resetFields()
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          rolesCreate(this.form).then(res => {
            this.$Message.success('操作成功')
            this.submited()
          })
        }
      })
    },
    close () {
      this.$emit('close', true)
    },
    submited () {
      this.$emit('submited', true)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
