/**
 * pages模版快速生成脚本,执行命令 npm run tep-d `文件名`
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
 <div></div>
</template>
<script>
export default {
  name: '${dirName}',
  data () {
    return {
      data: {}
    }
  },
  methods: {
    init () {}
  },
  activated () {
    this.init()
  },
  mounted () {
    this.init()
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
fs.writeFileSync('add.vue', indexTep)

process.chdir('../../') // cd $1
process.chdir('api')
fs.writeFileSync(`${dirName}.js`, apiTep)
console.log(`模版${dirName}已创建`)

process.exit(0)
