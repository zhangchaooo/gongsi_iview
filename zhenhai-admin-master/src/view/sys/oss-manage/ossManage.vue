<style lang="less">
@import "./ossManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <div class="operation">
          <Row @keydown.enter.native="handleSearch">
            <Form ref="searchForm"
                  :model="searchForm"
                  inline
                  :label-width="75"
                  class="search-form">
              <Form-item label="创建时间">
                <DatePicker v-model="selectDate"
                            type="daterange"
                            format="yyyy-MM-dd"
                            @on-change="selectDateRange"
                            placeholder="选择起始时间"
                            style="width: 200px"></DatePicker>
              </Form-item>
              <Form-item style="margin-left:-35px;"
                         class="br">
                <Button @click="handleSearch"
                        type="primary"
                        icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
              </Form-item>
            </Form>
          </Row>
          <div class="oss-operation">
            <div>
              <Button @click="uploadVisible=true"
                      type="primary"
                      icon="md-cloud-upload">上传文件</Button>
              <Button v-if="showType=='list'"
                      @click="removeAll"
                      icon="md-trash">批量删除</Button>
              <Button @click="getDataList"
                      icon="md-refresh">刷新</Button>
            </div>

            <div>
              <RadioGroup v-model="fileType"
                          @on-change="changeFileType"
                          type="button"
                          style="margin-right:25px">
                <Radio label="all">所有文件</Radio>
                <Radio label="pic">图片</Radio>
                <Radio label="video">视频</Radio>
              </RadioGroup>
              <RadioGroup v-model="showType"
                          type="button"
                          @on-change="changeShowType">
                <Radio title="列表"
                       label="list">
                  <Icon type="md-list"
                        style="margin-bottom:3px;"></Icon>
                </Radio>
                <Radio title="缩略图"
                       label="thumb">
                  <Icon type="ios-apps"
                        style="margin-bottom:3px;"></Icon>
                </Radio>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div v-if="showType=='list'">
          <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear"
                 @click="clearSelectAll">清空</a>
            </Alert>
          </Row>
          <Row>
            <Table :loading="loading"
                   border
                   :columns="columns"
                   :data="data"
                   ref="table"
                   sortable="custom"
                   @on-sort-change="changeSort"
                   @on-selection-change="changeSelect"></Table>
          </Row>
        </div>
        <div v-if="showType=='thumb'">
          <div class="oss-wrapper">
            <Card v-for="(item, i) in data"
                  :key="i"
                  class="oss-card">
              <div class="content">
                <img @click="showPic(item)"
                     v-if="item.file_type.indexOf('image')>=0"
                     class="img"
                     :src="item.url">
                <div v-else-if="item.file_type.indexOf('video')>=0"
                     class="video"
                     @click="showVideo(item)">
                  <!-- 文件小于5MB显示video -->
                  <video class="cover"
                         v-if="item.size<1024 * 1024 * 5">
                    <source :src="item.url">
                  </video>
                  <img class="play"
                       src="@/assets/play.png">
                </div>
                <div v-else
                     class="other">
                  <div class="name">{{item.url}}</div>
                  <div class="info">文件类型：{{item.file_type}} 文件大小：{{item.file_size}} MB 创建时间：{{item.created_at}}</div>
                </div>
                <div class="actions">
                  <div class="btn">
                    <Tooltip content="下载"
                             placement="top">
                      <Icon @click="download(item)"
                            type="md-download"
                            size="16" />
                    </Tooltip>
                  </div>
                  <div class="btn-no">
                    <Tooltip content="删除"
                             placement="top">
                      <Icon @click="remove(item)"
                            type="md-trash"
                            size="16" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Row type="flex"
             justify="end"
             class="page">
          <Page :current="searchForm.page"
                :total="total"
                :page-size="searchForm.limit"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
                :page-size-opts="pageSizeOpts"
                size="small"
                show-total
                show-elevator
                show-sizer></Page>
        </Row>
      </Card>
      </Col>
    </Row>

    <Drawer title="文件上传"
            closable
            v-model="uploadVisible"
            width="500">
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
              multiple
              paste
              name='media'
              type="drag"
              ref="up">
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload"
                size="52"
                style="color: #3399ff"></Icon>
          <p>点击这里或将文件拖拽到这里上传</p>
        </div>
      </Upload>
      <div class="drawer-footer">
        <Button @click="clearFiles">清空上传列表</Button>
      </div>
    </Drawer>

    <Modal :title="modalTitle"
           :styles="{top: '200px'}"
           v-model="modalVisible"
           :mask-closable="false"
           :width="500">
      <Form ref="form"
            :model="form"
            :label-width="85"
            :rules="formValidate">
        <FormItem label="原文件名"
                  prop="name">
          <Input v-model="form.name" />
        </FormItem>
        <FormItem label="存储文件名"
                  prop="fkey">
          <Input v-model="form.fkey" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text"
                @click="handleCancel">取消</Button>
        <Button type="primary"
                :loading="submitLoading"
                @click="handleSubmit">提交</Button>
      </div>
    </Modal>

    <Modal v-model="picVisible"
           :styles="{top: '200px'}"
           :title="picTitle"
           draggable>
      <img :src="file.url"
           alt="无效的图片链接"
           style="width: 100%;margin: 0 auto;display: block;">
      <div slot="footer">
        <span>文件类型：{{file.file_type}} 文件大小：{{file.msize}} 创建时间：{{file.created_at}}</span>
      </div>
    </Modal>

    <Modal v-model="videoVisible"
           :styles="{top: '200px'}"
           :title="videoTitle"
           :width="800"
           @on-cancel="closeVideo"
           draggable>
      <video :src="file.url"
             style="width: 100%;margin: 0 auto;display: block;"
             controls></video>
      <div slot="footer">
        <span>文件类型：{{file.file_type}} 文件大小：{{file.msize}} 创建时间：{{file.created_at}}</span>
      </div>
    </Modal>
  </div>
