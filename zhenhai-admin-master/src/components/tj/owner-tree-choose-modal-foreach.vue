<template>
  <div>

    <!-- <div class="tree-modal">
      <div @click="ModalOpen"
           style="width:100%;">
        <Input v-model="departmentTitle"
               readonly
               :placeholder="placeholder" /></div>
      <div v-if="multiple"
           style="margin-left:10px;"><Button icon="md-trash"
                @click="clearSelect">清空已选</Button></div>
    </div> -->
    <!-- <div slot="content"> -->
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
        <!-- <Input v-model="searchKey"
               suffix="ios-search"
               @on-change="searchDep"
               :placeholder="searchPlaceholder" />
        <Tree v-if="searchKey"
              :data="searchData"
              :render="renderContent"
              :multiple="multiple"></Tree> -->
        <Tree :data="housingTree"
              :load-data="loadData"
              :render="renderContent"></Tree>
        </Col>
        <Col :span="11">
        <div class="tree-select ivu-tree">
          <h3>{{selectPlaceholder}}</h3>
          <ul class="ivu-tree-children">
            <li v-for="(item, index) in dataHusing"
                :key="index">
              <span style="vertical-align: middle;">
                <span style="display: inline-block;">
                  <i class="ivu-icon"
                     :class="item.parent_id > -1 ? 'ivu-icon-ios-folder' : 'ivu-icon-md-person'"
                     style="font-size: 16px; margin-right: 8px; margin-bottom: 3px; color: #2d8cf0;"></i>
                  <span class="ivu-tree-title"
                        style="margin-right: 16px;">{{item.alias}}</span></span>
                <Icon @click="deletedataHusing(index, item.id)"
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
    <!--
      <Spin size="large"
            fix
            v-if="depLoading"></Spin>
    </div> -->

    <!-- 编辑 -->

  </div>
</template>

