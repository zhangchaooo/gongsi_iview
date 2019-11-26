<template>
  <div class="search">
    <page-view />
    <Row>
      <Col>
      <member-view v-if="currView=='view'" />
      <Card class="mb-24"
            v-show="currView=='index'">

        <Form ref="searchForm"
              :model="searchForm"
              inline
              :label-width="70"
              class="search-form">
          <Row :gutter="48">
            <Col :xl="8"
                 :lg="24">
            <Form-item label="昵称"
                       prop="nickname">
              <Input type="text"
                     v-model="searchForm.filter.nickname"
                     placeholder="请输入昵称"
                     clearable />
            </Form-item>
            </Col>
            <Col :xl="8"
                 :lg="24">
            <Form-item label="真实姓名"
                       prop="name">
              <Input type="text"
                     v-model="searchForm.filter.name"
                     placeholder="请输入真实姓名"
                     clearable />
            </Form-item>
            </Col>
            <span v-if="drop">
              <Col :xl="8"
                   :lg="24">
              <Form-item label="实名认证"
                         prop="is_real_name">
                <Select v-model="searchForm.filter.is_real_name"
                        placeholder="请选择实名认证"
                        clearable>
                  <Option value="0">未认证</Option>
                  <Option value="1">已认证</Option>
                </Select>
              </Form-item>
              </Col>
              <Col :xl="8"
                   :lg="24">
              <Form-item label="手机号码"
                         prop="mobile">
                <Input type="text"
                       v-model="searchForm.filter.mobile"
                       placeholder="请输入手机号码"
                       clearable />
              </Form-item>
              </Col>
              <!-- <Col :xl="8"
                   :lg="24">
              <Form-item label="注册时间"
                         prop="created_at">
                <DatePicker v-model="selectDate"
                            type="daterange"
                            format="yyyy-MM-dd"
                            @on-change="selectDateRange"
                            placeholder="选择起始时间"></DatePicker>
              </Form-item>
              </Col> -->
            </span>
            <Col :xl="8"
                 :lg="24">
            <Form-item style="margin-left:-35px;"
                       class="br">
              <Button @click="handleSearch"
                      type="primary">查询</Button>
              <Button @click="handleReset">重置</Button>
              <a class="drop-down"
                 @click="dropDown">
                {{dropDownContent}}
                <Icon :type="dropDownIcon"></Icon>
              </a>
            </Form-item>
            </Col>
          </Row>
        </Form>

        <Row class="operation">

          <Col>
          <Button @click="getDataList"
                  icon="md-refresh">刷新</Button>

          </Col>

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
  </div>
</template>

<script>
import pageView from '@/components/layouts/pageView'
import {
  memberList,
  memberDelete,
  memberDeletes
} from '@/api/global/member'
import {
  TjImg
} from '@/components/tools'
import memberView from './view.vue'

export default {
  name: 'member',
  components: {
    memberView,
    TjImg,
    pageView
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
      drop: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      searchForm: { // 搜索框初始化对象
        // include: 'user', // 关联后端模型
        // fields: { user: 'id,username,name' }, // 自定义所需要字段
        filter: {}, // 双向绑定搜索数据
        sort: { id: 'desc' }, // 自定义排序
        page: 1, // 当前页数
        limit: 10 // 页面大小
      },
      selectDate: null,
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
          title: '昵称',
          key: 'nickname',
          minWidth: 120,
          sortable: false
        },
        {
          title: '真实姓名',
          key: 'name',
          minWidth: 120,
          sortable: false
        },
        {
          title: '头像',
          key: 'head_image',
          minWidth: 120,
          sortable: false,
          render: (h, params) => {
            return h('Avatar', {
              props: {
                size: 'large',
                src: params.row.head_image
              }
            })
          }
        },
        {
          title: '实名认证',
          key: 'is_real_name',
          minWidth: 120,
          // sortable: true,
          render: (h, params) => {
            let re = ''
            if (params.row.is_real_name == 1) {
              re = '已认证'
            } else if (params.row.is_real_name == 0) {
              re = '未认证'
            }
            return h('div', re)
          }
        },
        {
          title: '手机号码',
          key: 'mobile',
          minWidth: 120,
          sortable: false
        },
        {
          title: '积分',
          key: 'score',
          minWidth: 120
          // sortable: true
        },
        {
          title: '注册时间',
          key: 'created_at',
          minWidth: 120,
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('div', [
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('view') && h(
                'a',
                {
                  style: {
                    // marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.view(params.row)
                    }
                  }
                },
                '查看'
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('view') && this.$route.meta.permTypes.includes('delete') && h(
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
      this.selectDate = null
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
    selectDateRange (v) {
      if (v) {
        this.searchForm.filter.betweenCreated = v[0] + ',' + v[1]
      }
    },
    dropDown () {
      if (this.drop) {
        this.dropDownContent = '展开'
        this.dropDownIcon = 'ios-arrow-down'
      } else {
        this.dropDownContent = '收起'
        this.dropDownIcon = 'ios-arrow-up'
      }
      this.drop = !this.drop
    },
    getDataList () {
      this.loading = true
      // 带多条件搜索参数获取表单数据 请自行修改接口
      memberList(this.searchForm).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
        }
      })
    },
    view (v) {
      if (!v.id) {
        this.$Message.error('id不能为空')
        return
      }
      this.$router.push({
        name: 'member',
        query: { actions: 'view', id: v.id }
      })
      this.currView = 'view'
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + v.name + ' ?',
        onOk: () => {
          // 删除
          memberDelete(v.id).then(res => {
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
          memberDeletes({ ids: ids }).then(res => {
            this.$Message.success('操作成功')
            this.clearSelectAll()
            this.getDataList()
          })
        }
      })
    },
    popstate () {
      this.currView = 'index'
    }
  },
  mounted () {
    this.init()

    this.currView = this.$route.meta.permTypes.includes(this.$route.query.actions) ? this.$route.query.actions : 'index'
  },
  beforeRouteUpdate (to, from, next) {
    if (to.query.actions == undefined) {
      this.popstate()
    } else {
      this.currView = to.meta.permTypes.includes(to.query.actions) ? to.query.actions : 'index'
    }
    next()
  }
}
</script>
