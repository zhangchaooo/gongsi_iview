<style lang="less">
@import "./menuManage.less";
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="addMenu"
                type="primary"
                icon="md-add">添加子节点</Button>
        <Button @click="addButton"
                type="primary"
                icon="md-add">添加按钮权限</Button>
        <Button @click="addRootMenu"
                icon="md-add">添加顶部菜单</Button>
        <Button @click="delAll"
                icon="md-trash">批量删除</Button>
        <!-- <Dropdown @on-click="handleDropdown">
          <Button>
            更多操作
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
           <DropdownMenu slot="list">
            <DropdownItem name="refresh">刷新</DropdownItem>
            <DropdownItem name="expandOne">仅显示一级</DropdownItem>
            <DropdownItem name="expandTwo">仅展开一级</DropdownItem>
            <DropdownItem name="expandThree">仅展开两级</DropdownItem>
            <DropdownItem name="expandAll">展开所有</DropdownItem>
          </DropdownMenu>
        </Dropdown>-->
        <!-- <i-switch v-model="strict" size="large" style="margin-left:5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch> -->
      </Row>
      <Row type="flex"
           justify="start"
           class="code-row-bg">
        <Col span="6">
        <Alert show-icon>
          当前选择编辑：
          <span class="select-title">{{editTitle}}</span>
          <a class="select-clear"
             v-if="menuForm.id"
             @click="cancelEdit">取消选择</a>
        </Alert>
        <Input v-model="searchKey"
               suffix="ios-search"
               @on-change="search"
               placeholder="输入菜单名搜索"
               clearable />
        <div>权限按钮只允许在最子级页面下添加</div>
        <div class="tree-bar"
             :style="{maxHeight: maxHeight}">
          <Tree ref="tree"
                :data="data"
                show-checkbox
                :render="renderContent"
                @on-check-change="changeSelect"
                :check-strictly="!strict"></Tree>
        </div>
        <Spin size="large"
              fix
              v-if="loading"></Spin>
        </Col>
        <Col span="9"
             style="margin-left:10px">
        <Form ref="menuForm"
              :model="menuForm"
              :label-width="100"
              :rules="menuFormValidate">
          <FormItem label="类型"
                    prop="type">
            <div v-show="menuForm.type==-1">
              <Icon type="ios-navigate-outline"
                    size="16"
                    style="margin:0 5px 3px 0;"></Icon>
              <span>顶部菜单</span>
            </div>
            <div v-show="menuForm.type==0">
              <Icon type="ios-list-box-outline"
                    size="16"
                    style="margin:0 5px 3px 0;"></Icon>
              <span>页面菜单</span>
            </div>
            <div v-show="menuForm.type==1">
              <Icon type="md-radio-button-on"
                    size="16"
                    style="margin:0 5px 3px 0;"></Icon>
              <span>操作按钮</span>
            </div>
          </FormItem>
          <FormItem label="名称"
                    prop="title"
                    v-if="menuForm.type==-1||menuForm.type==0">
            <Input v-model="menuForm.title" />
          </FormItem>
          <FormItem label="名称"
                    prop="title"
                    v-if="menuForm.type==1">
            <Tooltip placement="right"
                     content="操作按钮名称不得重复">
              <Input v-model="menuForm.title" />
            </Tooltip>
          </FormItem>
          <FormItem label="路径"
                    prop="path"
                    v-if="menuForm.type!==1">
            <Input v-model="menuForm.path" />
            <span style="margin-left:5px">三级菜单不提倡加'/'斜杠,路径和路由英文名建议一样</span>
          </FormItem>
          <FormItem label="按钮权限类型"
                    prop="button_type"
                    v-if="menuForm.type==1">
            <Select v-model="menuForm.button_type"
                    @on-change="handleButtonType"
                    placeholder="请选择或输入搜索"
                    filterable
                    clearable>
              <Option v-for="(item, i) in dictPermissions"
                      :key="i"
                      :value="item.value">{{item.title}}</Option>
            </Select>
          </FormItem>
          <FormItem label="请求路径"
                    prop="path"
                    v-if="menuForm.type==1">
            <Tooltip placement="right"
                     :max-width="230"
                     transfer
                     content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他">
              <Input v-model="menuForm.path" />
            </Tooltip>
          </FormItem>
          <FormItem label="路由请求方式"
                    prop="http_method"
                    v-if="menuForm.type==1">
            <Tooltip placement="right"
                     :max-width="230"
                     transfer
                     content="填写后台请求URL的请求方式，若未填写请求URL可不填写">
              <Input v-model="menuForm.http_method"
                     style="width:368px" />
            </Tooltip>
          </FormItem>

          <FormItem label="英文名"
                    prop="name"
                    v-if="menuForm.type==-1">
            <Tooltip placement="right"
                     content="需唯一">
              <Input v-model="menuForm.name" />
            </Tooltip>
          </FormItem>
          <FormItem label="路由英文名"
                    prop="name"
                    v-if="menuForm.type==0">
            <Tooltip placement="right"
                     content="需唯一">
              <Input v-model="menuForm.name" />
            </Tooltip>
          </FormItem>
          <FormItem label="图标"
                    prop="icon"
                    v-if="menuForm.type==-1||menuForm.type==0">
            <icon-choose v-model="menuForm.icon"></icon-choose>
          </FormItem>
          <FormItem label="前端组件"
                    prop="component"
                    v-if="menuForm.type!==1">
            <Input v-model="menuForm.component" />
          </FormItem>
          <FormItem label="排序值"
                    prop="sort_order">
            <InputNumber :max="1000"
                         :min="0"
                         v-model="menuForm.sort_order"></InputNumber>
            <span style="margin-left:5px">值越小越靠前，支持小数</span>
          </FormItem>
          <FormItem v-if="menuForm.type==-1"
                    label="全局菜单"
                    prop="is_overall">
            <i-switch size="large"
                      v-model="menuForm.is_overall"
                      :true-value=1
                      :false-value=0>
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
            <span style="margin-left:5px">只需设置1级菜单即可</span>
          </FormItem>
          <FormItem label="是否启用"
                    prop="status">
            <i-switch size="large"
                      v-model="menuForm.status"
                      :true-value="0"
                      :false-value="-1">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
            </i-switch>
          </FormItem>
          <Form-item>
            <Button style="margin-right:5px"
                    @click="submitEdit"
                    :loading="submitLoading"
                    type="primary"
                    icon="ios-create-outline">修改并保存</Button>
            <Button @click="handleReset">重置</Button>
          </Form-item>
        </Form>
        </Col>
      </Row>
    </Card>

    <Modal draggable
           :title="modalTitle"
           v-model="menuModalVisible"
           :mask-closable="false"
           :width="500"
           :styles="{top: '30px'}">
      <Form ref="menuFormAdd"
            :model="menuFormAdd"
            :label-width="100"
            :rules="menuFormValidate">
        <div v-if="showParent">
          <FormItem label="上级节点：">{{parentTitle}}</FormItem>
        </div>
        <FormItem label="类型"
                  prop="type">
          <div v-show="menuFormAdd.type==-1">
            <Icon type="ios-navigate-outline"
                  size="16"
                  style="margin:0 5px 3px 0;"></Icon>
            <span>顶部菜单</span>
          </div>
          <div v-show="menuFormAdd.type==0">
            <Icon type="ios-list-box-outline"
                  size="16"
                  style="margin:0 5px 3px 0;"></Icon>
            <span>页面菜单</span>
          </div>
          <div v-show="menuFormAdd.type==1">
            <Icon type="md-radio-button-on"
                  size="16"
                  style="margin:0 5px 3px 0;"></Icon>
            <span>操作按钮</span>
          </div>
        </FormItem>
        <FormItem label="名称"
                  prop="title"
                  v-if="menuFormAdd.type==-1||menuFormAdd.type==0">
          <Input v-model="menuFormAdd.title" />
        </FormItem>
        <FormItem label="名称"
                  prop="title"
                  v-if="menuFormAdd.type==1">
          <Tooltip placement="right"
                   content="操作按钮名称不得重复">
            <Input v-model="menuFormAdd.title"
                   style="width:368px" />
          </Tooltip>
        </FormItem>
        <FormItem label="按钮权限类型"
                  prop="button_type"
                  v-if="menuFormAdd.type==1">
          <Select v-model="menuFormAdd.button_type"
                  @on-change="handleAddButtonType"
                  placeholder="请选择或输入搜索"
                  filterable
                  clearable>
            <Option v-for="(item, i) in dictPermissions"
                    :key="i"
                    :value="item.value">{{item.title}}</Option>
          </Select>
        </FormItem>
        <FormItem label="路径"
                  prop="path"
                  v-if="menuFormAdd.type!==1">
          <Input v-model="menuFormAdd.path" />
        </FormItem>
        <FormItem label="请求路径"
                  prop="path"
                  v-if="menuFormAdd.type==1">
          <Tooltip placement="right"
                   :max-width="230"
                   transfer
                   content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他">
            <Input v-model="menuFormAdd.path"
                   style="width:368px" />
          </Tooltip>
        </FormItem>
        <FormItem label="路由请求方式"
                  prop="http_method"
                  v-if="menuFormAdd.type==1">
          <Tooltip placement="right"
                   :max-width="230"
                   transfer
                   content="填写后台请求URL的请求方式，若未填写请求URL可不填写">
            <Input v-model="menuFormAdd.http_method"
                   style="width:368px" />
          </Tooltip>
        </FormItem>
        <FormItem label="英文名"
                  prop="name"
                  v-if="menuFormAdd.type==-1">
          <Tooltip placement="right"
                   content="需唯一">
            <Input v-model="menuFormAdd.name" />
          </Tooltip>
        </FormItem>
        <FormItem label="路由英文名"
                  prop="name"
                  v-if="menuFormAdd.type==0">
          <Tooltip placement="right"
                   content="需唯一">
            <Input v-model="menuFormAdd.name"
                   style="width:368px" />
          </Tooltip>
        </FormItem>
        <FormItem label="图标"
                  prop="icon"
                  v-if="menuFormAdd.type==-1||menuFormAdd.type==0">
          <icon-choose v-model="menuFormAdd.icon"></icon-choose>
        </FormItem>
        <FormItem label="前端组件"
                  prop="component"
                  v-if="menuFormAdd.type!==1">
          <Input v-model="menuFormAdd.component" />
        </FormItem>
        <FormItem label="排序值"
                  prop="sort_order">
          <InputNumber :max="1000"
                       :min="0"
                       v-model="menuFormAdd.sort_order"></InputNumber>
          <span style="margin-left:5px">值越小越靠前，支持小数</span>
        </FormItem>
        <FormItem v-if="menuFormAdd.type==-1"
                  label="全局菜单"
                  prop="is_overall">
          <i-switch size="large"
                    v-model="menuFormAdd.is_overall"
                    :true-value=1
                    :false-value=0>
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </FormItem>
        <FormItem label="是否启用"
                  prop="status">
          <i-switch size="large"
                    v-model="menuFormAdd.status"
                    :true-value="0"
                    :false-value="-1">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text"
                @click="cancelAdd">取消</Button>
        <Button type="primary"
                :loading="submitLoading"
                @click="submitAdd">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  permissionCreate,
  permissionEdit,
  permissionDelete,
  permissionDeletes,
  getAllPermissionList
} from '@/api/permission'
import IconChoose from '@/components/tj/icon-choose'
import { initRouter } from '@/libs/util.js'
export default {
  name: 'menu-manage',
  components: {
    IconChoose
  },
  data () {
    return {
      loading: true,
      strict: false,
      maxHeight: '500px',
      expandLevel: 2,
      menuModalVisible: false,
      iconModalVisible: false,
      selectList: [],
      selectCount: 0,
      showParent: false,
      searchKey: '',
      parentTitle: '',
      editTitle: '',
      modalTitle: '',
      menuForm: {
        id: '',
        title: '',
        name: '',
        icon: '',
        path: '',
        component: '',
        parent_id: '',
        button_type: '',
        is_overall: '',
        type: 0,
        sort_order: 0,
        level: null,
        status: 0,
        url: ''
      },
      menuFormAdd: {
        button_type: ''
      },
      menuFormValidate: {
        button_type: [{ required: true, message: '按钮类型必选，单纯限制数据获取权限可选其他', trigger: 'change' }],
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        name: [
          { required: true, message: '路由英文名不能为空', trigger: 'blur' }
        ],
        icon: [{ required: true, message: '图标不能为空', trigger: 'click' }],
        path: [{ required: true, message: '路径不能为空', trigger: 'blur' }],
        component: [
          { required: true, message: '前端组件不能为空', trigger: 'blur' }
        ]
      },
      submitLoading: false,
      data: [],
      treeData: [],
      dictPermissions: [
        { 'title': '查看操作(view)', 'value': 'view', 'http_method': 'GET' },
        { 'title': '添加操作(add)', 'value': 'add', 'http_method': 'POST' },
        { 'title': '编辑操作(edit)', 'value': 'edit', 'http_method': 'PATCH' },
        { 'title': '删除操作(delete)', 'value': 'delete', 'http_method': 'DELETE' },
        { 'title': '批量删除操作(deletes)', 'value': 'deletes', 'http_method': 'DELETE' },
        { 'title': '清空操作(clear)', 'value': 'clear', 'http_method': 'POST' },
        { 'title': '启用操作(enable)', 'value': 'enable', 'http_method': 'POST' },
        { 'title': '禁用操作(disable)', 'value': 'disable', 'http_method': 'POST' },
        { 'title': '搜索操作(search)', 'value': 'search', 'http_method': 'POST' },
        { 'title': '上传文件(upload)', 'value': 'upload', 'http_method': 'POST' },
        { 'title': '导出操作(output)', 'value': 'output', 'http_method': '' },
        { 'title': '导入操作(input)', 'value': 'input', 'http_method': 'POST' },
        { 'title': '分配权限(editPerm)', 'value': 'editPerm', 'http_method': 'PATCH' },
        { 'title': '设为默认(setDefault)', 'value': 'setDefault', 'http_method': 'POST' },
        { 'title': '其他操作(other)', 'value': 'other', 'http_method': '' }]
    }
  },
  methods: {
    init () {
      this.getAllList()
    },
    handleAddButtonType (v) {
      this.dictPermissions.forEach(e => {
        if (v == e.value) this.menuFormAdd.http_method = e.http_method
      })
    },
    handleButtonType (v) {
      this.dictPermissions.forEach(e => {
        if (v == e.value) this.menuForm.http_method = e.http_method
      })
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
              this.selectTree(data)
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
            h(
              'span',
              {
                class: {
                  'ivu-tree-title': true,
                  'ivu-tree-title-selected': data.id == this.menuForm.id
                }
              },
              data.title
            )
          ])
        ]
      )
    },
    handleDropdown (name) {
      if (name == 'expandOne') {
        this.expandLevel = 1
        this.getAllList()
      } else if (name == 'expandTwo') {
        this.expandLevel = 2
        this.getAllList()
      } else if (name == 'expandThree') {
        this.expandLevel = 3
        this.getAllList()
      }
      if (name == 'expandAll') {
        this.expandLevel = 4
        this.getAllList()
      } else if (name == 'refresh') {
        this.getAllList()
      }
    },
    getAllList () {
      this.loading = true
      getAllPermissionList().then(res => {
        this.loading = false
        if (res) {
          // 仅展开指定级数 默认后台已展开所有
          let expandLevel = this.expandLevel
          res.forEach(function (e) {
            e.is_overall = e.is_overall ? 1 : 0
            // e.expand = true
            if (expandLevel == 4) {
              if (e.level == 0) {
                e.expand = true
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level == 1) {
                    c.expand = true
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level == 2) {
                        b.expand = true
                      }
                    })
                  }
                })
              }
            } else if (expandLevel == 2) {
              if (e.level == 0) {
                e.expand = true
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level == 1) {
                    c.expand = false
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level == 2) {
                        b.expand = false
                      }
                    })
                  }
                })
              }
            } else if (expandLevel == 3) {
              if (e.level == 0) {
                e.expand = true
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level == 1) {
                    c.expand = true
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level == 2) {
                        b.expand = false
                      }
                    })
                  }
                })
              }
            }
          })
          this.data = res
          this.treeData = res
        }
      })
    },
    search () {
      this.data = JSON.parse(JSON.stringify(this.treeData))
      if (this.searchKey) {
        let self = this
        this.data = this.data.filter(function (item) {
          return self.filterObj(item)
        })
      }
    },
    filterObj (item) {
      let child
      let self = this
      if (item.title.indexOf(self.searchKey) > -1) return true
      if (item.hasOwnProperty('children')) {
        item.children = item.children.filter(function (child) {
          if (!child.hasOwnProperty('children')) {
            return child.title.indexOf(self.searchKey) > -1
          } else if (child.hasOwnProperty('children')) {
            return self.filterObj(child)
          }
        })
        if (item.children.length > 0) {
          return true
        }
      } else {
        return child.title.indexOf(self.searchKey) > -1
      }
    },
    selectTree (v) {
      if (v && v.id != this.menuForm.id) {
        // 转换null为""
        for (let attr in v) {
          if (v[attr] == null) {
            v[attr] = ''
          }
        }
        let str = JSON.stringify(v)
        let menu = JSON.parse(str)

        this.menuForm = menu
        this.menuForm.sort_order = Number(this.menuForm.sort_order)
        this.editTitle = menu.title
      } else {
        this.cancelEdit()
      }
    },
    cancelEdit () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      this.$refs.menuForm.resetFields()
      this.menuForm.id = ''
      delete this.menuForm.id
      this.editTitle = ''
    },
    cancelAdd () {
      this.menuModalVisible = false
    },
    handleReset () {
      let type = this.menuForm.type
      this.$refs.menuForm.resetFields()
      this.menuForm.icon = ''
      this.menuForm.component = ''
      this.menuForm.type = type
    },
    submitEdit () {
      this.$refs.menuForm.validate(valid => {
        if (valid) {
          if (!this.menuForm.id) {
            this.$Message.warning('请先点击选择要修改的菜单节点')
            return
          }
          if (this.menuForm.sort_order == null) {
            this.menuForm.sort_order = ''
          }
          if (this.menuForm.button_type == null) {
            this.menuForm.button_type = ''
          }
          if (this.menuForm.type == 1) {
            this.menuForm.name = this.menuForm.parent_id + '|' + this.menuForm.path + '|' + this.menuForm.http_method
            this.menuForm.icon = ''
            this.menuForm.component = ''
          }
          permissionEdit(this.menuForm.id, this.menuForm).then(res => {
            this.$Message.success('编辑成功')
            initRouter(this)
            this.init()
            this.menuModalVisible = false
          })
        }
      })
    },
    submitAdd () {
      this.$refs.menuFormAdd.validate(valid => {
        if (valid) {
          if (this.menuFormAdd.type == 1) {
            this.menuFormAdd.name = this.menuFormAdd.parent_id + '|' + this.menuFormAdd.path + '|' + this.menuFormAdd.http_method
            this.menuFormAdd.icon = ''
            this.menuFormAdd.component = ''
          }
          permissionCreate(this.menuFormAdd).then(res => {
            this.$Message.success('添加成功')
            initRouter(this)
            this.init()
            this.menuModalVisible = false
          })
        }
      })
    },
    addButton () {
      if (this.menuForm.id == '' || this.menuForm.id == null) {
        this.$Message.warning('请先点击选择一个菜单权限节点')
        return
      }
      this.parentTitle = this.menuForm.title
      this.modalTitle = '添加权限按钮'
      this.showParent = true
      let type = 0
      if (this.menuForm.level == 1) {
        type = 1
      } else if (this.menuForm.level == 2) {
        type = 1
      } else if (this.menuForm.level == 3) {
        this.$Modal.warning({
          title: '抱歉，不能添加啦',
          content: '不能再嵌套权限按钮'
        })
        return
      } else {
        type = 1
      }

      this.menuFormAdd = {
        icon: '',
        type: type,
        parent_id: this.menuForm.id,
        level: 3,
        sort_order: 0,
        button_type: '',
        status: 0
      }
      this.menuModalVisible = true
    },
    addMenu () {
      if (this.menuForm.id == '' || this.menuForm.id == null) {
        this.$Message.warning('请先点击选择一个菜单权限节点')
        return
      }
      this.parentTitle = this.menuForm.title
      this.modalTitle = '添加子节点'
      this.showParent = true
      let type = 0
      if (this.menuForm.level == 1) {
        type = 0
      } else if (this.menuForm.level == 2) {
        type = 1
      } else if (this.menuForm.level == 3) {
        this.$Modal.warning({
          title: '抱歉，不能添加啦',
          content: '仅支持3+1级菜单目录'
        })
        return
      } else {
        type = 0
      }
      // let component = ''
      this.menuFormAdd = {
        icon: '',
        type: type,
        parent_id: this.menuForm.id,
        level: Number(this.menuForm.level) + 1,
        sort_order: 0,
        button_type: '',
        status: 0
      }
      if (this.menuForm.level == 0) {
        this.menuFormAdd.path = '/'
        this.menuFormAdd.component = 'pageView'
      }
      this.menuModalVisible = true
    },
    addRootMenu () {
      this.modalTitle = '添加顶部菜单'
      this.showParent = false
      this.menuFormAdd = {
        type: -1,
        level: 0,
        sort_order: 0,
        status: 0
      }
      // console.log(this.menuFormAdd)
      // if (this.menuForm.level == null) {
      this.menuFormAdd.path = '/'
      this.menuFormAdd.component = 'Main'
      // }
      this.menuModalVisible = true
    },
    changeSelect (v) {
      this.selectCount = v.length
      this.selectList = v
    },
    delAll () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未勾选要删除的数据')
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
          permissionDeletes({ ids: ids }).then(res => {
            this.$Message.success('删除成功')
            initRouter(this)
            this.selectList = []
            this.selectCount = 0
            this.cancelEdit()
            this.init()
          })
        }
      })
    }
  },
  mounted () {
    // 计算高度
    let height = document.documentElement.clientHeight
    this.maxHeight = Number(height - 287) + 'px'
    this.init()
  }
}
</script>
