<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form ref="searchForm"
                :model="searchForm"
                inline
                :label-width="70"
                class="search-form">
            <Row :gutter="48">
              <Col :xl="8"
                   :lg="24">
              <Form-item label="平台"
                         prop="platform">
                <Select v-model="searchForm.filter.platform"
                        placeholder="请选择平台"
                        clearable>
                  <Option value="1">IOS</Option>
                  <Option value="2">Android</Option>
                </Select>
              </Form-item>
              </Col>
              <Col :xl="8"
                   :lg="24">
              <Form-item label="终端"
                         prop="terminal">
                <Select v-model="searchForm.filter.terminal"
                        placeholder="请选择终端"
                        clearable>
                  <Option value="owner">业主端</Option>
                  <Option value="property">物业端</Option>
                </Select>
              </Form-item>
              </Col>
              <Col :xl="8"
                   :lg="24">
              <Form-item style="margin-left:-35px;"
                         class="br">
                <Button @click="handleSearch"
                        type="primary"
                        icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row class="operation">
          <Button v-has="'add'"
                  @click="add"
                  type="primary"
                  icon="md-add">添加</Button>
          <Button v-has="'deletes'"
                  @click="delAll"
                  icon="md-trash">批量删除</Button>
          <Button @click="getDataList"
                  icon="md-refresh">刷新</Button>
          <circleLoading v-if="operationLoading" />
        </Row>
        <!-- <Row>
          <Alert show-icon>
            已选择 <span class="select-count">{{selectCount}}</span> 项
            <a class="select-clear"
               @click="clearSelectAll">清空</a>
          </Alert>
        </Row> -->
        <Row>
          <Table :loading="loading"
                 size="large"
                 :columns="columns"
                 :data="data"
                 ref="table"
                 sortable="custom"
                 @on-sort-change="changeSort"
                 @on-selection-change="changeSelect"></Table>
        </Row>
        <Row type="flex"
             justify="end"
             class="page">
          <Page :current="searchForm.page"
                :total="total"
                :page-size="searchForm.limit"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
                :page-size-opts="[10,20,50]"
                size="small"
                show-total
                show-elevator
                show-sizer></Page>
        </Row>
      </Card>
      </Col>
    </Row>
    <Modal :title="modalTitle"
           v-model="modalVisible"
           :mask-closable='false'
           :width="500">
      <Form ref="form"
            :model="form"
            :label-width="100"
            :rules="formValidate">
        <FormItem label="版本号"
                  prop="version">
          <Input v-model="form.version"
                 placeholder="请填写版本号"
                 style="width:100%" />版本号必须为x.x.x
        </FormItem>
        <FormItem label="平台"
                  prop="platform">
          <RadioGroup v-model="form.platform">
            <Radio :label=1>IOS</Radio>
            <Radio :label=2>Android</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="更新方式"
                  prop="update_state">
          <RadioGroup v-model="form.update_state">
            <Radio :label=1>必须更新</Radio>
            <Radio :label=2>可选</Radio>
            <Radio :label=3>不要求</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="下载地址"
                  prop="download_url">
          <Input v-model="form.download_url"
                 placeholder="请填写下载地址"
                 style="width:100%" />
        </FormItem>
        <FormItem label="终端"
                  prop="terminal">
          <RadioGroup v-model="form.terminal">
            <Radio label="owner">业主端</Radio>
            <Radio label="property">物业端</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="发布时间"
                  prop="publish_time">
          <DatePicker type="datetime"
                      @on-change="form.publish_time=$event"
                      format="yyyy-MM-dd HH:mm"
                      placeholder="请填写发布时间"
                      v-model="form.publish_time"
                      style="width:100%"></DatePicker>
        </FormItem>
        <FormItem label="更新描述"
                  prop="description">
          <Input type="textarea"
                 :rows="4"
                 placeholder="请填写更新描述"
                 v-model="form.description"
                 style="width:100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text"
                @click="modalVisible=false">取消</Button>
        <Button type="primary"
                :loading="submitLoading"
                @click="handleSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  version,
  versionCreate,
  versionEdit,
  versionList,
  versionDelete,
  versionDeletes
} from '@/api/version'
import { getDate } from '@/libs/tools'
// import circleLoading from '@/components/tj/circle-loading.vue'
export default {
  name: 'version',
  components: {
    // circleLoading
  },
  data () {
    return {
      loading: true, // 表单加载状态
      operationLoading: false, // 操作加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: '', // 添加或编辑标题
      searchForm: { // 搜索框初始化对象
        // include: 'user', // 关联后端模型
        // fields: { user: 'id,username,name' }, // 自定义所需要字段
        filter: {}, // 双向绑定搜索数据
        sort: { id: 'desc' }, // 自定义排序
        page: 1, // 当前页数
        limit: 10 // 页面大小
      },
      form: { // 添加或编辑表单对象初始化数据
        version: '',
        platform: '',
        update_state: '',
        download_url: '',
        terminal: '',
        publish_time: '',
        description: ''
      },
      // 表单验证规则
      formValidate: {
        version: [{ required: true, message: '版本号不能为空', trigger: 'blur' }],
        platform: [{ required: true, message: '平台不能为空' }],
        update_state: [{ required: true, message: '更新方式不能为空' }],
        download_url: [{ required: true, message: '下载地址不能为空', trigger: 'blur' }],
        terminal: [{ required: true, message: '终端不能为空', trigger: 'blur' }],
        publish_time: [{ required: true, message: '发布时间不能为空' }],
        description: [{ required: true, message: '更新描述不能为空', trigger: 'blur' }]
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        // {
        //   type: 'selection',
        //   width: 60,
        //   align: 'center'
        // },
        // {
        //  type: "index",
        //  width: 60,
        //  align: "center"
        // },
        {
          title: '版本号',
          key: 'version',
          align: 'center',
          minWidth: 120,
          sortable: false
        },
        {
          title: '平台',
          key: 'platform',
          align: 'center',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            let re = ''
            if (params.row.platform == 1) {
              re = 'IOS'
            } else if (params.row.platform == 2) {
              re = 'Android'
            }
            return h('div', re)
          }
        },
        {
          title: '更新方式',
          key: 'update_state',
          align: 'center',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            let re = ''
            if (params.row.update_state == 1) {
              re = '必须更新'
            } else if (params.row.update_state == 2) {
              re = '可选'
            } else if (params.row.update_state == 3) {
              re = '不要求'
            }
            return h('div', re)
          }
        },
        {
          title: '下载地址',
          key: 'download_url',
          minWidth: 120,
          sortable: false
        },
        {
          title: '终端',
          key: 'terminal',
          align: 'center',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            let re = ''
            if (params.row.terminal == 'owner') {
              re = '业主端'
            } else if (params.row.terminal == 'property') {
              re = '物业端'
            }
            return h('div', re)
          }
        },
        {
          title: '发布时间',
          key: 'publish_time',
          minWidth: 120,
          sortable: false,
          render: function (h, params) {
            return h('div',
              params.row.publish_time.substring(0, params.row.publish_time.length - 3))
          }
        },
        // {
        //   title: '更新描述',
        //   key: 'description',
        //   minWidth: 120,
        //   sortable: false
        // },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('div', [
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && h(
                'a',
                {
                  style: {
                    // marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && this.$route.meta.permTypes.includes('delete') && h(
                'Divider',
                {
                  props: {
                    type: 'vertical'
                  }
                }
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('delete') && h(
                'a',
                {
                  on: {
                    click: () => {
                      this.remove(params.row)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      data: [], // 表单数据
      total: 0 // 表单数据总数
    }
  },
  methods: {
    init () {
      this.getDataList()
    },
    changePage (v) {
      this.searchForm.page = v
      this.getDataList()
      this.clearSelectAll()
    },
    changePageSize (v) {
      this.searchForm.limit = v
      this.getDataList()
    },
    handleSearch () {
      this.searchForm.page = 1
      this.searchForm.limit = 10
      this.getDataList()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.filter = {}
      this.searchForm.page = 1
      this.searchForm.limit = 10
      // 重新加载数据
      this.getDataList()
    },
    changeSort (e) {
      this.searchForm.sort = e.order === 'normal' ? null
        : e.order === 'desc' ? '-' + e.key : e.key
      this.getDataList()
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false)
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
    },
    getDataList () {
      this.loading = true
      // 带多条件搜索参数获取表单数据 请自行修改接口
      versionList(this.searchForm).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
        }
      })
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id
            versionCreate(this.form).then(res => {
              this.$Message.success('操作成功')
              this.getDataList()
              this.modalVisible = false
            })
          } else {
            // 编辑
            versionEdit(this.form.id, this.form).then(res => {
              this.$Message.success('操作成功')
              this.getDataList()
              this.modalVisible = false
            })
          }
        }
      })
    },
    add () {
      this.modalType = 0
      this.modalTitle = '添加'
      this.$refs.form.resetFields()
      delete this.form.id
      this.modalVisible = true
    },
    edit (v) {
      this.modalType = 1
      this.modalTitle = '编辑'
      this.$refs.form.resetFields()
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let data = JSON.parse(str)
      this.form = data
      this.modalVisible = true
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + v.version + ' ?',
        onOk: () => {
          // 删除
          // this.operationLoading = true;
          versionDelete(v.id).then(res => {
            this.operationLoading = false
            this.$Message.success('操作成功')
            this.getDataList()
          })
        }
      })
    },
    delAll () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 条数据?',
        onOk: () => {
          let ids = []
          this.selectList.forEach(function (e) {
            ids.push(e.id)
          })
          // 批量删除
          this.operationLoading = true
          versionDeletes({ ids: ids }).then(res => {
            this.operationLoading = false
            this.$Message.success('操作成功')
            this.clearSelectAll()
            this.getDataList()
          })
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style lang="less">
.search {
  .operation {
    margin-bottom: 2vh;
  }
  .select-count {
    font-size: 13px;
    font-weight: 600;
    color: #40a9ff;
  }
  .select-clear {
    margin-left: 10px;
  }
  .page {
    margin-top: 2vh;
  }
  .drop-down {
    font-size: 13px;
    margin-left: 5px;
  }
}
</style>
