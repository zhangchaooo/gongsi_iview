/**
 * pages模版快速生成脚本,执行命令 npm run tep `文件名`
 */

const fs = require('fs')

const dirName = process.argv[2]

if (!dirName) {
  console.log('文件夹名称不能为空！')
  console.log('示例：npm run tep test')
  process.exit(0)
}

// 页面模版
const indexTep = `<template>
<div>
<add v-if="currView=='add'"
           @close="currView='index'"
           @submited="submited" />
      <edit v-if="currView=='edit'"
            @close="currView='index'"
            @submited="submited" />
 <div v-show="currView=='index'">${dirName}</div>
 </div>
</template>
<script>
import add from './add.vue'
import edit from './edit.vue'
export default {
  name: '${dirName}',
  components: {
    add,
    edit
  },
  data () {
    return {
      id: '',
      currView: 'index',
    }
  },
  methods: {
    init () {
      this.getDataList()
    },
    getDataList () {},
    submited () {
      this.currView = 'index'
      this.getDataList()
    },
    add () {
      this.$router.push({
        name: '${dirName}',
        query: { actions: 'add' }
      })
      this.currView = 'add'
    },
    edit (v) {
      if (!v.id) {
        this.$Message.error('id不能为空')
        return
      }
      this.$router.push({
        name: '${dirName}',
        query: { actions: 'edit', id: v.id }
      })
      this.currView = 'edit'
    },
    popstate () {
      this.currView = 'index'
    }
  },
  mounted () {
    this.init()
    this.currView = this.$route.meta.permTypes.includes(this.$route.query.actions) ? this.$route.query.actions : 'index'
  },
  beforeRouteUpdate (to, from, next) {
    if (to.query.actions == undefined) {
      this.popstate()
    } else {
      this.currView = to.meta.permTypes.includes(to.query.actions) ? to.query.actions : 'index'
    }
    next()
  }
}
</script>
<style lang="less">
</style>
`

// api请求模版
const apiTep = `import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest
} from '@/libs/request'

export const ${dirName}List = params => {
  return getRequest('/${dirName}', params)
}

export const ${dirName} = (id, params) => {
  return getRequest('/${dirName}/' + id, params)
}

export const ${dirName}Create = params => {
  return postRequest('/${dirName}/', params)
}

export const ${dirName}Delete = (id, params) => {
  return deleteRequest('/${dirName}/' + id, params)
}

export const ${dirName}Deletes = params => {
  return deleteRequest('/${dirName}/delete/', params)
}

export const ${dirName}Edit = (id, params) => {
  return putRequest('/${dirName}/' + id, params)
}
`
fs.mkdirSync(`./src/view/${dirName}`) // mkdir $1
process.chdir(`./src/view/${dirName}`) // cd $1
fs.writeFileSync('index.vue', indexTep)

process.chdir('../../') // cd $1
process.chdir('api')
fs.writeFileSync(`${dirName}.js`, apiTep)
console.log(`模版${dirName}已创建`)

process.exit(0)
