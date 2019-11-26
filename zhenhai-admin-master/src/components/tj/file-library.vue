<style lang="less">
@import "./file-library.less";
</style>
<template>
  <div>
    <div class="img-pick">
      <!-- <div style="display: flex;position: absolute;top: 60%;left: 50%;transform: translate(-50%, -50%);justify-content: center; align-items: center;"
           v-show="!materialList">
        <Icon type="ios-folder-open-outline"
              size="24" />
        <div style="padding-left:10px;">
          暂无数据
        </div>
      </div> -->
      <ul class="ul-list"
          v-show="materialList">
        <li class="img-item"
            v-for="(item, index) in materialList"
            :key="index"
            :class="{selected: item.select}"
            @click="choose(index, {id: item.id, url: item.url, type: item.type})">
          <label class="item-label">
            <div class="pic-box">
              <img v-if="item.type==1"
                   class="pic"
                   :src="item.url"
                   style="width: 110px;">
              <video v-else
                     class="pic"
                     :src="item.url"
                     style="width: 110px;"></video>
            </div>
            <!-- <span class="title">{{item.name}}</span> -->
            <div class="selected-mask">
              <div class="selected-mask-inner"></div>
              <div class="selected-mask-icon"></div>
            </div>
          </label>
        </li>
      </ul>
    </div>
    <div class="drawer-footer">
      <Button @click="confirmFiles">确认选择</Button>
    </div>
  </div>
</template>
<script>
// import { getList, getHistoryList } from '@/api/vote/user'
export default {
  props: {
    materialList: {
      type: Array,
      required: false
    }
  },
  data () {
    return {
      // 选中ID
      selectedId: -1,
      // 选择后的素材内容
      // materialContent: '',
      materialContents: [],
      // 素材列表数据
      materialList1: null,
      // 总共数据多少条
      total: 0,
      // 每页多少条数据
      pageSize: 10,
      // 当前页码
      pageNumber: 1,
      // 搜索表单
      formSearch: {},
      listQuery: {
        page: 1,
        limit: 10,
        search: {},
        sort: {}
      },
      activeName: 'first'
    }
  },
  watch: {
    'materialList' () {
      this.materialContents = []
      // 如果翻页切换数据想保留选中状态就不要清空选中数组，但是每次切换数据都要和选中数组组合选中状态，这样就改变父组件状态了
    }
  },
  methods: {
    confirmFiles () {
      if (this.materialContents.length <= 0) {
        this.$Message.error('至少选择一个哦')
        return false
      }
      this.$emit('on-change', this.materialContents)
      this.materialContents = []
    },
    // 获取素材数据
    fetchData () {
      for (var i = 0; i < this.materialList.length; i++) {
        this.materialList[i].select = false
      }
    },
    // 选择勾选图片
    choose (index, data) {
      if (!data.url) return false
      this.materialList[index].select = !this.materialList[index].select
      // this.materialContent = data
      if (this.materialList[index].select) {
        this.materialContents.push(data)
      } else {
        for (var i = 0; i < this.materialContents.length; i++) {
          if (this.materialContents[i].id === data.id) {
            this.materialContents.splice(i, 1)
          }
        }
      }
      // console.log(this.materialContents)
    }
    // 确定选择素材
    // onConfirm () {
    //   if (this.materialContents.length <= 0) {
    //     this.$message.warning('至少选择一个素材哦')
    //     return false
    //   }
    //   this.$emit('onConfirm', this.materialContents)
    // }
  },
  mounted () {
    // this.fetchData()
  }
}
</script>
<style scoped>
.drawer-footer {
  z-index: 10;
  width: 517px;
  position: fixed;
  bottom: 0;
  right: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
</style>
