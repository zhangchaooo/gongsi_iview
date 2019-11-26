<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row class="operation">
          <Button @click="getDataList"
                  icon="md-refresh">刷新</Button>
          <circleLoading v-if="operationLoading" />
        </Row>

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
        <FormItem label="获得积分"
                  prop="score">
          <InputNumber :min="1"
                       v-model="form.score"
                       style="width:100%"></InputNumber>
        </FormItem>
        <FormItem label="额外奖励"
                  prop="extra_integral">
          <InputNumber :min="1"
                       v-model="form.extra_integral"
                       style="width:100%"></InputNumber>
        </FormItem>
        <FormItem label="奖励上限"
                  prop="max_astrict">
          <InputNumber :min="1"
                       v-model="form.max_astrict"
                       style="width:100%"></InputNumber>
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
  integrals,
  integralsCreate,
  integralsEdit,
  integralsList,
  integralsDelete,
  integralsDeletes,
  integralsStart
} from '@/api/global/integrals'
export default {
  name: 'integrals',
  components: {
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
        sort: '', // 自定义排序
        page: 1, // 当前页数
        limit: 10 // 页面大小
      },
      form: { // 添加或编辑表单对象初始化数据
        score: 0,
        extra_integral: null,
        max_astrict: null
      },
      // 表单验证规则
      formValidate: {
        score: [{ type: 'number', required: true, message: '获得积分不能为空', trigger: 'blur' }]
        // extra_integral: [{ type: 'number', required: true, message: '额外奖励不能为空', trigger: 'blur' }],
        // max_astrict: [{ type: 'number', required: true, message: '奖励上限不能为空', trigger: 'blur' }]
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
          title: '积分类别',
          key: 'name',
          align: 'center',
          minWidth: 120,
          sortable: false
        },
        {
          title: '获得积分',
          key: 'score',
          align: 'center',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            return h('div', params.row.unit ? params.row.score + '/' + params.row.unit : params.row.score)
          }
        },
        {
          title: '额外奖励',
          key: 'extra_integral',
          align: 'center',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            return h('div', params.row.extra_integral || '无')
          }
        },
        {
          title: '奖励上限',
          key: 'max_astrict',
          align: 'center',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            return h('div', params.row.max_astrict || '无')
          }
        },
        {
          title: '状态',
          key: 'state',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (params.row.state == 1) {
              return h('div', [
                h(
                  'Badge',
                  {
                    props: {
                      status: 'success',
                      text: '启用'
                    }
                  }
                )
              ])
            } else if (params.row.state == 0) {
              return h('div', [
                h(
                  'Badge',
                  {
                    props: {
                      status: 'error',
                      text: '禁用'
                    }
                  }
                )
              ])
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200,
          render: (h, params) => {
            let enableOrDisable = ''
            if (params.row.state == 1) {
              enableOrDisable = h(
                'a',
                {
                  style: {
                    // marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.disable(params.row)
                    }
                  }
                },
                '禁用'
              )
            } else {
              enableOrDisable = h(
                'a',
                {
                  style: {
                    // marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.enable(params.row)
                    }
                  }
                },
                '启用'
              )
            }
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
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && this.$route.meta.permTypes.includes('enable') && h(
                'Divider',
                {
                  props: {
                    type: 'vertical'
                  }
                }
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('enable') && enableOrDisable

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
      e.order === 'normal' ? delete this.searchForm.sort[e.key] : this.searchForm.sort[e.key] = e.order
      // this.searchForm.sort = e.order === 'normal' ? null
      //   : e.order === 'desc' ? '-' + e.key : e.key
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
      integralsList(this.searchForm).then(res => {
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
            integralsCreate(this.form).then(res => {
              this.$Message.success('操作成功')
              this.getDataList()
              this.modalVisible = false
            })
          } else {
            // 编辑
            integralsEdit(this.form.id, this.form).then(res => {
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
      this.form = {
        score: data.score,
        extra_integral: data.extra_integral,
        max_astrict: data.max_astrict,
        id: data.id,
        integral_key: data.integral_key
      }
      this.modalVisible = true
    },
    enable (v) {
      this.$Modal.confirm({
        title: '确认启用',
        content: '您确认要启用该规则?',
        onOk: () => {
          integralsStart(v.id, { state: 1 }).then(res => {
            this.$Message.success('操作成功')
            this.init()
          })
        }
      })
    },
    disable (v) {
      this.$Modal.confirm({
        title: '确认禁用',
        content: '您确认要禁用该规则?',
        onOk: () => {
          integralsStart(v.id, { state: 0 }).then(res => {
            this.$Message.success('操作成功')
            this.init()
          })
        }
      })
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + v.name + ' ?',
        onOk: () => {
          // 删除
          // this.operationLoading = true;
          integralsDelete(v.id).then(res => {
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
          integralsDeletes({ ids: ids }).then(res => {
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