<script>
import { getValueArray, beautySub } from '@/libs/tools'
import { getBuilding, doorHouseTree, doorHouseTreeView } from '@/api/community/housing'
import {
  ownersList
} from '@/api/community/owners'
import { staffList } from '@/api/global/staff'
export default {
  name: 'ownerTreeChoose',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    listType: {
      type: Number,
      default: 1 // 1、选择单元 2、选择楼层 3、选择房号 4、房源架构+业主(选业主)
    },
    placeholder: {
      type: String,
      default: '点击选择单元'
    },
    selectPlaceholder: {
      type: String,
      default: '已选择单元'
    },
    searchPlaceholder: {
      type: String,
      default: '搜索单元'
    },
    editDep: {
      type: Array
    },
    communityId: {
      type: Number,
      default: 1
    },
    housingId: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      ModalVisible: false,
      depLoading: false,
      departmentTitle: '',
      searchKey: '',
      housingTree: [],
      dataHusing: [],
      searchData: []

    }
  },
  methods: {
    deletedataHusing (index, id) {
      this.dataHusing.splice(index, 1)
      // 取消选中
      this.checkPermTree(this.data, [{ id: id }], 0)
    },
    ModalOpen () {
      this.listType > 3 ? this.initHousingUserData() : this.initData()
      if (this.editDep) {
        this.dataHusing = this.editDep
      }
      this.searchKey = ''
      this.searchData = []
      this.ModalVisible = true
    },
    cancel () {
      // 取消的时候把搜素清空
      this.searchKey = ''
      this.searchData = []
      // 选择单元和楼层的时候，暂时不涉及编辑选完就清空
      if (this.listType < 5) this.dataHusing = []
      this.ModalVisible = false
    },
    submit () {
      if (!this.dataHusing.length) {
        this.$Message.warning('暂未选择')
        return false
      }
      this.$emit('on-change', this.dataHusing)
      // 选择单元和楼层的时候，暂时不涉及编辑选完就清空
      if (this.listType < 5) this.dataHusing = []
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
        if (this.listType > 3) {
          if (p.staff_type) return true
        } else {
          return true
        }
      }
      return false
    },
    // clearDep () {
    //   this.checkPermTree(this.dataHusing, this.data)
    //   this.data = JSON.parse(JSON.stringify(this.dataHusing))
    // },
    searchDep () {
      if (this.searchKey) {
        console.log(this.searchData)
        // this.listType
        //   ? this.searchData = this.searchData.filter(item => { return item.name.indexOf(this.searchKey) > -1 && item.staff_type == 1 })
        //   : this.searchData = this.searchData.filter(item => { return item.name.indexOf(this.searchKey) > -1 })
        // console.log(this.searchData)
        this.searchData = this.searchData.filter(item => { return item.name.indexOf(this.searchKey) > -1 })
      } else {
        // 是否优化下
        console.log('nosearch')
        this.searchData = []
        this.manyToOne(JSON.parse(JSON.stringify(this.data)))
      }
    },
    loadData (item, callback) {
      console.log(item)

      // this.$set(item, 'loading', true)
      if (item.level < 4) {
        doorHouseTreeView(item.id).then(res => {
          this.iterationLoad(res)
          callback(res)
        })
      }
    },
    initHousingUserData () {
      // 采用异步加载，先获取楼——单元——后2层
      getBuilding().then(res => {
        this.housingTree = res.map(i => {
          return { ...i, level: 1, loading: false, children: [] }
        })
      })
    },
    initData () {
      doorHouseTreeView(this.housingId).then(res => {
        if (res) {
          if (this.listType == 3) {
            res.forEach(function (e) {
              // if (e.level == 0) {
              e.expand = true
              // }
            })
          }

          this.iteration(res)
          this.data = res
          // this.manyToOne(JSON.parse(JSON.stringify(this.data)))
          this.dataHusing.length && this.checkPermTree(this.data, this.dataHusing)
        }
      })
    },
    renderContent (h, { root, node, data }) {
      let icon = ''
      if (data.level == 1) {
        icon = 'ios-podium'
      } else if (data.level == 2) {
        icon = 'ios-apps'
      } else if (data.level == 3) {
        icon = 'md-list'
      } else if (data.level == 4) {
        icon = 'md-home'
      } else {
        icon = 'md-person'
      }
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
              this.listType == 4 ? this.selectOwnerTree(data) : this.selectTree(data)
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
                type: icon,
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
              data.level ? data.alias : data.name
            )
          ]),
          h(
            'a', // 右侧操作图标
            {
              style: {
                display: getValueArray(this.dataHusing, 'owner_id').includes(data.id) && data.mobile ? 'inline-block' : 'none',
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
      // if (this.listType && !v.tissue) {
      //   this.$Message.warning('请选择员工')
      //   return false
      // }

      v.selected = !v.selected
      if (!this.multiple) this.checkPermTree(this.data, this.dataHusing, 0)
      if (v.selected) {
        // 选中这个节点，让他的父级展开
        v.parent_id > 0 && this.checkParentTree(this.data, v.parent_id)
        // 员工部门节点展开 多个部门遍历
        if (v.tissue) {
          v.tissue.map(row => this.checkParentTree(this.data, row.id))
        }

        // 选中这个节点，得让他的data树部分选中
        this.checkPermTree(this.data, [v])
        this.multiple ? this.dataHusing.push({ 'id': v.id, 'name': v.name, 'mobile': v.phone_number }) : this.dataHusing = [{ 'id': v.id, 'name': v.name, 'mobile': v.phone_number }]
      } else {
        // 取消这个节点选中
        this.checkPermTree(this.data, [v], 0)
        this.multiple ? this.dataHusing.splice(this.dataHusing.findIndex(item => item.id === v.id), 1) : this.dataHusing = []
      }

      // 模仿企业微信，拿完数据就把搜索的树清空
      this.searchData = []
      this.searchKey = ''

      this.manyToOne(JSON.parse(JSON.stringify(this.data)))
    },
    selectOwnerTree (v) {
      // 通过level来判断选择的什么
      if (this.listType > 3 && v.level) {
        this.$Message.warning('请选择业主')
        return false
      }
      if (getValueArray(this.dataHusing, 'owner_id').includes(v.id)) {
        this.multiple ? this.dataHusing.splice(this.dataHusing.findIndex(item => item.owner_id === v.id), 1) : this.dataHusing = []
      } else {
        this.multiple ? this.dataHusing.push({ 'owner_id': v.id, 'alias': v.name }) : this.dataHusing = [{ 'owner_id': v.id, 'alias': v.name }]
      }
    },
    selectTree (v) {
      v.selected = !v.selected
      // 如果是选择员工，需要把同id的员工都选择上
      // if (this.listType) this.checkPermTree(this.data, [v])
      // 单选把其它的反选
      if (!this.multiple) this.checkPermTree(this.data, this.dataHusing, 0)
      if (v.selected) {
        this.multiple ? this.dataHusing.push({ 'id': v.id, 'alias': v.alias ? v.alias : v.name }) : this.dataHusing = [{ 'id': v.id, 'alias': v.alias ? v.alias : v.name }]
      } else {
        this.multiple ? this.dataHusing.splice(this.dataHusing.findIndex(item => item.id === v.id), 1) : this.dataHusing = []
      }
      // 选中后重新生成一维搜索树
      // this.searchData = []
      // this.manyToOne(JSON.parse(JSON.stringify(this.data)))
    },
    clearSelect () {
      this.dataHusing = []
      this.searchData = []
      this.searchKey = ''
      // this.departmentTitle = ''
      // this.initDepartmentData()
      // this.$emit('on-change', getValueArray(this.dataHusing, 'id'))
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
    },
    iterationLoad (data) {
      for (var j = 0; j < data.length; j++) {
        if (data[j].level < 4) data[j].loading = false
        if (data[j].children != undefined && data[j].children.length > 0) {
          this.iterationLoad(data[j].children)
        } else if (data[j].parent_id) {
          data[j].children = []
        } else if (!data[j].parent_id) {
          let tjdata = data[j]
          ownersList({ filter: { housing_id: data[j].id } }).then(res => {
            if (res.length > 0) {
              tjdata.children = res
            } else {
              // tjdata.disabled = true
              tjdata.expand = true
              delete tjdata.loading
              delete tjdata.children
            }
          })
        }
      }
    }
  },
  created () {
    // console.log('房屋选择组件出现')
    // this.initDepartmentData()
    // if (this.editDep) {
    //   this.dataHusing = this.editDep
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
