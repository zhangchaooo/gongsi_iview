<template>
  <div class="upload-container">
    <Button icon="md-cloud-upload"
            :style="{background:color,borderColor:color,height:height}"
            @click="uploadVisible=true"
            type="primary">上传文件
    </Button>
    <Drawer :styles="{paddingTop: '0px'}"
            v-model="uploadVisible"
            width="517">
      <Menu mode="horizontal"
            @on-select="changeMenu"
            :active-name="type ==2 ? '2' : '1'">
        <MenuItem v-if="type==1 || type==0"
                  name='1'>
        图片
        </MenuItem>
        <MenuItem v-if="type==2 || type==0"
                  name='2'>
        视频
        </MenuItem>
      </Menu>
      <br>
      <Upload :action="uploadFile"
              :headers="accessToken"
              :on-success="handleSuccess"
              :on-error="handleError"
              :max-size="5120"
              :on-exceeded-size="handleMaxSize"
              :before-upload="beforeUpload"
              :on-format-error="handleFormatError"
              :format="['jpg','jpeg','png','gif','mp4','avi','wma','rmvb']"
              :data=uploadData
              :show-upload-list="false"
              multiple
              paste
              name='media'
              type="drag"
              ref="up">
        <div style="margin: 20px 0">
          <Icon type="ios-cloud-upload"
                size="52"
                style="color: #3399ff"></Icon>
          <p>点击这里或将文件拖拽到这里上传</p>
        </div>
      </Upload>
      <br />
      <Row>
        <fileLibrary @on-change="changeMedia($event)"
                     :materialList="materialList"></fileLibrary>
      </Row>
      <Row type="flex"
           justify="end"
           class="page">
        <Page :current="pageNumber"
              :total="total"
              :page-size="pageSize"
              @on-change="changePage"
              @on-page-size-change="changePageSize"
              :page-size-opts="[16,32,64]"
              size="small"
              show-total
              show-elevator
              show-sizer></Page>
      </Row>
      <div style="height:32px;"></div>
    </Drawer>
  </div>
</template>

<script>
import { mediaList } from '@/api/media'
import fileLibrary from '@/components/tj/file-library'
import { uploadFile } from '@/libs/request'
import { getToken } from '@/libs/util'
export default {
  name: 'editorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    },
    height: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 0
    }
  },
  components: { fileLibrary },
  data () {
    return {
      uploadData: { is_show: 1 },
      uploadFile: uploadFile,
      uploadVisible: false,
      accessToken: { Authorization: getToken() || (this.$Message.error('请重新登录'), this.$router.push('/login')) },
      listObj: {},
      searchForm: { // 搜索框初始化对象
        page: 1, // 当前页数
        limit: 16, // 页面大小
        // sort: '-file_size',
        filter: {
          type: 1,
          is_show: 1
        }
        // sort: "createTime", // 默认排序字段
        // order: "desc", // 默认排序方式
      },
      pageNumber: 1, // 当前页数
      pageSize: 16, // 页面大小
      total: 0, // 表单数据总数
      materialList: [],
      media: []
    }
  },
  mounted () {
    this.searchForm.filter.type = this.type == '0' ? 1 : this.type
    this.getDataList()
  },
  methods: {
    changeMedia (event) {
      this.getDataList()
      this.$emit('successCBK', event)
      this.uploadVisible = false
    },
    getDataList () {
      mediaList(this.searchForm).then(response => {
        for (let k in response.data) {
          response.data[k].select = false
        }
        this.materialList = response.data
        this.total = response.meta && response.meta.pagination.total
      })
    },
    changeMenu (v) {
      this.searchForm.filter.type = v
      this.getDataList()
    },
    changePage (v) {
      this.searchForm.page = v
      this.getDataList()
    },
    changePageSize (v) {
      this.searchForm.limit = v
      this.getDataList()
    },
    beforeUpload () {
      return true
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '不支持的文件格式',
        desc:
          '所选文件‘ ' +
          file.name +
          ' ’格式不正确, 请选择 .jpg .jpeg .png .gif图片格式文件， .avi .mp4 .wma .rmvb视频格式文件'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小过大',
        desc: '所选文件‘ ' + file.name + ' ’大小过大, 不得超过 5M.'
      })
    },
    handleSuccess (res, file) {
      if (res) {
        this.$Message.success('上传文件 ' + file.name + ' 成功')
        this.searchForm.page = 1
        this.getDataList()
      } else {
        this.$Message.error(res.message)
      }
    },
    handleError (error, file, fileList) {
      this.$Message.error(error.toString())
    }
  }
}
</script>
