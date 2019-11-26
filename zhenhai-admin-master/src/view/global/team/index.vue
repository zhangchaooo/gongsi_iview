<template>
  <div class="companyOrganization component search">
    <page-view />
    <div class="co-content">
      <Row :gutter="24">
        <!-- :style="{height:height+224 + 'px'}" -->
        <Col :xxl="6"
             :xl="9"
             :lg="24"
             :md="24"
             :sm="24">
        <Card class="co-tree mb-24">
          <!-- <Row type="flex"
               justify="space-around">
            <Col> -->
          <Input search
                 v-model="searchKey"
                 @on-change="searchChange"
                 class="co-search"
                 clearable
                 placeholder="搜索部门"></Input>
          <!-- </Col>
            <Col> -->
          <!-- <Button type="text"
                  class="team-add"> -->
          <Icon @click="appendInputChange"
                style="display:inline-block; width:1%;cursor: pointer"
                type="ios-add"
                size="28"></Icon>
          <!-- </Button> -->
          <!-- </Col>
          </Row> -->

          <Tree style="overflow:auto;"
                :style="{height:height-81 + 'px'}"
                ref="teamTree"
                :data="teamTreeData"
                :render="renderContent">
          </Tree>
          <Spin size="large"
                fix
                v-if="loading"></Spin>
        </Card>
        </Col>
        <Col :xxl="18"
             :xl="15"
             :lg="24"
             :md="24"
             :sm="24">
        <add v-if="currView=='add'" />
        <edit v-if="currView=='edit'" />
        <Card v-show="currView=='index'"
              class="mb-24"
              style="overflow: auto;"
              :style="{minHeight:height + 'px'}">
          <div slot="title"
               class="c_title">{{currentName}}<template v-if="!loading">（{{total}}人）</template>
          </div>

          <Row>
            <Col>

            <Row @keydown.enter.native="handleSearch">
              <Form ref="searchForm"
                    :model="searchForm"
                    inline
                    :label-width="70"
                    class="search-form">
                <Row :gutter="48">
                  <Col :xl="8"
                       :lg="24">
                  <Form-item label="姓名"
                             prop="name">
                    <Input type="text"
                           v-model="searchForm.filter.name"
                           placeholder="请输入姓名"
                           clearable />
                  </Form-item>
                  </Col>
                  <Col :xl="8"
                       :lg="24">
                  <Form-item label="性别"
                             prop="sex">
                    <Select v-model="searchForm.filter.sex"
                            placeholder="请选择性别"
                            clearable>
                      <Option value="1">男</Option>
                      <Option value="2">女</Option>
                    </Select>
                  </Form-item>
                  </Col>

                  <span v-if="drop">
                    <Col :xl="8"
                         :lg="24">
                    <Form-item label="工号"
                               prop="job_number">
                      <Input type="text"
                             v-model="searchForm.filter.job_number"
                             placeholder="请输入工号"
                             clearable />
                    </Form-item>
                    </Col>
                    <Col :xl="8"
                         :lg="24">
                    <Form-item label="手机号"
                               prop="phone_number">
                      <Input type="text"
                             v-model="searchForm.filter.phone_number"
                             placeholder="请输入手机号"
                             clearable />
                    </Form-item>
                    </Col>
                    <Col :xl="8"
                         :lg="24">
                    <Form-item label="座机号"
                               prop="landline_number">
                      <Input type="text"
                             v-model="searchForm.filter.landline_number"
                             placeholder="请输入座机号"
                             clearable />
                    </Form-item>
                    </Col>
                    <Col :xl="8"
                         :lg="24">
                    <Form-item label="邮箱"
                               prop="email">
                      <Input type="text"
                             v-model="searchForm.filter.email"
                             placeholder="请输入邮箱"
                             clearable />
                    </Form-item>
                    </Col>
                    <Col :xl="8"
                         :lg="24">
                    <Form-item label="职务"
                               prop="position">
                      <Input type="text"
                             v-model="searchForm.filter.position"
                             placeholder="请输入职务"
                             clearable />
                    </Form-item>
                    </Col>
                  </span>
                  <Col :xl="8"
                       :lg="24">
                  <Form-item style="margin-left:-35px;"
                             class="br">
                    <Button @click="handleSearch"
                            type="primary">查询</Button>
                    <Button @click="handleReset">重置</Button>
                    <a class="drop-down"
                       @click="dropDown">
                      {{dropDownContent}}
                      <Icon :type="dropDownIcon"></Icon>
                    </a>
                  </Form-item>
                  </Col>
                </Row>
              </Form>

              <Row class="operation">
                <Button v-has="'add'"
                        @click="add"
                        type="primary"
                        icon="md-add">添加</Button>
                <Button v-has="'deletes'"
                        @click="delAll"
                        icon="md-trash">批量删除</Button>
                <Button @click="getDataList"
                        icon="md-refresh">刷新</Button>
                <Button @click="importColumns = [],importTableData = [],importModalVisible = true">批量导入</Button>
              </Row>
              <!-- <Row>
              <Alert show-icon>
                已选择 <span class="select-count">{{selectCount}}</span> 项
                <a class="select-clear"
                   @click="clearSelectAll">清空</a>
              </Alert>
            </Row> -->
              <Row>
                <Table :loading="loading"
                       size="large"
                       :columns="columns"
                       :data="data"
                       ref="table"
                       sortable="custom"
                       @on-sort-change="changeSort"
                       @on-selection-change="changeSelect"></Table>
              </Row>
              <Row type="flex"
                   justify="end"
                   class="page">
                <Page :current="searchForm.page"
                      :total="total"
                      :page-size="searchForm.limit"
                      @on-change="changePage"
                      @on-page-size-change="changePageSize"
                      :page-size-opts="[10,20,50]"
                      size="small"
                      show-total
                      show-elevator
                      show-sizer></Page>
              </Row>
            </Row>
            </Col>
          </Row>

        </Card>
        </Col>
      </Row>
    </div>
    <Drawer title="导入数据"
            closable
            v-model="importModalVisible"
            width="1000">
      <Upload action
              :before-upload="beforeUploadImport"
              accept=".xls, .xlsx">
        <Button icon="ios-cloud-upload-outline"
                style="margin-right:10px">上传Excel文件</Button>
        <span v-if="uploadfile.name!=''">当前选择文件：{{ uploadfile.name }}</span>
      </Upload>
      <Alert type="warning"
             show-icon>导入前请下载查看导入模版数据文件，确保数据格式正确，不得修改列名称。所有字段都必填：性别 1(男) 2(女) 、若存在属于多个部门的情况，不同部门之间用“；”隔开。</Alert>
      <Table :columns="importColumns"
             size="large"
             :height="height - 20"
             :data="importTableData"
             ref="importTable"></Table>
      <div class="drawer-footer">
        <Button @click="downloadTemple"
                type="info"
                style="position:absolute;left:15px;">下载导入模板</Button>
        <Button v-if="importWringResult"
                @click="downloadWringResult"
                type="info"
                style="position:absolute;left:145px;">下载失败数据文件</Button>

        <Button @click="importModalVisible=false">关闭</Button>
        <Button :loading="importLoading"
                :disabled="importTableData.length<=0"
                @click="importData"
                style="margin-left:5px"
                type="primary">
          确认导入
          <span v-if="importTableData.length>0">{{importTableData.length}} 条数据</span>
        </Button>
      </div>
    </Drawer>

    <Modal :title="modalTitle"
           v-model="modalVisible"
           :mask-closable="false"
           :width="570"
           :styles="{top: '200px'}">
      <Form ref="teamForm"
            :model="teamForm"
            :rules="teamFormValidate"
            :label-width="90">
        <FormItem v-if="modalType < 2"
                  label="部门名称"
                  prop="name">
          <Input v-model="teamForm.name"
                 autocomplete="off" />
        </FormItem>

      </Form>
      <div slot="footer">
        <Button type="text"
                @click="cancelTeam">取消</Button>
        <Button type="primary"
                @click="submitTeam">提交</Button>
      </div>
    </Modal>

    <Modal :title="modalTitle"
           v-model="modalVisible2"
           :mask-closable="false"
           :width="570"
           :styles="{top: '200px'}">
      <Alert type="warning"
             show-icon>如未选择上级部门确认,将把当前部门设为一级部门</Alert>
      <Form ref="teamForm2"
            :model="teamForm2"
            :label-width="90">
        <Form-item v-if="modalType == 2"
                   prop="tissue_up_id"
                   label="上级部门">

          <department-tree-choose-modal placeholder='选择部门'
                                        @on-change="handleSelectDepTree"
                                        ref="depTree"></department-tree-choose-modal>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="text"
                @click="cancelTeam">取消</Button>
        <Button type="primary"
                @click="submitTeam">提交</Button>
      </div>
    </Modal>

  </div>
