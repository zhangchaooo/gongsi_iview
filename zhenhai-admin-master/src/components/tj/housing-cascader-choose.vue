<template>
  <div>
    <Cascader clearable
              :load-data="loadData"
              placeholder="请选择所属房屋"
              @on-change="handleChangeHousing"
              :data="housingTree"
              v-model="selectHousing"></Cascader>
  </div>
</template>
<script>
import {
  getBuilding, doorHouseTreeView
} from '@/api/community/housing'
export default {
  name: 'housingChoose',
  props: {
    housing_id: Number
  },
  model: {
    prop: 'housing_id',
    event: 'returnBack'
  },
  data () {
    return {
      selectHousing: [],
      housingTree: []
    }
  },
  methods: {
    loadData (item, callback) {
      item.loading = true
      if (item.children && item.children.length > 0) return false
      doorHouseTreeView(item.id).then(res => {
        this.iteration(res)
        item.children = res
        if (item.children.length == 0) this.$Message.warning('暂无数据')
        item.loading = false
        callback()
      })
    },
    iteration (data) {
      for (var j = 0; j < data.length; j++) {
        data[j].label = data[j].alias
        data[j].value = data[j].id
        data[j].loading = false
        if (data[j].children != undefined && data[j].children.length > 0) {
          this.iteration(data[j].children)
        } else if (data[j].parent_id) {
          data[j].children = []
        } else if (!data[j].parent_id) {
          delete data[j].children
          delete data[j].loading
        }
      }
    },
    handleChangeHousing (value, selectedData) {
      let id = ''
      // 获取最后一个值
      if (value && value.length > 0) {
        id = value[value.length - 1]
      }
      this.selectHousing = selectedData
      this.$emit('on-change', id)
      this.$emit('returnBack', id)
    },
    initData () {
      // 采用异步加载，先获取楼——单元——后2层
      getBuilding().then(res => {
        this.housingTree = res.map(i => {
          return { ...i, value: i.id, label: i.alias, loading: false, children: [] }
        })
      })
    },
    clearSelect () {
      this.selectHousing = []
    }
  },
  created () {
    // 如果有业务需要多次渲染该组件的父form组件，那考虑把验证放到该组件内
    // 或者判断下房源架构加载过就不重新初始化了
    // console.log(2)
    this.initData()
  }
}
</script>

<style lang="less">
</style>
