<style lang="less">
@import "./roleManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row class="operation">
          <Button @click="addRole"
                  type="primary"
                  icon="md-add">添加角色</Button>
          <Button @click="delAll"
                  icon="md-trash">批量删除</Button>
          <Button @click="init"
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
          <Page :current="pageNumber"
                :total="total"
                :page-size="pageSize"
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
    <!-- 编辑 -->
    <Modal :title="modalTitle"
           :styles="{top: '200px'}"
           v-model="roleModalVisible"
           :mask-closable='false'
           :width="500">
      <Form ref="roleForm"
            :model="roleForm"
            :label-width="80"
            :rules="roleFormValidate">
        <FormItem label="角色名称"
                  prop="title">
          <Input v-model="roleForm.title" />
        </FormItem>
        <FormItem label="角色标识"
                  prop="name">
          <Input v-model="roleForm.name"
                 placeholder="建议以‘ROLE_’开头" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text"
                @click="cancelRole">取消</Button>
        <Button type="primary"
                :loading="submitLoading"
                @click="submitRole">提交</Button>
      </div>
    </Modal>
    <!-- 菜单权限 -->
    <Modal :title="modalTitle"
           v-model="permModalVisible"
           :mask-closable='false'
           :width="500"
           :styles="{top: '30px'}"
           class="permModal">
      <Tree ref="tree"
            :data="permData"
            multiple
            show-checkbox
            :render="renderContent"></Tree>
      <Spin size="large"
            v-if="treeLoading"></Spin>
      <div slot="footer">
        <Button type="text"
                @click="cancelPermEdit">取消</Button>
        <Select v-model="openLevel"
                @on-change="changeOpen"
                style="width:100px;text-align:left;margin-right:10px">
          <Option value="0">展开所有</Option>
          <Option value="1">收合所有</Option>
          <Option value="2">仅展开一级</Option>
          <Option value="3">仅展开两级</Option>
        </Select>
        <Button @click="selectTreeAll">全选/反选</Button>
        <Button type="primary"
                :loading="submitPermLoading"
                @click="submitPermEdit">提交</Button>
      </div>
    </Modal>
    <!-- 数据权限 -->
    <Modal :title="modalTitle"
           v-model="depModalVisible"
           :mask-closable='false'
           :width="500"
           :styles="{top: '30px'}"
           class="depModal">
      <Form :label-width="65">
        <FormItem label="数据范围">
          <Select v-model="dataType">
            <Option :value="0">全部数据权限</Option>
            <Option :value="1">自定义数据权限</Option>
          </Select>
        </FormItem>
      </Form>
      <Alert show-icon>
        默认可查看全部数据，自定义数据范围请点击选择下方数据
      </Alert>
      <div v-if="dataType!=0"
           style="margin-top:15px">
        <Tree ref="depTree"
              :data="depData"
              :load-data="loadData"
              @on-toggle-expand="expandCheckDep"
              multiple
              style="margin-top:15px"></Tree>
        <Spin size="large"
              v-if="depTreeLoading"></Spin>
      </div>
      <div slot="footer">
        <Button type="text"
                @click="depModalVisible=false">取消</Button>
        <Button type="primary"
                :loading="submitDepLoading"
                @click="submitDepEdit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  rolesList,
  rolesCreate,
  rolesEdit,
  rolesDelete,
  rolesDeletes,
  editRolePermission
} from '@/api/roles'
import {
  getAllPermissionList
} from '@/api/permission'
import { initRouter } from '@/libs/util.js'