</template>
<script>
import pageView from '@/components/layouts/pageView'
import departmentTreeChooseModal from '@/components/tj/department-tree-choose-modal'
import {
  tissue,
  tissueCreate,
  tissueEdit,
  tissueMoveUp,
  tissueList,
  tissueDelete,
  tissueDeletes
} from '@/api/global/team'
import {
  staff,
  staffList,
  staffDelete,
  staffDeletes,
  staffBatchCreate
} from '@/api/global/staff'
// 模版导入文件表数据
import { getValueArray, beautySub } from '@/libs/tools'
import { customImportColumns, customImportData } from '@/libs/importTeamTemplate'
import add from './add.vue'
import edit from './edit.vue'
import excel from '@/libs/excel'
export default {
  name: 'team',
  components: {
    add,
    edit,
    pageView,
    departmentTreeChooseModal
  },
  data () {
    return {
      id: '',
      currView: 'index',
      teamForm: { name: '' },
      teamForm2: { tissue_up_id: 0 },
      teamData: '',
      teamFormValidate: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          {
            max: 32,
            message: '最多输入32个字符',
            trigger: 'blur'
          }
        ]
      },
      // 导入 begin
      height: 0,
      importModalVisible: false,
      importTableData: [],
      importColumns: [],
      importLoading: false,
      uploadfile: {
        name: ''
      },
      tempKey: {},
      importWringResult: false,
      // tempColumns: customImportColumns,
      // tempData: customImportData,
      // 导入 end
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalVisible2: false,
      modalTitle: '', // 添加或编辑标题
      drop: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      searchForm: { // 搜索框初始化对象
        // include: 'image', // 关联后端模型
        // fields: { user: 'id,username,name' }, // 自定义所需要字段
        search_tissue: { tissue_id: null },
        filter: {}, // 双向绑定搜索数据
        sort: { id: 'desc' }, // 自定义排序
        page: 1, // 当前页数
        limit: 10 // 页面大小
      },
      currentName: '全部',
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      loading: false,
      columns: [
        // 表头
        // {
        //   type: 'selection',
        //   width: 60,
        //   align: 'center'
        // },
        // {
        //  type: "index",
        //  width: 60,
        //  align: "center"
        // },
        {
          title: '姓名',
          key: 'name',
          minWidth: 120,
          sortable: false
        },
        {
          title: '手机号',
          key: 'phone_number',
          minWidth: 120,
          sortable: false
        },
        {
          title: '邮箱',
          key: 'email',
          minWidth: 120,
          sortable: false
        },
        {
          title: '职务',
          key: 'position',
          minWidth: 120,
          sortable: false
        },
        {
          title: '部门',
          key: 'tissue_id', // 遍历下
          minWidth: 120,
          render: (h, params) => {
            return h('div', getValueArray(params.row.tissue, 'name').join(','))
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('div', [
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && h(
                'a',
                {
                  style: {
                    // marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && this.$route.meta.permTypes.includes('delete') && h(
                'Divider',
                {
                  props: {
                    type: 'vertical'
                  }
                }
              ),
              this.$route.meta.permTypes && this.$route.meta.permTypes.includes('delete') && h(
                'a',
                {
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
      // 树
      teamTreeData: [],
      teamTreeSearchData: [],
      searchKey: '',
      appendInputValue: '', // 子部门名称
      appendData: null // 要添加子节点的节点数据，包含children（子节点）数组
    }
  },
  methods: {
    init () {
      this.getTreeList()
      this.getDataList()
    },
    handleSelectDepTree (v) {
      this.teamForm2.tissue_up_id = v[0] || 0
    },
    cancelTeam () {
      this.modalVisible = false
      this.modalVisible2 = false
    },
    submitTeam () {
      if (this.modalType == 2) {
        tissueMoveUp(this.teamData.id, this.teamForm2).then(res => {
          this.$Message.success('操作成功')
          this.getTreeList()
          this.modalVisible2 = false
        })
      } else {
        this.$refs.teamForm.validate(valid => {
          if (valid) {
            if (this.modalType == 0) {
              // 添加用户 避免编辑后传入id
              // delete this.teamForm.id
              if (this.teamData.id) {
                this.teamForm.parent_id = this.teamData.id
              }
              tissueCreate(this.teamForm).then(res => {
                if (res) {
                  this.$Message.success('添加成功')
                  this.modalVisible = false
                  if (this.teamData.id) {
                    this.teamData.children.push(res)
                    this.teamData.expand = true
                    // this.setDataToTree(this.teamTreeData, children.parent_id, res)
                  } else {
                    this.teamTreeData.push(res)
                  }
                  this.teamTreeSearchData = this.teamTreeData
                }
              })
            }
            if (this.modalType == 1) {
              tissueEdit(this.teamData.id, this.teamForm).then(res => {
                this.$Message.success('操作成功')
                this.teamData.name = this.teamForm.name
                this.modalVisible = false
              })
            }
          }
        })
      }
    },
    // 添加部门
    appendChild (data) {
      const children = { name: this.appendInputValue }
      if (data.id) {
        children.parent_id = data.id
      }
      tissueCreate(children).then(res => {
        if (res) {
          this.appendInputValue = null
          this.$Message.success('添加成功')
          if (data.id) {
            data.children.push(res)
            data.expand = true
            // this.setDataToTree(this.teamTreeData, children.parent_id, res)
          } else {
            this.teamTreeData.push(res)
          }
          this.teamTreeSearchData = this.teamTreeData
        }
      })
    },
    moveDepartment (data) {
      this.modalType = 2
      this.modalTitle = '设置' + data.name + '上级部门'
      this.teamData = data
      this.modalVisible2 = true
    },
    // 编辑部门
    manageDepartment (data) {
      this.modalType = 1
      this.modalTitle = '编辑' + data.name
      this.teamForm = { name: data.name }
      this.teamData = data
      this.modalVisible = true
    },
    // 添加子部门
    appendInputChange (data) {
      this.modalType = 0
      this.modalTitle = '添加部门'
      this.teamForm = {}
      this.teamData = data
      this.modalVisible = true
    },
    // 删除子部门
    removeDepartment (data) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + data.name + ' ?',
        onOk: () => {
          // 删除
          tissueDelete(data.id).then(res => {
            this.$Message.success('删除成功')
            this.deleteDataToTree(this.teamTreeData, data)
            this.teamTreeSearchData = this.teamTreeData
          })
        }
      })
    },
    /**
     * treeData 全部树数据
     * pId 要插入位置的父节点
     * respData 后端返回节点数据
     */
    setDataToTree (treeData, pId, respData) {
      for (var i = 0; i < treeData.length; i++) {
        var td = treeData[i]
        if (td.id == pId) {
          treeData[i].children = treeData[i].children.concat(respData)
          treeData[i].expand = true
          return
        } else {
          this.setDataToTree(td.children, pId, respData)
        }
      }
    },
    deleteDataToTree (treeData, data) {
      for (var i = 0; i < treeData.length; i++) {
        var td = treeData[i]
        if (td.id == data.id) {
          treeData.splice(i, 1)
          return
        } else {
          this.deleteDataToTree(td.children, data)
        }
      }
    },

    // 搜索树结构部门
    searchChange () {
      this.teamTreeData = JSON.parse(JSON.stringify(this.teamTreeSearchData))
      if (this.searchKey) {
        let self = this
        this.teamTreeData = this.teamTreeData.filter(function (item) {
          // 过滤树结构
          return self.filterObj(item)
        })
        // 让搜索到的层级都展开吧
        this.iteration(this.teamTreeData)
      }
    },
    downloadTemple () {
      let title = []
      let key = []
      customImportColumns.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title: title,
        key: key,
        data: customImportData,
        autoWidth: true,
        filename: '导入组织架构员工数据模版'
      }
      excel.export_array_to_excel(params)
    },
    downloadWringResult () {
      if (!this.importWringResult) return false
      let title = []
      let key = []
      this.importColumns.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title: title,
        key: key,
        data: this.importTableData,
        autoWidth: true,
        filename: '导入组织架构员工失败数据'
      }
      excel.export_array_to_excel(params)
    },
    importData () {
      this.importLoading = true
      // 组合一个中文为属性的对象，导入替换用
      for (let i = 0; i < customImportColumns.length; i++) {
        this.tempKey[customImportColumns[i].title] = customImportColumns[i].key
      }

      const tempColumns = []
      for (const prop in this.tempKey) {
        prop == '部门'
          ? tempColumns.push({
            title: prop,
            key: this.tempKey[prop]
            // render: (h, params) => { 在这里转部门的话，导出是数组格式会有问题
            //   return h('span', params.row.tissue_name.join('；'))
            // }
          })
          : tempColumns.push({ title: prop, key: this.tempKey[prop] })
      }
      tempColumns.push({
        title: '错误原因',
        key: 'reason',
        render: (h, params) => {
          return h('span', {
            style: {
              color: 'red'
            }
          }, params.row.reason)
        }
      })

      const tjexport = this.importTableData.map(item => {
        const obj = {}
        for (const prop in item) {
          if (this.tempKey.hasOwnProperty(prop)) {
            prop == '部门' ? obj[this.tempKey[prop]] = item[prop].split('；') : obj[this.tempKey[prop]] = item[prop]
          }
        }
        return obj
      })
      this.importLoading = false
      staffBatchCreate({ data: tjexport }).then(res => {
        if (res) {
          if (res.nothing_num) {
            res.nothing.forEach(item => {
              for (const prop in item) {
                if (prop == 'tissue_name') { item[prop] = item[prop].join('；') }
              }
            })
            this.importTableData = res.nothing
            this.importColumns = tempColumns
            this.importWringResult = true
          } else {
            this.importModalVisible = false
          }
          this.getDataList()
          this.$Modal.info({
            title: '导入结果',
            content: `新增：${res.insert_num}条，更新：${res.update_num}条，失败：${res.nothing_num}条`
          })
        }
      })
    },
    beforeUploadImport (file) {
      this.uploadfile = file
      const fileExt = file.name
        .split('.')
        .pop()
        .toLocaleLowerCase()
      if (fileExt == 'xlsx' || fileExt == 'xls') {
        this.readFile(file)
        this.file = file
      } else {
        this.$Notice.warning({
          title: '文件类型错误',
          desc:
            '所选文件‘ ' +
            file.name +
            ' ’不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。'
        })
      }
      return false
    },
    // 读取文件
    readFile (file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onerror = e => {
        this.$Message.error('文件读取出错')
      }
      reader.onload = e => {
        this.$Message.success('读取数据成功')
        const data = e.target.result
        const { header, results } = excel.read(data, 'array')
        const tableTitle = header.map(item => {
          return { title: item, key: item }
        })
        this.importTableData = results
        this.importColumns = tableTitle
      }
    },
    submited () {
      // this.currView = 'index'
      // this.getDataList()
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
    handleSearch () {
      this.searchForm.page = 1
      this.searchForm.limit = 10
      this.getDataList()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.filter = {}
      this.searchForm.page = 1
      this.searchForm.limit = 10
      // 重新加载数据
      this.getDataList()
    },
    changeSort (e) {
      this.searchForm.sort = e.order === 'normal' ? null
        : e.order === 'desc' ? '-' + e.key : e.key
      this.getDataList()
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false)
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
    },
    dropDown () {
      if (this.drop) {
        this.dropDownContent = '展开'
        this.dropDownIcon = 'ios-arrow-down'
      } else {
        this.dropDownContent = '收起'
        this.dropDownIcon = 'ios-arrow-up'
      }
      this.drop = !this.drop
    },
    getTreeList () {
      this.loading = true
      tissueList().then(res => {
        this.loading = false
        if (res) {
          res.forEach(function (e) {
            // 参考企业微信，有可能只有一个根目录，所以默认展开一层
            if (e.level == 0) {
              e.expand = true
            }
          })
          // this.iterationSelected(res)
          this.teamTreeData = res
          this.teamTreeSearchData = res
        }
      })
    },
    getDataList () {
      this.loading = true
      staffList(this.searchForm).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
        }
      })
    },
    add () {
      this.$router.push({
        name: 'team',
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
        name: 'team',
        query: { actions: 'edit', id: v.id }
      })
      this.currView = 'edit'
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + v.name + ' ?',
        onOk: () => {
          // 删除
          staffDelete(v.id).then(res => {
            this.$Message.success('操作成功')
            this.getDataList()
          })
        }
      })
    },
    delAll () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 条数据?',
        onOk: () => {
          let ids = []
          this.selectList.forEach(function (e) {
            ids.push(e.id)
          })
          // 批量删除
          staffDeletes({ ids: ids }).then(res => {
            this.$Message.success('操作成功')
            this.clearSelectAll()
            this.getDataList()
          })
        }
      })
    },
    popstate () {
      this.currView = 'index'
      this.getDataList()
    },
    renderContent (h, { root, node, data }) {
      const { search_tissue: st } = this.searchForm
      return h(
        'span',
        { // 所有title部分的内容,包括自己添加的icon。title 和 icon 父元素的容器
          style: {
            cursor: 'pointer',
            verticalAlign: 'middle'
            // backgroundColor: 'red'

          }
        },
        [
          h('span', {// 自定义的icon 和 title 所在的直接父元素
            style: {
              // backgroundColor: 'green',

              display: 'inline-block'
            },
            class: {
              // 'ivu-tree-title': true
            }
          }, [
            // h('div', {// icon
            //   class: {
            //     'jstree-wholerow': true
            //   }
            // }),
            h('Icon', {// icon
              props: {
                type: 'ios-folder',
                size: '16'
              },
              class: {
                'primary-color': true
              },
              style: {
                'margin-right': '8px',
                'margin-bottom': '4px'
              }
            }),
            h(
              'span', // 文本
              {
                class: {
                  'ivu-tree-title': true,
                  'ivu-tree-title-selected': data.id == st.tissue_id
                },
                style: {
                  marginRight: '16px'
                  // backgroundColor: 'aqua'
                },
                on: {
                  click: () => {
                    this.selectTree(data)
                  }
                }
              },
              beautySub(data.name, 10)
            )
          ]),
          h(
            'Dropdown', // 右侧操作图标
            {
              style: {
                // display: 'inline-block',
                // position: 'absolute',
                // right: '0px',
                float: 'right',
                textAlign: 'center',
                verticlaAlign: 'top'
                // backgroundColor: 'pink'
              },
              props: {
                trigger: 'hover'
              }
            },
            [
              h('Icon', {
                props: {
                  type: 'ios-more'
                },
                class: {
                  'primary-color': true
                },
                style: {
                  fontSize: '24px',
                  lineHeight: '16px'
                }
              }),
              h('DropdownMenu', {
                slot: 'list'
              },
              [
                data.level < 10 && h('DropdownItem', {
                  nativeOn: {
                    click: () => {
                      this.appendInputChange(data)
                    }
                  }
                }, '添加子部门'),
                h('DropdownItem', {
                  nativeOn: {
                    click: () => {
                      this.moveDepartment(data)
                    }
                  }
                }, '设置上级部门'),
                h('DropdownItem', {
                  nativeOn: {
                    click: () => {
                      this.manageDepartment(data)
                    }
                  }
                }, '编辑'),
                h('DropdownItem', {
                  nativeOn: {
                    click: () => {
                      this.removeDepartment(data)
                    }
                  }
                }, '删除')

              ])
            ]
          )
        ]
      )
    },

    selectTree (v) {
      // v.selected = !v.selected
      const { search_tissue: st } = this.searchForm

      if (v && v.id != st.tissue_id) {
        st.tissue_id = v.id
        this.currentName = v.name
      } else {
        delete st.tissue_id
        this.currentName = '全部'
      }
      // if (v.selected) {
      //   st.tissue_id = v.id
      //   this.currentName = v.name
      // } else {
      //   delete st.tissue_id
      //   this.currentName = '全部'
      // }
      this.getDataList()
    },

    // 递归节点
    iteration (data) {
      for (var j = 0; j < data.length; j++) {
        data[j].expand = true
        if (data[j].children != undefined && data[j].children.length > 0) {
          this.iteration(data[j].children)
        }
      }
    },
    iterationSelected (data) {
      for (var j = 0; j < data.length; j++) {
        data[j].selected = false
        if (data[j].children != undefined && data[j].children.length > 0) {
          this.iterationSelected(data[j].children)
        }
      }
    },
    filterObj (item) {
      let child
      let self = this
      // console.log(item.name)
      if (item.name.indexOf(self.searchKey) > -1) return true
      if (item.hasOwnProperty('children')) {
        item.children = item.children.filter(function (child) {
          if (!child.hasOwnProperty('children')) {
            return child.name.indexOf(self.searchKey) > -1
          } else if (child.hasOwnProperty('children')) {
            return self.filterObj(child)
          }
        })
        if (item.children.length > 0) {
          return true
        }
      } else {
        return child.name.indexOf(self.searchKey) > -1
      }
    }
  },
  created () {
    this.height = Number(document.documentElement.clientHeight - 210)
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
<style lang="less" >
.co-tree {
  .ivu-card-body {
    padding: 24px 18px;
  }
}
</style>
