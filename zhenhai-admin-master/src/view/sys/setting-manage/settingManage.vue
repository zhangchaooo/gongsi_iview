<style lang="less">
@import "./settingManage.less";
</style>
<template>
  <div>
    <Card>
      <Tabs v-model="tabName"
            :animated="false"
            style="overflow: visible">
        <TabPane label="系统配置"
                 name="sys">
          <div style="display:flex;position:relative">
            <Form ref="sysForm"
                  :model="sys"
                  :label-width="110"
                  label-position="right"
                  :rules="sysValidate">
              <FormItem label="系统名称："
                        prop="name">
                <Tooltip placement="right"
                         content="管理后台首页显示系统名称">
                  <Input type="text"
                         v-model="sys.name"
                         placeholder="请输入系统名称，如xx管理后台"
                         style="width: 350px" />
                </Tooltip>
              </FormItem>
              <FormItem label="系统LOGO："
                        prop="blacklist">
                <upload-pic-thumb @on-change="changeAvatar($event)"
                                  :multiple="false"
                                  ref="uploadThumb"></upload-pic-thumb>
              </FormItem>
              <FormItem>
                <Button type="primary"
                        style="width: 100px;margin-right:5px"
                        :loading="saveLoading"
                        @click="saveEditSys">保存更改</Button>
              </FormItem>
            </Form>
            <Spin fix
                  v-if="loading"></Spin>
          </div>
        </TabPane>
        <TabPane label="微信公众号配置"
                 name="wechat">
          <div style="display:flex;">
            <Form ref="wechatForm"
                  :model="wechat"
                  :label-width="110"
                  label-position="right"
                  :rules="wechatValidate">
              <div>
                <FormItem label="appid："
                          prop="appid">
                  <Input type="text"
                         v-model="wechat.appid"
                         placeholder="请输入appid"
                         style="width: 350px" />
                </FormItem>
                <FormItem label="secret："
                          prop="secret">
                  <Input type="text"
                         v-model="wechat.secret"
                         placeholder="请输入secret"
                         style="width: 350px" />
                </FormItem>
                <FormItem label="token："
                          prop="token">
                  <Input type="text"
                         v-model="wechat.token"
                         :readonly="true"
                         style="width: 350px" />
                </FormItem>
                <FormItem label="aesKey："
                          prop="key">
                  <Input type="text"
                         v-model="wechat.key"
                         :readonly="true"
                         style="width: 350px" />
                </FormItem>
              </div>
              <FormItem>
                <Button type="primary"
                        style="width: 100px;margin-right:5px"
                        :loading="saveLoading"
                        @click="saveEditWechat">保存并启用</Button>
              </FormItem>
            </Form>
            <Spin fix
                  v-if="loading"></Spin>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
import {
  settingSiteGet,
  settingSiteSet,
  settingWechatGet,
  settingWechatSet
} from '@/api/setting'
import uploadPicThumb from '@/components/tj/upload-pic-thumb'
import settingImg from '@/assets/RzwpdLnhmvDJToTdfDPe.png'
export default {
  components: {
    uploadPicThumb
  },
  name: 'setting-manage',
  data () {
    return {
      description: '请填写系统配置、短信配置等配置项。',
      linkList: [
        { href: '#', title: '产品简介' },
        { href: '#', title: '产品文档' }
      ],
      extraImage: settingImg,
      tabName: 'sys',
      loading: false, // 表单加载状态
      saveLoading: false,
      sys: {
        name: '',
        logo: ''
      },
      changedsysSK: false, // 是否修改sys的secrectKey
      wechat: {
        appid: '',
        secret: '',
        token: 'a4b5bac8a91c2529ab',
        key: 'pIYCt8D9PN81G6n82D9cMMxCDixyMBx9GCx89m6NMP2'
      },
      sysValidate: {
        // 表单验证规则
        name: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      wechatValidate: {
        // 表单验证规则
        appid: [{ required: true, message: '不能为空', trigger: 'blur' }],
        secret: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      endpointPH: '请输入空间访问域名',
      dictBucketRegions: [
      ]
    }
  },
  methods: {
    changeAvatar (event) {
      if (event && event.response) this.sys.logo = event.response.media
    },
    init () {
      this.initSys()
      this.initWechat()
    },
    initSys () {
      this.loading = true
      settingSiteGet().then(res => {
        if (res) {
          this.sys.name = res.name
          res.logo.length && this.$refs.uploadThumb.setData(res.logo)
          this.loading = false
        }
      })
    },
    initWechat () {
      this.loading = true
      settingWechatGet().then(res => {
        if (res) {
          this.wechat.appid = res.appid
          this.wechat.secret = res.secret
          this.loading = false
        }
      })
    },
    saveEditSys () {
      this.$refs.sysForm.validate(valid => {
        if (valid) {
          settingSiteSet(this.sys).then(res => {
            this.$Message.success('保存成功')
          })
        }
      })
    },
    saveEditWechat () {
      this.$refs.wechatForm.validate(valid => {
        if (valid) {
          settingWechatSet(this.wechat).then(res => {
            this.$Message.success('保存成功')
          })
        }
      })
    }
  },
  mounted () {
    let name = this.$route.query.name
    if (name) {
      this.tabName = name
    }
    this.init()
  }
}
</script>
