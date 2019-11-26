<template>
  <div class="child">
    <p>我是儿子，父亲对我说： {{give}}</p>
    <a href="javascript:;"
       rel="external nofollow"
       @click="returnBackwwwwww">回应</a>
  </div>
</template>
<script>
export default {
  props: {
    give: String
  },
  model: {
    prop: 'give',
    event: 'returnBack'
  },
  methods: {
    returnBackwwwwww () {
      this.$emit('returnBack', '还你200块')
    }
  }
}
</script>
