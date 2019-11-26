<template>
  <div class="search">
    <Row>
      <Col>
      <add v-if="currView=='add'"
           @close="currView='index'"
           @submited="submited" />
      <edit v-if="currView=='edit'"
            @close="currView='index'"
            @submited="submited"
            :id="id" />
      <Card v-show="currView=='index'">
        <Row @keydown.enter.native="handleSearch">
          <Form ref="searchForm"
                :model="searchForm"
                inline
                :label-width="70"
                class="search-form">
            <Form-item label="角色标识"
                       prop="name">
              <Input type="text"
                     v-model="searchForm.filter.name"
                     placeholder="请输入角色标识"
                     clearable
                     style="width: 200px" />
            </Form-item>
            <Form-item label="角色名称"
                       prop="title">
              <Input type="text"
                     v-model="searchForm.filter.title"
                     placeholder="请输入角色名称"
                     clearable
                     style="width: 200px" />
            </Form-item>
            <Form-item style="margin-left:-35px;"
                       class="br">
              <Button @click="handleSearch"
                      type="primary"
                      icon="ios-search">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </Form-item>
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

  </div>
</template>

<script>
import {
  roles,
  rolesList,
  rolesDelete,
  rolesDeletes
} from '@/api/roles'
import add from './add.vue'
import edit from './edit.vue'

export default {
  name: 'roles',
  components: {
    add,
    edit
  },
  data () {
    return {
      id: '',
      currView: 'index',
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
          title: '更新时间',
          key: 'updated_at',
          minWidth: 120,
          sortable: true
        },
        {
          title: '创建时间',
          key: 'created_at',
          minWidth: 120,
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '角色标识',
          key: 'name',
          minWidth: 120,
          sortable: false
        },
        {
          title: '角色名称',
          key: 'title',
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
                    size: 'small'
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
                    size: 'small'
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
    submited () {
      this.currView = 'index'
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
      rolesList(this.searchForm).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
        }
      })
    },
    add () {
      this.currView = 'add'
    },
    edit (v) {
      if (!v.id) {
        this.$Message.error('id不能为空')
        return
      }
      this.currView = 'edit'
      this.id = v.id
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + v.name + ' ?',
        onOk: () => {
          // 删除
          rolesDelete(v.id).then(res => {
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
          rolesDeletes({ ids: ids }).then(res => {
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