export default {
  name: 'role-manage',
  data () {
    return {
      checkStrictly: false,
      openLevel: '0',
      loading: true,
      treeLoading: true,
      depTreeLoading: true,
      operationLoading: false,
      submitPermLoading: false,
      submitDepLoading: false,
      searchKey: '',
      sortColumn: 'createTime',
      sortType: 'desc',
      modalType: 0,
      roleModalVisible: false,
      permModalVisible: false,
      depModalVisible: false,
      modalTitle: '',
      roleForm: {
        name: '',
        title: ''
      },
      roleFormValidate: {
        title: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        name: [{ required: true, type: 'string', message: '角色标识不能为空', trigger: 'blur' }]
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      columns: [
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
          title: '角色名称',
          key: 'title',
          width: 150
          // sortable: true
        },
        {
          title: '角色标识',
          key: 'name',
          minWidth: 190
          // sortable: true
        },
        {
          title: '创建时间',
          key: 'created_at',
          minWidth: 190,
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          // fixed: 'right',
          width: 230,
          render: (h, params) => {
            return h('div', [
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('other') && h(
                'a',
                {
                  on: {
                    click: () => {
                      this.editPerm(params.row)
                    }
                  }
                },
                '菜单权限'
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('other') && h(
                'Divider',
                {
                  props: {
                    type: 'vertical'
                  }
                }
              ),
              // h(
              //   'Button',
              //   {
              //     props: {
              //       type: 'primary',
              //       size: 'small'
              //     },
              //     style: {
              //       marginRight: '5px'
              //     },
              //     on: {
              //       click: () => {
              //         this.editDep(params.row)
              //       }
              //     }
              //   },
              //   '数据权限'
              // ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && h(
                'a',
                {
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
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: '',
      selectAllFlag: false,
      depData: [],
      dataType: 0,
      editDepartments: []
    }
  },
  methods: {
    init () {
      this.getRoleList()
      // 获取所有菜单权限树
      this.getPermList()
    },
    renderContent (h, { root, node, data }) {
      let icon = ''
      if (data.level == 0) {
        icon = 'ios-navigate'
      } else if (data.level == 1) {
        icon = 'md-list-box'
      } else if (data.level == 2) {
        icon = 'md-list'
      } else if (data.level == 3) {
        icon = 'md-radio-button-on'
      } else {
        icon = 'md-radio-button-off'
      }
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            cursor: 'pointer'
          },
          on: {
            click: () => {
              data.checked = !data.checked
            }
          }
        },
        [
          h('span', [
            h('Icon', {
              props: {
                type: icon,
                size: '16'
              },
              style: {
                'margin-right': '8px',
                'margin-bottom': '3px'
              }
            }),
            h('span', { class: 'ivu-tree-title' }, data.title)
          ])
        ]
      )
    },
    changePage (v) {
      this.pageNumber = v
      this.getRoleList()
      this.clearSelectAll()
    },
    changePageSize (v) {
      this.pageSize = v
      this.getRoleList()
    },
    changeSort (e) {
      this.searchForm.sort = e.order === 'normal' ? null
        : e.order === 'desc' ? '-' + e.key : e.key
      this.getRoleList()
    },
    getRoleList () {
      this.loading = true
      let params = {
        page: this.pageNumber,
        limit: this.pageSize,
        sort: this.sortColumn,
        order: this.sort
      }
      rolesList(params).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
        }
      })
    },
    getPermList () {
      this.treeLoading = true
      getAllPermissionList().then(res => {
        this.treeLoading = false
        if (res) {
          this.deleteDisableNode(res)
          this.permData = res
        }
      })
    },
    // 递归标记禁用节点
    deleteDisableNode (permData) {
      let that = this
      permData.forEach(function (e) {
        e.checked = false
        e.expand = true
        e.selected = false
        if (e.status == -1) {
          e.title = '[已禁用] ' + e.title
          e.disabled = true
        }
        if (e.children && e.children.length > 0) {
          that.deleteDisableNode(e.children)
        }
      })
    },
    cancelRole () {
      this.roleModalVisible = false
    },
    submitRole () {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加
            rolesCreate(this.roleForm).then(res => {
              this.$Message.success('操作成功')
              this.getRoleList()
              this.roleModalVisible = false
            })
          } else {
            rolesEdit(this.roleForm.id, this.roleForm).then(res => {
              this.$Message.success('操作成功')
              this.getRoleList()
              this.roleModalVisible = false
            })
          }
        }
      })
    },
    addRole () {
      this.modalType = 0
      this.modalTitle = '添加角色'
      this.$refs.roleForm.resetFields()
      delete this.roleForm.id
      this.roleModalVisible = true
    },
    edit (v) {
      this.modalType = 1
      this.modalTitle = '编辑角色'
      this.$refs.roleForm.resetFields()
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let roleInfo = JSON.parse(str)
      this.roleForm = roleInfo
      this.roleModalVisible = true
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除角色 ' + v.title + ' ?',
        onOk: () => {
          rolesDelete(v.id).then(res => {
            this.$Message.success('删除成功')
            this.getRoleList()
          })
        }
      })
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false)
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
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
          // ids = ids.substring(0, ids.length - 1)
          rolesDeletes({ ids: ids }).then(res => {
            this.$Message.success('删除成功')
            this.clearSelectAll()
            this.getRoleList()
          })
        }
      })
    },
    editPerm (v) {
      console.log(v)
      console.log(this.permData)
      this.editRolePermId = v.id
      this.modalTitle = '分配 ' + v.title + ' 的菜单权限'
      // 没有权限的角色先初始化一下，避免未保存影响其他角色
      this.selectedTreeAll(this.permData, false)
      // 匹配勾选
      let rolePerms = v.permissions
      // 递归判断子节点
      this.checkPermTree(this.permData, rolePerms)
      this.permModalVisible = true
      // this.checkStrictly = false
    },
    // 递归判断子节点
    checkPermTree (permData, rolePerms) {
      let that = this
      permData.forEach(function (p) {
        if (that.hasPerm(p, rolePerms) && p.status != -1) {
          p.checked = true
        } else {
          p.checked = false
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms)
        }
      })
    },
    // 判断角色拥有的权限节点勾选
    hasPerm (p, rolePerms) {
      let flag = false
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id === rolePerms[i].id) {
          flag = true
          break
        }
      }
      if (flag) {
        return true
      }
      return false
    },
    // 全选反选
    selectTreeAll () {
      this.selectAllFlag = !this.selectAllFlag
      let select = this.selectAllFlag
      this.selectedTreeAll(this.permData, select)
    },
    // 递归全选节点
    selectedTreeAll (permData, select) {
      let that = this
      permData.forEach(function (e) {
        e.checked = select
        // 清空半选中状态
        e.indeterminate = false
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select)
        }
      })
    },
    submitPermEdit () {
      let permIds = []
      let selectedNodes = this.$refs.tree.getCheckedAndIndeterminateNodes()
      selectedNodes.forEach(function (e) {
        permIds.push({ id: e.id, checked: e.checked.toString() })
      })
      editRolePermission(this.editRolePermId, {
        permissions: permIds
      }).then(res => {
        this.$Message.success('操作成功')
        initRouter(this)
        this.getRoleList()
        this.permModalVisible = false
      })
    },
    cancelPermEdit () {
      this.permModalVisible = false
    },
    loadData (item, callback) {
      // loadDepartment(item.id, { openDataFilter: false }).then(res => {
      //   if (res) {
      //     res.forEach(function (e) {
      //       e.selected = false
      //       if (e.isParent) {
      //         e.loading = false
      //         e.children = []
      //       }
      //       if (e.status == -1) {
      //         e.title = '[已禁用] ' + e.title
      //         e.disabled = true
      //       }
      //     })
      //     callback(res.result)
      //   }
      // })
    },
    editDep (v) {
      // this.dataType = 0
      // this.editRolePermId = v.id
      // this.modalTitle = '分配 ' + v.name + ' 的数据权限'
      // if (v.dataType) {
      //   this.dataType = v.dataType
      // }
      // // 匹配勾选
      // let roleDepIds = v.departments
      // this.editDepartments = roleDepIds
      // this.depTreeLoading = true
      // initDepartment({ openDataFilter: false }).then(res => {
      //   this.depTreeLoading = false
      //   if (res) {
      //     res.forEach(function (e) {
      //       e.selected = false
      //       if (e.isParent) {
      //         e.loading = false
      //         e.children = []
      //       }
      //       if (e.status == -1) {
      //         e.title = '[已禁用] ' + e.title
      //         e.disabled = true
      //       }
      //     })
      //     this.depData = res.result
      //     // 判断子节点
      //     this.checkDepTree(this.depData, roleDepIds)
      //     this.depModalVisible = true
      //   }
      // })
    },
    expandCheckDep (v) {
      // 判断展开子节点
      this.checkDepTree(v.children, this.editDepartments)
    },
    // 判断子节点
    checkDepTree (depData, roleDepIds) {
      let that = this
      depData.forEach(function (p) {
        if (that.hasDepPerm(p, roleDepIds)) {
          p.selected = true
        } else {
          p.selected = false
        }
      })
    },
    // 判断角色拥有的权限节点勾选
    hasDepPerm (p, roleDepIds) {
      let flag = false
      for (let i = 0; i < roleDepIds.length; i++) {
        if (p.id == roleDepIds[i].departmentId) {
          flag = true
          break
        }
      }
      if (flag) {
        return true
      }
      return false
    },
    submitDepEdit () {
      // let depIds = ''
      // if (this.dataType != 0) {
      //   let selectedNodes = this.$refs.depTree.getSelectedNodes()
      //   if (selectedNodes.length < 1) {
      //     this.$Message.error('请至少选择一条数据')
      //     return
      //   }
      //   selectedNodes.forEach(function (e) {
      //     depIds += e.id + ','
      //   })
      //   depIds = depIds.substring(0, depIds.length - 1)
      // }
      // this.submitDepLoading = true
      // editRoleDep({
      //   roleId: this.editRolePermId,
      //   dataType: this.dataType,
      //   depIds: depIds
      // }).then(res => {
      //   this.submitDepLoading = false
      //   if (res) {
      //     this.$Message.success('操作成功')
      //     this.getRoleList()
      //     this.depModalVisible = false
      //   }
      // })
    },
    changeOpen (v) {
      if (v == '0') {
        this.permData.forEach(e => {
          e.expand = true
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = true
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = true
                })
              }
            })
          }
        })
      } else if (v == '1') {
        this.permData.forEach(e => {
          e.expand = false
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = false
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false
                })
              }
            })
          }
        })
      } else if (v == '2') {
        this.permData.forEach(e => {
          e.expand = true
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = false
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false
                })
              }
            })
          }
        })
      } else if (v == '3') {
        this.permData.forEach(e => {
          e.expand = true
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = true
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false
                })
              }
            })
          }
        })
      }
    }
  },
  activated () {
    this.init()
  },
  mounted () {
    this.init()
  }
}
</script>
