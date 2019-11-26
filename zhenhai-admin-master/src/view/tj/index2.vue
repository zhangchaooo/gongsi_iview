<template>
  <div>tj comp
    <tinymce :height="500"
             v-model="ruleForm.info_content"
             style="width:500px;line-height: normal"
             ref="editor"></tinymce>
  </div>
</template>

<script>
import Tinymce from '@/components/tj/Tinymce'
export default {
  components: {
    Tinymce
  },
  data () {
    return {
      ruleForm: {
        info_content: null
      }
    }
  },
  methods: {
    // changeMedia (event) {
    //   console.log(event)
    // }
  }
}
</script>