</template>

<script>
import { uploadFile } from '@/libs/request'
import { getToken } from '@/libs/util'
import {
  mediaList,
  mediaDelete,
  mediaDeletes
} from '@/api/media'
export default {
  name: 'oss-manage',
  data () {
    return {
      uploadData: { is_show: 1 },
      uploadFile: uploadFile,
      accessToken: { Authorization: getToken() || (this.$Message.error('请重新登录'), this.$router.push('/login')) }, // 上传token鉴权
      loading: false, // 表单加载状态

      fileType: 'all',
      showType: 'list',
      modalVisible: false, // 添加或编辑显示
      uploadVisible: false,
      videoVisible: false,
      picVisible: false,
      picTitle: '',
      videoTitle: '',
      modalTitle: '', // 添加或编辑标题
      searchForm: {
        // 搜索框对应data对象
        include: 'user', // 关联后端模型
        fields: { user: 'id,username,name' }, // 自定义所需要字段
        filter: { is_show: '1' }, // 双向绑定搜索数据
        sort: '', // 自定义排序
        page: 1, // 当前页数
        limit: 10 // 页面大小
      },
      selectDate: null, // 选择日期绑定modal
      oldKey: '',
      form: {
        name: '',
        fkey: ''
      },
      file: {},
      // 表单验证规则
      formValidate: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        fkey: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      totalSize: '', // 文件大小统计
      columns: [
        // 表头
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
          title: '缩略图(点击预览)',
          key: 'url',
          // width: 130,
          align: 'center',
          render: (h, params) => {
            if (params.row.file_type.includes('image') > 0) {
              return h('img', {
                attrs: {
                  src: params.row.url,
                  alt: '加载图片失败'
                },
                style: {
                  cursor: 'pointer',
                  width: '80px',
                  height: '60px',
                  margin: '10px 0',
                  'object-fit': 'contain'
                },
                on: {
                  click: () => {
                    this.showPic(params.row)
                  }
                }
              })
            } else if (params.row.file_type.includes('video') > 0) {
              // 如果视频文件大小超过5MB不予加载video
              if (params.row.size < 1024 * 1024 * 5) {
                return h(
                  'video',
                  {
                    style: {
                      cursor: 'pointer',
                      width: '80px',
                      height: '60px',
                      margin: '10px 0',
                      'object-fit': 'contain'
                    },
                    on: {
                      click: () => {
                        this.showVideo(params.row)
                      }
                    }
                  },
                  [
                    h('source', {
                      attrs: {
                        src: params.row.url
                      }
                    })
                  ]
                )
              } else {
                return h('img', {
                  attrs: {
                    src: require('@/assets/play.png')
                  },
                  style: {
                    cursor: 'pointer',
                    width: '80px',
                    height: '60px',
                    margin: '10px 0',
                    'object-fit': 'contain'
                  },
                  on: {
                    click: () => {
                      this.showVideo(params.row)
                    }
                  }
                })
              }
            } else {
              return h('span', '非多媒体类型')
            }
          }
        },
        {
          title: '文件类型',
          key: 'file_type'
          // width: 110
        },
        {
          title: '文件大小',
          key: 'file_size',
          // width: 110,
          sortable: true,
          render: (h, params) => {
            let m = params.row.file_size + ' MB'
            return h('span', m)
          }
        },
        {
          title: '上传者',
          key: 'user',
          // width: 120,
          render: (h, params) => {
            let m = params.row.user ? params.row.user.name || params.row.user.username : ''
            return h('span', m)
          }
        },
        {
          title: '创建时间',
          key: 'created_at',
          // width: 150,
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 135,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.download(params.row)
                    }
                  }
                },
                '下载'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
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
      total: 0, // 表单数据总数
      pageSizeOpts: [10, 20, 50]
    }
  },
  methods: {
    init () {
      this.getDataList()
    },
    showPic (v) {
      this.file = v
      this.file.msize = v.file_size + ' MB'
      this.picTitle = v.url
      this.picVisible = true
    },
    showVideo (v) {
      this.file = v
      this.file.msize = v.file_size + ' MB'
      this.videoTitle = v.url
      this.videoVisible = true
    },
    closeVideo () {
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
    changeSort (e) {
      this.searchForm.sort = e.order === 'normal' ? null
        : e.order === 'desc' ? '-' + e.key : e.key
      this.getDataList()
    },
    selectDateRange (v) {
      if (v) {
        this.searchForm.filter.betweenCreated = v[0] + ',' + v[1]
      }
    },
    changeShowType () {
      this.searchForm.page = 1
      if (this.showType == 'list') {
        this.searchForm.limit = 10
      } else {
        this.searchForm.limit = 12
      }
      this.getDataList()
    },
    getDataList () {
      if (this.showType == 'list') {
        this.pageSizeOpts = [10, 20, 50]
      } else {
        this.pageSizeOpts = [12, 24]
      }
      this.loading = true
      mediaList(this.searchForm).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
        }
      })
    },
    handleSearch () {
      this.searchForm.page = 1
      if (this.showType == 'list') {
        this.searchForm.limit = 10
      } else {
        this.searchForm.limit = 12
      }
      this.getDataList()
    },
    changeFileType () {
      let name = this.fileType
      if (name == 'all') {
        this.searchForm.filter.type = ''
      } else if (name == 'pic') {
        this.searchForm.filter.type = '1'
      } else if (name == 'video') {
        this.searchForm.filter.type = '2'
      }
      this.handleSearch()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.filter = {}
      this.searchForm.page = 1
      if (this.showType == 'list') {
        this.searchForm.limit = 10
      } else {
        this.searchForm.limit = 12
      }
      this.selectDate = null
      // 重新加载数据
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
      this.$Message.success('上传文件 ' + file.name + ' 成功')
      this.getDataList()
    },
    handleError (error, file, fileList) {
      this.$Message.error(error.toString())
    },
    clearFiles () {
      this.$refs.up.clearFiles()
    },
    handleCancel () {
      this.modalVisible = false
    },
    download (v) {
      window.open(
        v.url + '?attname=&response-content-type=application/octet-stream'
      )
    },
    removeAll () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 个文件？文件删除后，关联使用的地方将无法使用！',
        onOk: () => {
          let ids = []
          this.selectList.forEach(function (e) {
            ids.push(e.id)
          })
          // ids = ids.substring(0, ids.length - 1)
          this.loading = true
          mediaDeletes({ ids: ids }).then(res => {
            this.loading = false
            this.$Message.success('批量删除文件成功')
            this.clearSelectAll()
            this.getDataList()
          })
        }
      })
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除？文件删除后，关联使用的地方将无法使用！',
        onOk: () => {
          this.loading = true
          mediaDelete(v.id).then(res => {
            this.loading = false
            this.$Message.success('删除文件成功')
            this.loading = false
            this.getDataList()
          })
        }
      })
    },
    handleSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = {
            id: this.form.id,
            key: this.oldKey,
            newKey: this.form.fkey,
            newName: this.form.name
          }
        }
      })
    },
    rename (v) {
      this.modalTitle = '编辑文件名'
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let data = JSON.parse(str)
      this.form = data
      this.oldKey = data.fkey
      this.modalVisible = true
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false)
      this.totalSize = ''
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
      let size = 0
      e.forEach(item => {
        size += item.size * 1.0
      })
      this.totalSize = ((size * 1.0) / (1024 * 1024)).toFixed(2) + ' MB'
    }
  },
  mounted () {
    this.init()
  }
}
</script>
