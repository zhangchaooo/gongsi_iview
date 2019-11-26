<template>
  <div>

    <div class="tree-modal">
      <div @click="ModalOpen"
           style="width:100%;">
        <Input v-model="departmentTitle"
               readonly
               :placeholder="placeholder" /></div>
      <div v-if="multiple"
           style="margin-left:10px;"><Button icon="md-trash"
                @click="clearSelect">清空已选</Button></div>
    </div>
    <div slot="content">
      <Modal :title="placeholder"
             :styles="{top: '200px'}"
             v-model="ModalVisible"
             scrollable
             class-name="tree-modal-bar"
             :mask-closable='false'
             :width="700">
        <Row :gutter="24">
          <Col :span="13"
               class="left-col">
          <Input v-model="searchKey"
                 suffix="ios-search"
                 @on-change="searchDep"
                 :placeholder="searchPlaceholder" />
          <Tree v-if="searchKey"
                :data="searchData"
                :render="renderContent"
                :multiple="multiple"></Tree>
          <Tree v-else
                :data="data"
                :render="renderContent"
                :multiple="multiple"></Tree>
          </Col>
          <Col :span="11">
          <div class="tree-select ivu-tree">
            <!-- <h3>{{listType ? '已选择的成员' : '已选择的部门' }}</h3> -->
            <h3>已{{placeholder}}</h3>
            <ul class="ivu-tree-children">
              <li v-for="(item, index) in dataDep"
                  :key="index">
                <span style="vertical-align: middle;">
                  <span style="display: inline-block;">
                    <i class="ivu-icon"
                       :class="item.mobile ? 'ivu-icon-md-person' : 'ivu-icon-ios-folder'"
                       style="font-size: 16px; margin-right: 8px; margin-bottom: 3px; color: #2d8cf0;"></i>
                    <span class="ivu-tree-title"
                          style="margin-right: 16px;">{{item.name.length > 13 ?item.name.slice(0, 14) + '...' : item.name}}</span></span>
                  <Icon @click="deleteDataDep(index, item.id)"
                        style="cursor: pointer; color: #2d8cf0; font-size: 26px; line-height: 24px;float: right;"
                        type="ios-close" />

                </span>
              </li>
            </ul>

          </div>

          </Col>
        </Row>
        <div slot="footer">
          <Button type="text"
                  @click="cancel">取消</Button>
          <Button type="primary"
                  @click="submit">确认</Button>
        </div>
      </Modal>

      <Spin size="large"
            fix
            v-if="depLoading"></Spin>
    </div>

    <!-- 编辑 -->

  </div>
</template>

