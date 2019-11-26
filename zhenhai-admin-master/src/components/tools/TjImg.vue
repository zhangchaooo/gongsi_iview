<template>
  <div>
    <img :class="[avatar ? avatar : '']"
         :src="src"
         :width="width"
         :height="height"
         @error="handleError"
         v-if="src && is_true">
    <i v-else
       :style="{ color: color, fontSize: width+20 + 'px' }"
       class="ivu-icon"
       :class="[icon]"></i>
  </div>
</template>
<script>
export default {
  name: 'TjImg',
  props: {
    avatar: {
      type: Boolean,
      default: true
    },
    src: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 60
    },
    height: {
      type: Number,
      default: 60
    },
    color: {
      type: String,
      default: '#ccc'
    },
    icon: {
      type: String,
      default: 'ivu-icon-ios-contact-outline'
    }
  },
  data () {
    return {
      is_true: true
    }
  },
  methods: {
    handleError (e) {
      this.is_true = false
    }
  }
}
</script>
<style lang="less">
.avatar {
  border-radius: 50%;
}
</style>
