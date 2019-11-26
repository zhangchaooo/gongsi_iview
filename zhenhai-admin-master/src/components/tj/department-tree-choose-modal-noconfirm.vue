<template>
  <div>

    <div class="tree-modal">
      <div @click="ModalOpen"
           style="width:100%;margin-right:10px;">
        <Input v-model="departmentTitle"
               readonly
               :placeholder="placeholder" /></div>
      <div><Button icon="md-trash"
                @click="clearSelect">清空已选</Button></div>
    </div>
    <div slot="content">
      <Modal :styles="{top: '200px'}"
             :title="placeholder"
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
                 placeholder="输入部门名搜索" />
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
            <h3>已选择的部门</h3>
            <ul class="ivu-tree-children">
              <li v-for="(item, index) in dataDep"
                  :key="`select-tree-${item.id}`">
                <span style="vertical-align: middle;">
                  <span style="display: inline-block;">
                    <i class="ivu-icon ivu-icon-ios-folder"
                       style="font-size: 16px; margin-right: 8px; margin-bottom: 3px; color: #2d8cf0;"></i>
                    <span class="ivu-tree-title"
                          style="margin-right: 16px;">{{item.name}}</span></span>
                  <Icon @click="deleteDataDep(index)"
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
import { tissueList } from '@/api/global/team'
export default {
  name: 'departmentTreeChoose',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '点击选择部门'
    }
  },
  data () {
    return {
      ModalVisible: false,
      depLoading: false,
      departmentTitle: '',
      departmentTitleArray: [],
      searchKey: '',
      dataDep: [],
      data: [],
      selectDep: [],
      department: [],
      searchData: [],
      departmentId: [65]

    }
  },
  methods: {
    deleteDataDep (index) { },
    ModalOpen () {
      this.ModalVisible = true
    },
    cancel () {
      this.ModalVisible = false
    },
    submit () { },
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
        return true
      }
      return false
    },
    // clearDep () {
    //   this.checkPermTree(this.dataDep, this.data)
    //   this.data = JSON.parse(JSON.stringify(this.dataDep))
    // },
    searchDep () {
      if (this.searchKey) {
        this.searchData = this.searchData.filter(item => { return item.name.indexOf(this.searchKey) > -1 })
        // console.log(this.searchData)
      } else {
        // 是否优化下
        console.log('nosearch')
        this.searchData = []
        this.manyToOne(JSON.parse(JSON.stringify(this.data)))
      }
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
          this.iteration(res)
          this.data = res
          this.manyToOne(JSON.parse(JSON.stringify(this.data)))
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
                type: 'ios-folder',
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
              data.name
            )
          ]),
          h(
            'a', // 右侧操作图标
            {
              style: {
                display: data.selected ? 'inline-block' : 'none',
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
      // 选中的去遍历下
      // this.checkPermTree(this.data, this.searchData)

      v.selected = !v.selected
      if (v.selected) {
        // 选中这个节点，让他的父级展开
        v.parent_id > 0 && this.checkParentTree(this.data, v.parent_id)
        // 选中这个节点，得让他的data树部分选中
        this.checkPermTree(this.data, [v])
        this.departmentId.push(v.id)
        this.departmentTitleArray.push(v.name)
        this.departmentTitle = this.departmentTitleArray.join(',')
      } else {
        // 选中这个节点，得让他的data树部分选中
        this.checkPermTree(this.data, [v], 0)
        this.departmentId.splice(this.departmentId.findIndex(item => item === v.id), 1)
        this.departmentTitleArray.splice(this.departmentTitleArray.findIndex(item => item === v.name), 1)
        this.departmentTitle = this.departmentTitleArray.join(',')
      }
      this.$emit('on-change', this.departmentId)

      // 模仿企业微信，拿完数据就把搜索的树清空
      this.searchData = []
      this.searchKey = ''

      this.manyToOne(JSON.parse(JSON.stringify(this.data)))
    },
    selectTree (v) {
      // this.selectDep.push(v)
      // console.log(v)
      v.selected = !v.selected
      if (v.selected) {
        this.dataDep.push({ 'id': v.id, 'name': v.name })
        this.departmentId.push(v.id)
        this.departmentTitleArray.push(v.name)
        this.departmentTitle = this.departmentTitleArray.join(',')
      } else {
        this.departmentId.splice(this.departmentId.findIndex(item => item === v.id), 1)
        this.departmentTitleArray.splice(this.departmentTitleArray.findIndex(item => item === v.name), 1)
        this.departmentTitle = this.departmentTitleArray.join(',')
      }
      this.$emit('on-change', this.departmentId)
      // 选中后重新生成一维搜索树
      this.searchData = []
      this.manyToOne(JSON.parse(JSON.stringify(this.data)))
    },
    clearSelect () {
      this.initDepartmentData()
      this.departmentTitle = ''
      this.departmentId = []
      this.departmentTitleArray = []
      this.searchData = []
      this.searchKey = ''

      this.$emit('on-change', this.departmentId)
    },
    setData (ids, title) {
      this.departmentId = ids
      this.departmentTitle = title
      this.$emit('on-change', this.departmentId)
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
    this.initDepartmentData()
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