<script>
import { getValueArray, beautySub } from '@/libs/tools'
import { tissueList, tissueUserList } from '@/api/global/team'
import { staffList } from '@/api/global/staff'
export default {
  name: 'departmentTreeChoosePlan',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    listType: {
      type: Number,
      default: 0 // 0部门、1部门+员工(只能选人)、2部门+员工(都可以选)
    },
    placeholder: {
      type: String,
      default: '选择部门'
    },
    editDep: {
      type: Array
    }
  },
  data () {
    return {
      searchPlaceholder: this.listType ? (this.listType == 1 ? '请输入成员姓名搜索' : '请输入搜索成员、部门') : '请输入部门名称搜索',
      ModalVisible: false,
      depLoading: false,
      departmentTitle: '',
      searchKey: '',
      data: [],
      staffData: [],
      tissueData: [],
      dataDep: [],
      searchData: []

    }
  },
  methods: {
    deleteDataDep (index, id) {
      this.dataDep.splice(index, 1)
    },
    ModalOpen () {
      if (!this.data.length) {
        this.listType ? this.initDepartmentUserData() : this.initDepartmentData()
      }
      if (this.editDep) {
        this.dataDep = this.editDep
      }
      this.searchKey = ''
      this.searchData = []
      this.ModalVisible = true
    },
    cancel () {
      // 取消的时候把搜素清空
      this.searchKey = ''
      this.searchData = []
      this.ModalVisible = false
    },
    submit () {
      if (!this.dataDep.length) {
        this.$Message.warning('暂未选择')
        return false
      }
      this.departmentTitle = getValueArray(this.dataDep, 'name').join(',')
      this.$emit('on-change', getValueArray(this.dataDep, 'id'))
      this.searchKey = ''
      this.searchData = []
      this.ModalVisible = false
    },
    // 递归多维转一维
    manyToOne (arr) {
      for (let p of arr) {
        if (p.children && p.children.length > 0) {
          this.manyToOne(p.children)
          delete p.children
          this.searchData.push(p)
        } else {
          this.searchData.push(p)
        }
      }
      return this.searchData
    },
    // 递归判断父节点
    // permData: 全部、rolePerms：选中
    checkParentTree (permData, pid) {
      let that = this
      permData.forEach(function (p) {
        if (p.id === pid) { // 2级的话 直接查到 然后跳出
          p.expand = true
          if (p.parent_id > 0) {
            that.checkParentTree(that.data, p.parent_id)
          } else {
            return
          }
        } else {
          // p.expand = false
        }
        if (p.children && p.children.length > 0) {
          that.checkParentTree(p.children, pid)
        }
      })
    },
    // 递归判断子节点
    // permData: 全部、rolePerms：选中
    checkPermTree (permData, rolePerms, selected = 1) {
      if (!rolePerms.length) return false
      let that = this
      permData.forEach(function (p) {
        if (that.hasPerm(p, rolePerms)) {
          selected ? p.selected = true : p.selected = false
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms, selected)
        }
      })
    },
    // 判断拥有的权限节点勾选
    hasPerm (p, rolePerms) {
      let flag = false
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id === rolePerms[i].id) {
          flag = true
          break
        }
      }
      if (flag) {
        if (this.listType) {
          if (p.staff_type) return true
        } else {
          return true
        }
      }
      return false
    },
    searchDep () {
      if (this.searchKey) {
        this.searchData = this.searchData.filter(item => { return item.name.indexOf(this.searchKey) > -1 })
      } else {
        // 是否优化下
        console.log('nosearch')
        this.clearSearchDep()
      }
    },
    clearSearchDep () {
      this.searchData = []
      this.searchKey = ''
      this.listType == 0 && this.manyToOne(JSON.parse(JSON.stringify(this.data)))
      if (this.listType !== 0) this.searchData = JSON.parse(JSON.stringify(this.staffData))
      this.listType == 2 && this.manyToOne(JSON.parse(JSON.stringify(this.tissueData)))
    },
    initDepartmentUserData () {
      tissueUserList().then(res => {
        if (res) {
          res.forEach(function (e) {
            // if (e.isParent) {
            //   e.loading = false
            //   e.children = []
            // }
            // 参考企业微信，有可能只有一个根目录，所以默认展开一层
            if (e.level == 0) {
              e.expand = true
            }
          })
          // this.iteration(res)
          this.data = res
          // this.manyToOne(JSON.parse(JSON.stringify(this.data)))
          // 调员工用于搜索用
          this.listType == 1 && staffList().then(r => {
            if (r) {
              this.searchData = r
            }
          })
          this.listType == 2 && tissueList().then(res => {
            this.tissueData = res
            staffList().then(r => {
              if (r) {
                this.staffData = r
                this.searchData = JSON.parse(JSON.stringify(this.staffData))
                this.manyToOne(JSON.parse(JSON.stringify(this.tissueData)))
              }
            })
          })
          // this.dataDep.length && this.checkPermTree(this.data, this.dataDep)
        }
      })
    },
    initDepartmentData () {
      tissueList().then(res => {
        if (res) {
          res.forEach(function (e) {
            // if (e.isParent) {
            //   e.loading = false
            //   e.children = []
            // }
            // 参考企业微信，有可能只有一个根目录，所以默认展开一层
            if (e.level == 0) {
              e.expand = true
            }
          })
          // this.iteration(res)
          this.data = res
          this.manyToOne(JSON.parse(JSON.stringify(this.data)))
          // this.dataDep.length && this.checkPermTree(this.data, this.dataDep)
        }
      })
    },
    renderContent (h, { root, node, data }) {
      /* h createlement
      * root 所有节点组成的数组?
      * node 当前节点
      * data 当前节点的数据
      */
      return h(
        'span',
        { // 所有title部分的内容,包括自己添加的icon。title 和 icon 父元素的容器
          style: {
            cursor: 'pointer',
            verticalAlign: 'middle'
            // backgroundColor: 'red'

          },
          on: {
            click: () => {
              this.searchKey ? this.selectSearchTree(data) : this.selectTree(data)
            }
          }
        },
        [
          h('span', {// 自定义的icon 和 title 所在的直接父元素
            style: {
              // backgroundColor: 'green',
              display: 'inline-block'
            }
          }, [
              h('Icon', {// icon
                props: {
                  type: data.parent_id > -1 ? 'ios-folder' : 'md-person',
                  size: '16'
                },
                style: {
                  'margin-right': '8px',
                  'margin-bottom': '3px',
                  'color': '#2d8cf0'
                }
              }),
              h(
                'span', // 文本
                {
                  class: {
                    'ivu-tree-title': true
                    // 'ivu-tree-title-selected': data.id == this.menuForm.id
                  },
                  style: {
                    marginRight: '16px'
                    // backgroundColor: 'aqua'
                  }
                },
                beautySub(data.name, 10)
              )
            ]),
          h(
            'a', // 右侧操作图标
            {
              style: {
                display: getValueArray(this.dataDep, 'key').includes(data.id + data.name + data.phone_number) ? 'inline-block' : 'none',
                float: 'right',
                textAlign: 'center',
                marginRight: '3px'
              }
            },
            [
              h('Icon', {
                props: {
                  type: 'md-checkmark'
                },
                style: {
                  color: '#2d8cf0',
                  fontSize: '20px',
                  lineHeight: '16px'
                }
              })
            ]
          )
        ]
      )
    },
    selectSearchTree (v) {
      if (getValueArray(this.dataDep, 'key').includes(v.id + v.name + v.phone_number)) {
        this.multiple
          ? this.dataDep.splice(this.dataDep.findIndex(item => item.key === v.id + v.name + v.phone_number), 1)
          : this.dataDep = []
      } else {
        // 选中这个节点，让他的父级展开
        v.parent_id > 0 && this.checkParentTree(this.data, v.parent_id)
        // 员工部门节点展开 多个部门遍历
        if (v.tissue) {
          v.tissue.map(row => this.checkParentTree(this.data, row.id))
        }
        this.multiple
          ? this.dataDep.push({ 'id': v.id, 'name': v.name, 'mobile': v.phone_number, 'key': v.id + v.name + v.phone_number })
          : this.dataDep = [{ 'id': v.id, 'name': v.name, 'mobile': v.phone_number, 'key': v.id + v.name + v.phone_number }]
      }
      // 模仿企业微信，拿完数据就把搜索的树清空
      this.clearSearchDep()
    },
    selectTree (v) {
      if (this.listType === 1) {
        this.$Message.warning('请选择员工')
        return false
      }
      if (getValueArray(this.dataDep, 'key').includes(v.id + v.name + v.phone_number)) {
        this.multiple
          ? this.dataDep.splice(this.dataDep.findIndex(item => item.key === v.id + v.name + v.phone_number), 1)
          : this.dataDep = []
      } else {
        this.multiple
          ? this.dataDep.push({ 'id': v.id, 'name': v.name, 'mobile': v.phone_number, 'key': v.id + v.name + v.phone_number })
          : this.dataDep = [{ 'id': v.id, 'name': v.name, 'mobile': v.phone_number, 'key': v.id + v.name + v.phone_number }]
      }
    },
    clearSelect () {
      this.dataDep = []
      this.searchData = []
      this.searchKey = ''
      this.departmentTitle = ''
      this.initDepartmentData()
      this.$emit('on-change', getValueArray(this.dataDep, 'id'))
    },
    setData (title) {
      this.departmentTitle = title
    },
    // 递归节点
    iteration (data) {
      for (var j = 0; j < data.length; j++) {
        data[j].selected = false
        if (data[j].children != undefined && data[j].children.length > 0) {
          this.iteration(data[j].children)
        }
      }
    }
  },
  created () {
    // this.initDepartmentData()
    // if (this.editDep) {
    //   this.dataDep = this.editDep
    // }
  }

}
</script>

<style lang="less">
.tree-modal {
  display: flex;
}
.tree-modal-bar {
  .ivu-tree {
    max-height: 500px;
    overflow: auto;
    margin-top: 5px;
  }

  .ivu-tree::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .ivu-tree::-webkit-scrollbar-thumb {
    border-radius: 4px;
    // -webkit-box-shadow: inset 0 0 2px #d1d1d1;
    background: #e4e4e4;
  }
  .ivu-col {
    margin-bottom: 0px;
  }
  .left-col {
    border-right: 1px solid #eee;
  }
}
</style>
