<template>
  <div>
    <div class="upload-list"
         :style="{ width: width + 'px', height: height + 'px', lineHeight: height + 'px' }"
         v-for="(item,index) in uploadList"
         :key="index">
      <div v-if="item.status == 'finished'">
        <img :src="item.media"
             :style="{ width: width + 'px', height: height + 'px', lineHeight: height + 'px' }">
        <div v-if="!disabled"
             class="upload-list-cover"
             :style="{ lineHeight: height + 'px' }">
          <Icon type="ios-eye-outline"
                @click="handleView(item.media)"></Icon>
          <Icon type="ios-trash-outline"
                @click="handleRemove(item)"></Icon>
        </div>
      </div>
      <div v-else>
        <Progress v-if="item.showProgress"
                  :percent="item.percentage"
                  hide-info></Progress>
      </div>
    </div>
    <Upload ref="upload"
            name='media'
            :multiple="multiple"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :on-error="handleError"
            :format="['jpg','jpeg','png','gif']"
            :max-size="5120"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            :action="uploadFileUrl"
            :headers="accessToken"
            style="display: inline-block;">
      <div v-if="uploadList.length == 0 || multiple"
           :style="{ width: width + 'px', height: height + 'px', lineHeight: height + 'px' }">
        <Icon type="md-camera"
              size="20"></Icon>
      </div>
    </Upload>
    <div style="margin-left:5px;color:#ccc">{{detail}}</div>

    <Modal title="图片预览"
           v-model="viewImage"
           :styles="{top: '30px'}"
           draggable>
      <img :src="imgUrl"
           alt="无效的图片链接"
           style="width: 100%;margin: 0 auto;display: block;">
      <div slot="footer">
        <Button @click="viewImage=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { uploadFile } from '@/libs/request'
import { getToken } from '@/libs/util'
export default {
  name: 'uploadPicThumb',
  props: {
    value: Object,
    multiple: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 58
    },
    detail: {
      type: String
    },
    height: {
      type: Number,
      default: 58
    }
  },
  data () {
    return {
      accessToken: { Authorization: getToken() || (this.$Message.error('请重新登录'), this.$router.push('/login')) },
      uploadFileUrl: uploadFile,
      uploadList: [],
      viewImage: false,
      imgUrl: ''
    }
  },
  methods: {
    init () {
    },
    handleView (imgUrl) {
      this.imgUrl = imgUrl
      this.viewImage = true
    },
    handleRemove (file) {
      const uploadList = this.uploadList
      this.uploadList.splice(uploadList.indexOf(file), 1)
      this.returnValue()
    },
    handleSuccess (res, file) {
      if (res) {
        file.media = res.media
        // 单张图片处理
        if (!this.multiple && this.uploadList.length > 0) {
          // 删除第一张
          this.uploadList.splice(0, 1)
        }
        this.uploadList.push(file)
        // 返回组件值
        this.returnValue()
      } else {
        this.$Message.error(res.message)
      }
    },
    handleError (error, file, fileList) {
      this.$Message.error(error.toString())
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '不支持的文件格式',
        desc:
          '所选文件‘ ' +
          file.name +
          ' ’格式不正确, 请选择 .jpg .jpeg .png .gif图片格式文件'
      })
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小过大',
        desc: '所选文件‘ ' + file.name + ' ’大小过大, 不得超过 5M.'
      })
    },
    handleBeforeUpload () {
      return true
    },
    returnValue () {
      if (!this.uploadList || this.uploadList.length < 1) {
        if (!this.multiple) {
          this.$emit('on-change', '')
        } else {
          this.$emit('on-change', [])
        }
        return
      }
      if (!this.multiple) {
        // 单张
        let v = this.uploadList[0]
        this.$emit('on-change', v)
      } else {
        let v = []
        this.uploadList.forEach(e => {
          v.push(e)
        })
        this.$emit('on-change', v)
      }
    },
    setData (v) {
      if (!v) return false
      if (typeof v == 'string') {
        let item = {
          media: v,
          status: 'finished'
        }
        if (v) {
          this.uploadList = []
          this.uploadList.push(item)
        } else {
          this.uploadList = []
        }
      } else if (typeof v == 'object') {
        v.forEach(e => {
          let item = {
            media: e,
            status: 'finished'
          }
          this.uploadList.push(item)
        })
      }
      this.returnValue()
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="less">
.upload-list {
  display: inline-block;
  // width: 60px;
  // height: 60px;
  text-align: center;
  // line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 5px;
}
.upload-list img {
  width: 100%;
  height: 100%;
}
.upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.upload-list:hover .upload-list-cover {
  display: block;
}
.upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
</style>
