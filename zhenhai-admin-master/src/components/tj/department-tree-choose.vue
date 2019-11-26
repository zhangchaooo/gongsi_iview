<template>
  <div>
    <Poptip trigger="click"
            placement="right"
            title="选择部门"
            width="350">
      <div style="display:flex;">
        <Input v-model="departmentTitle"
               readonly
               style="margin-right:10px;"
               :placeholder="placeholder" />
        <Button icon="md-trash"
                @click="clearSelect">清空已选</Button>
      </div>
      <div slot="content"
           class="tree-bar">
        <Input v-model="searchKey"
               suffix="ios-search"
               @on-change="searchDep"
               placeholder="输入部门名搜索" />
        <Tree v-if="searchData.length"
              :data="searchData"
              @on-select-change="selectSearchTree"
              :multiple="multiple"></Tree>
        <Tree v-else
              :data="data"
              @on-select-change="selectTree"
              :multiple="multiple"></Tree>

        <Spin size="large"
              fix
              v-if="depLoading"></Spin>
      </div>
    </Poptip>
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
      depLoading: false,
      departmentTitle: '',
      searchKey: '',
      dataDep: [],
      data: [],
      selectDep: [],
      department: [],
      searchData: []

    }
  },
  methods: {
    // 递归判断子节点
    // permData: 全部、rolePerms：选中
    checkPermTree (permData, rolePerms) {
      let that = this
      permData.forEach(function (p) {
        if (that.hasPerm(p, rolePerms) && p.status != -1) {
          p.selected = true
        } else {
          p.selected = false
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms)
        }
      })
    },
    // 判断拥有的权限节点勾选
    hasPerm (p, rolePerms) {
      let flag = false
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id === rolePerms[i].id && rolePerms[i].selected) {
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
      // this.dataDep = this.data
      this.searchData = JSON.parse(JSON.stringify(this.data))

      if (this.searchKey) {
        // this.depLoading = true
        let self = this
        this.searchData = this.searchData.filter(function (item) {
          return self.filterObj(item)
        })
      }
    },
    filterObj (item) {
      // console.log(item)
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
    initDepartmentData () {
      tissueList().then(res => {
        if (res) {
          // res.forEach(function (e) {
          //   if (e.isParent) {
          //     e.loading = false
          //     e.children = []
          //   }
          //   if (e.status == -1) {
          //     e.title = '[已禁用] ' + e.title
          //     e.disabled = true
          //   }
          // })
          this.iteration(res)
          this.dataDep = res
          this.data = res
        }
      })
    },
    loadData (item, callback) {
      // loadDepartment(item.id).then(res => {
      //   if (res) {
      //     res.forEach(function (e) {
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
    searchDep2 () {
      // 搜索部门
      if (this.searchKey) {
        this.depLoading = true
        // searchDepartment({ title: this.searchKey }).then(res => {
        //   this.depLoading = false
        //   if (res) {
        //     res.forEach(function (e) {
        //       if (e.status == -1) {
        //         e.title = '[已禁用] ' + e.title
        //         e.disabled = true
        //       }
        //     })
        //     this.dataDep = res.result
        //   }
        // })
      } else {
        this.initDepartmentData()
      }
    },
    selectSearchTree (v) {
      // 选中的去遍历下
      this.checkPermTree(this.data, this.searchData)

      // 选中这个节点，让他的父级展开

      let ids = []
      let title = ''
      v.forEach(e => {
        ids.push(e.id)
        if (title == '') {
          title = e.title
        } else {
          title = title + '、' + e.title
        }
      })
      this.departmentId = ids
      this.departmentTitle = title
      this.$emit('on-change', this.departmentId)

      // 模仿企业微信，拿完数据就把搜索的树清空
      this.searchData = []
      this.searchKey = ''
    },
    selectTree (v) {
      // this.selectDep.push(v)
      // console.log(v)
      let ids = []
      let title = ''
      v.forEach(e => {
        ids.push(e.id)
        if (title == '') {
          title = e.title
        } else {
          title = title + '、' + e.title
        }
      })
      this.departmentId = ids
      this.departmentTitle = title
      this.$emit('on-change', this.departmentId)
    },
    clearSelect () {
      this.departmentId = []
      this.departmentTitle = ''
      this.initDepartmentData()
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
        data[j].title = data[j].name
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
.tree-bar {
  max-height: 500px;
  overflow: auto;
  margin-top: 5px;
}

.tree-bar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tree-bar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  // -webkit-box-shadow: inset 0 0 2px #d1d1d1;
  background: #e4e4e4;
}

.ivu-tree .ivu-tree-empty {
  margin-top: 10px;
  font-size: 12px;
}
</style>
