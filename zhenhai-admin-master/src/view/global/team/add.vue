<template>
  <div class="component">
    <Card style="overflow: auto;"
          class="mb-24"
          :style="{height:height + 'px'}">
      <div slot="title"
           class="c_title">新增员工
      </div>
      <Button slot="extra"
              @click="close">
        返回
      </Button>
      <Row :gutter="48">
        <Col :md="16"
             :sm="24">
        <Form ref="form"
              :model="form"
              :label-width="90"
              :rules="formValidate">
          <FormItem label="姓名"
                    prop="name">
            <Input v-model="form.name"
                   style="width:100%"
                   placeholder="请输入姓名" />
          </FormItem>
          <FormItem label="性别"
                    prop="sex">
            <RadioGroup v-model="form.sex">
              <Radio label="1">男</Radio>
              <Radio label="2">女</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="工号"
                    prop="job_number">
            <Input v-model="form.job_number"
                   style="width:100%"
                   placeholder="请输入工号" />
          </FormItem>
          <FormItem label="手机号"
                    prop="phone_number">
            <Input v-model="form.phone_number"
                   style="width:100%"
                   placeholder="请输入手机号" />
          </FormItem>
          <FormItem label="座机号"
                    prop="landline_number">
            <Input v-model="form.landline_number"
                   style="width:100%"
                   placeholder="请输入座机号" />
          </FormItem>
          <FormItem label="邮箱"
                    prop="email">
            <Input v-model="form.email"
                   style="width:100%"
                   placeholder="请输入邮箱" />
          </FormItem>
          <FormItem label="地址"
                    prop="office_address">
            <Input v-model="form.office_address"
                   style="width:100%"
                   placeholder="请输入地址" />
          </FormItem>
          <FormItem label="职务"
                    prop="position">
            <Input v-model="form.position"
                   style="width:100%"
                   placeholder="请输入职务" />
          </FormItem>
          <FormItem label="部门"
                    required>

            <department-tree-choose-modal multiple
                                          @on-change="handleSelectDepTree"
                                          ref="depTree"></department-tree-choose-modal>
          </FormItem>
          <Form-item>
            <Button @click="handleSubmit"
                    :loading="submitLoading"
                    type="primary"
                    style="margin-right:5px">提交</Button>
            <Button @click="close">返回</Button>
          </Form-item>
        </Form>
        </Col>
        <Col :md="8"
             :sm="24">
        <div style="width:100px;display:block;margin:0px auto;">
          员工照片
          <upload-pic-thumb @on-change="changeAvatar($event)"
                            :multiple="false"
                            :width="150"
                            :height="170"
                            ref="uploadThumb"></upload-pic-thumb>
        </div>
        </Col>

      </Row>
    </Card>
  </div>
</template>
<script>
import {
  staffCreate
} from '@/api/global/staff'
import { validateMobile } from '@/libs/validate'
import uploadPicThumb from '@/components/tj/upload-pic-thumb'
import departmentTreeChooseModal from '@/components/tj/department-tree-choose-modal'
export default {
  name: 'staffAdd',
  components: {
    departmentTreeChooseModal,
    uploadPicThumb
  },
  data () {
    return {
      height: 500,
      editDep: [],
      loading: true, // 表单加载状态
      submitLoading: false, // 表单提交状态
      form: { // 添加或编辑表单对象初始化数据
        name: '',
        sex: '1',
        job_number: '',
        phone_number: '',
        landline_number: '',
        email: '',
        office_address: '',
        position: '',
        image_id: '',
        tissue_id: []
      },
      // 表单验证规则
      formValidate: {
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        sex: [{ required: true, message: '性别不能为空' }],
        job_number: [{ required: true, message: '工号不能为空' }],
        phone_number: [{ required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile }],
        landline_number: [{ required: true, message: '座机号不能为空', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
        office_address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
        position: [{ required: true, message: '职务不能为空', trigger: 'blur' }]
        // tissue_id: [{ type: 'array', required: true, message: '部门不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    changeAvatar (event) {
      if (event && event.response) this.form.image_url = event.response.media
    },
    handleSelectDepTree (v) {
      this.form.tissue_id = v
    },
    init () { },
    handleReset () {
      this.$refs.form.resetFields()
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          staffCreate(this.form).then(res => {
            this.$Message.success('操作成功')
            this.close()
          })
        }
      })
    },
    close () {
      this.$router.go(-1)
    },
    submited () {
      // this.$router.go(-1)
      // this.$emit('submited', true)
    }
  },
  created () {
    this.height = Number(document.documentElement.clientHeight - 210)
    this.init()
  }
}
</script>
