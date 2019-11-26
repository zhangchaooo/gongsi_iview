<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row class="operation">
          <Button @click="add"
                  type="primary"
                  icon="md-add">添加</Button>
          <Button v-has="'deletes'"
                  @click="delAll"
                  icon="md-trash">批量删除</Button>
          <Button @click="getDataList"
                  icon="md-refresh">刷新</Button>

        </Row>
        <Row>
          <Alert show-icon>
            已选择 <span class="select-count">{{selectCount}}</span> 项
            <a class="select-clear"
               @click="clearSelectAll">清空</a>
          </Alert>
        </Row>
        <Row>
          <Table :loading="loading"
                 border
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
           :styles="{top: '200px'}"
           :mask-closable='false'
           :width="770">
      <Form ref="form"
            :model="form"
            :label-width="100"
            :rules="formValidate"
            inline>
        <FormItem label="姓名"
                  prop="name">
          <Input v-model="form.name"
                 style="width:250px" />
        </FormItem>
        <FormItem label="姓名2"
                  prop="name2">
          <Input v-model="form.name2"
                 style="width:250px" />
        </FormItem>
        <FormItem label="姓名3"
                  prop="name3">
          <Input v-model="form.name3"
                 style="width:250px" />
        </FormItem>
        <FormItem label="姓名4"
                  prop="name4">
          <Input v-model="form.name4"
                 style="width:250px" />
        </FormItem>
        <FormItem label="姓名5"
                  prop="name5">
          <Input v-model="form.name5"
                 style="width:250px" />
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
// import {
//   xinlei,
//   xinleiCreate,
//   xinleiEdit,
//   xinleiList,
//   xinleiDelete,
//   xinleiDeletes
// } from '@/api/xinlei'

export default {
  name: 'xinlei',
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
        name: '',
        name2: '',
        name3: '',
        name4: '',
        name5: ''
      },
      // 表单验证规则
      formValidate: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        name2: [{ required: true, message: '不能为空', trigger: 'blur' }],
        name3: [{ required: true, message: '不能为空', trigger: 'blur' }],
        name4: [{ required: true, message: '不能为空', trigger: 'blur' }],
        name5: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '姓名',
          key: 'name',
          minWidth: 120,
          sortable: false
        },
        {
          title: '姓名2',
          key: 'name2',
          minWidth: 120,
          sortable: false
        },
        {
          title: '姓名3',
          key: 'name3',
          minWidth: 120,
          sortable: false
        },
        {
          title: '姓名4',
          key: 'name4',
          minWidth: 120,
          sortable: false
        },
        {
          title: '姓名5',
          key: 'name5',
          minWidth: 120,
          sortable: false
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('div', [
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'ios-create-outline'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('delete') && h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    icon: 'md-trash'
                  },
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
      // xinleiList(this.searchForm).then(res => {
      //   this.loading = false
      //   if (res) {
      //     this.data = res.data
      //     this.total = res.meta && res.meta.pagination.total
      //   }
      // })
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id
            // xinleiCreate(this.form).then(res => {
            //     this.$Message.success('操作成功')
            //     this.getDataList()
            //     this.modalVisible = false
            // })
          } else {
            // 编辑
            // xinleiEdit(this.form.id, this.form).then(res => {
            //     this.$Message.success('操作成功')
            //     this.getDataList()
            //     this.modalVisible = false
            // })
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
        content: '您确认要删除 ' + v.name + ' ?',
        onOk: () => {
          // 删除
          // ;
          // xinleiDelete(v.id).then(res => {
          //
          //   if (res) {
          //     this.$Message.success('操作成功')
          //     this.getDataList()
          //   }
          // })
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

          // xinleiDeletes({ ids: ids }).then(res => {
          //
          //   if (res) {
          //     this.$Message.success('操作成功')
          //     this.clearSelectAll()
          //     this.getDataList()
          //   }
          // })
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
