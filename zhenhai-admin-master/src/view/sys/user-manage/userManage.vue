<style lang="less">
@import "./userManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form ref="searchForm"
                :model="searchForm"
                inline
                :label-width="70"
                class="search-form">
            <Row :gutter="48">
              <Col :xl="8"
                   :lg="24">
              <Form-item label="用户名称"
                         prop="username">
                <Input type="text"
                       v-model="searchForm.filter.username"
                       clearable
                       placeholder="请输入用户名" />
              </Form-item>
              </Col>
              <Col :xl="8"
                   :lg="24">
              <Form-item label="用户姓名"
                         prop="name">
                <Input type="text"
                       v-model="searchForm.filter.name"
                       clearable
                       placeholder="请输入用户姓名" />
              </Form-item>
              </Col>
              <Col :xl="8"
                   :lg="24">
              <Form-item style="margin-left:-35px;"
                         class="br">
                <Button @click="handleSearch"
                        type="primary"
                        icon="ios-search">搜索</Button>
                <Button @click="handleReset">重置</Button>
                <!-- <a class="drop-down"
                 @click="dropDown">
                {{dropDownContent}}
                <Icon :type="dropDownIcon"></Icon>
              </a> -->
              </Form-item>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row class="operation">
          <Button v-has="'add'"
                  @click="add"
                  type="primary"
                  icon="md-add">添加用户</Button>
          <Button v-has="'deletes'"
                  @click="delAll"
                  icon="md-trash">批量删除</Button>
          <Dropdown @on-click="handleDropdown">
            <Button>更多操作
              <Icon type="md-arrow-dropdown" />
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="refresh">刷新</DropdownItem>
              <DropdownItem v-has="'output'"
                            name="exportData">导出所选数据</DropdownItem>
              <DropdownItem v-has="'output'"
                            name="exportAll">导出全部数据</DropdownItem>
              <DropdownItem name="importData">导入数据</DropdownItem>
            </DropdownMenu>
          </Dropdown>

        </Row>
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
                 size="large"
                 :columns="columns"
                 :data="data"
                 sortable="custom"
                 @on-sort-change="changeSort"
                 @on-selection-change="showSelect"
                 ref="table"></Table>
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
      </Card>
      </Col>
    </Row>
    <Modal :title="modalTitle"
           v-model="userModalVisible"
           :mask-closable="false"
           :width="500"
           :styles="{top: '200px'}">
      <Form ref="userForm"
            :model="userForm"
            :label-width="90"
            :rules="userFormValidate">
        <FormItem label="管理员"
                  required>
          <department-tree-choose-modal placeholder="选择成员"
                                        :listType='1'
                                        :editDep=editDep
                                        @on-change="handleSelectDepTree"
                                        ref="depTree"></department-tree-choose-modal>

        </FormItem>

        <FormItem v-if="modalType == 0"
                  label="密码"
                  prop="password"
                  :error="errorPass">
          <Input type="password"
                 v-model="userForm.password"
                 autocomplete="off" />
        </FormItem>
        <FormItem v-if="modalType == 0"
                  label="确认密码"
                  prop="password_confirmation"
                  :error="errorPass">
          <Input type="password"
                 v-model="userForm.password_confirmation"
                 autocomplete="off" />
        </FormItem>

        <!-- <FormItem label="邮箱"
                  prop="email">
          <Input v-model="userForm.email" />
        </FormItem>
        <FormItem label="手机号"
                  prop="mobile">
          <Input v-model="userForm.mobile" />
        </FormItem>
        <FormItem label="性别"
                  prop="sex">
          <RadioGroup v-model="userForm.sex">
            <Radio v-for="(item, i) in dictSex"
                   :key="i"
                   :label="item.value">{{item.title}}</Radio>
          </RadioGroup>
        </FormItem> -->

        <!-- <Form-item label="所属部门">
          <department-tree-choose @on-change="handleSelectDepTree"
                                  ref="depTree"></department-tree-choose>
        </Form-item>
        <FormItem label="用户类型"
                  prop="type">
          <Select v-model="userForm.type"
                  placeholder="请选择">
            <Option :value="0">普通用户</Option>
            <Option :value="1">管理员</Option>
          </Select>
        </FormItem> -->
        <!-- <FormItem label="管理范围"
                  prop="community_ids">
          <Select v-model="userForm.community_ids"
                  multiple>
            <Option v-for="item in communityList"
                    :value="item.id"
                    :key="item.id"
                    :label="item.name">
              <span style="margin-right:10px;">{{ item.name }}</span>
            </Option>
          </Select>
        </FormItem> -->
        <FormItem label="管理角色"
                  prop="role_id">
          <Select v-model="userForm.role_id"
                  multiple>
            <Option v-for="item in roleList"
                    :value="item.id"
                    :key="item.id"
                    :label="item.title">
              <!-- <div style="display:flex;flex-direction:column"> -->
              <span style="margin-right:10px;">{{ item.title }}</span>
              <!-- <span style="color:#ccc;">{{ item.description }}</span> -->
              <!-- </div> -->
            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text"
                @click="cancelUser">取消</Button>
        <Button type="primary"
                @click="submitUser">提交</Button>
      </div>
    </Modal>
    <!-- 自定义导出数据 -->
    <Modal v-model="exportModalVisible"
           :title="exportTitle"
           :styles="{top: '200px'}"
           :loading="loadingExport"
           @on-ok="exportCustomData">
      <Form ref="exportForm"
            :label-width="85">
        <FormItem label="导出文件名">
          <Input v-model="filename" />
        </FormItem>
        <FormItem label="自定义导出列">
          <CheckboxGroup v-model="chooseColumns">
            <Checkbox v-for="(item, i) in exportColumns"
                      :label="item.title"
                      :key="i"
                      :value="item.checked"
                      :disabled="item.disabled"></Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
    </Modal>

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
             show-icon>导入前请下载查看导入模版数据文件，确保数据格式正确，不得修改列英文名称。必需数据字段：用户名(唯一)、密码(明文)</Alert>
      <Table :columns="importColumns"
             size="large"
             :height="height"
             :data="importTableData"
             ref="importTable"></Table>
      <div class="drawer-footer">
        <Button @click="downloadTemple"
                type="info"
                style="position:absolute;left:15px;">下载导入模板</Button>
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
  </div>
</template>

<script>
import {
  userList,
  userCreate,
  userEdit,
  enableUser,
  disableUser,
  userDelete,
  userDeletes
  // importUserData
  // uploadFile
} from '@/api/user'
import {
  rolesList
} from '@/api/roles'
import expandRow from './expand.vue'
import departmentTreeChooseModal from '@/components/tj/department-tree-choose-modal'
import uploadPicThumb from '@/components/tj/upload-pic-thumb'

// 模版导入文件表数据
import { userColumns, userData } from '@/libs/importTemplate'
// 指定导出列数据
import { exportColumn } from './exportColumn'
import excel from '@/libs/excel'
export default {
  name: 'user-manage',
  components: {
    expandRow,
    departmentTreeChooseModal,
    uploadPicThumb
  },
  data () {
    // const validatePassword = (rule, value, callback) => {
    //   if (value.length < 6) {
    //     callback(new Error('密码长度不得小于6位'))
    //   } else {
    //     callback()
    //   }
    // }
    const validateMobile = (rule, value, callback) => {
      var reg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!reg.test(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    const valideRePassword = (rule, value, callback) => {
      if (value !== this.userForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      // s_id: this.$store.state.community.currentCommunity,
      height: 510,
      loading: true,
      operationLoading: false,
      importLoading: false,
      loadingExport: true,
      exportModalVisible: false,
      importModalVisible: false,
      drop: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      selectCount: 0,
      selectList: [],
      searchForm: {
        page: 1,
        limit: 10,
        filter: {},
        sort: ''
      },
      selectDate: null,
      modalType: 0,
      userModalVisible: false,
      modalTitle: '',
      userForm: {
        username: '',
        mobile: '',
        avatar: '',
        email: '',
        sex: 1,
        type: 0,
        staff_id: '',
        role_id: [],
        roles_title: '',
        community_ids: [],
        departmentTitle: ''
      },
      editDep: [],
      userRoles: [],
      roleList: [],
      errorPass: '',
      userFormValidate: {
        staff_id: [
          { required: true, message: '管理员不能为空' }
        ],
        password: [{
          required: true,
          message: '请输入新密码',
          trigger: 'blur'
        },
        {
          min: 6,
          message: '请至少输入6个字符'
        },
        {
          max: 32,
          message: '最多输入32个字符'
        }
        ],
        password_confirmation: [{
          required: true,
          message: '请再次输入新密码',
          trigger: 'blur'
        },
        {
          validator: valideRePassword,
          trigger: 'blur'
        }
        ]
        // role_id: [{
        //   required: true,
        //   message: '请分配角色'
        // }]
      },
      submitLoading: false,
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
          // fixed: 'left'
        },
        // {
        //   type: 'expand',
        //   width: 50,
        //   // fixed: 'left',
        //   render: (h, params) => {
        //     return h(expandRow, {
        //       props: {
        //         row: params.row
        //       }
        //     })
        //   }
        // },
        // {
        //   type: 'index',
        //   width: 60,
        //   align: 'center',
        //   fixed: 'left'
        // },
        {
          title: '用户名',
          key: 'username',
          minWidth: 145
          // fixed: 'left'
        },
        {
          title: '姓名',
          key: 'name',
          minWidth: 145
        },
        // {
        //   title: '头像',
        //   key: 'avatar',
        //   width: 80,
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('Avatar', {
        //       props: {
        //         src: params.row.avatar
        //       }
        //     })
        //   }
        // },
        // {
        //   title: '角色',
        //   key: 'roles_title',
        //   minWidth: 145
        // },
        // {
        //   title: '所属部门',
        //   key: 'departmentTitle',
        //   width: 120
        // },
        // {
        //   title: '手机',
        //   key: 'mobile',
        //   width: 115,
        //   sortable: true,
        //   render: (h, params) => {
        //     if (this.getStore('roles').includes('ROLE_ADMIN')) {
        //       return h('span', params.row.mobile)
        //     } else {
        //       return h('span', '您无权查看该数据')
        //     }
        //   }
        // },
        // {
        //   title: '邮箱',
        //   key: 'email',
        //   width: 180,
        //   sortable: true
        // },
        // {
        //   title: '性别',
        //   key: 'sex',
        //   width: 70,
        //   align: 'center'
        // },
        // {
        //   title: '用户类型',
        //   key: 'type',
        //   align: 'center',
        //   width: 100,
        //   render: (h, params) => {
        //     let re = ''
        //     if (params.row.type == 1) {
        //       re = '管理员'
        //     } else if (params.row.type == 0) {
        //       re = '普通用户'
        //     }
        //     return h('div', re)
        //   }
        // },
        {
          title: '状态',
          key: 'state',
          align: 'center',
          width: 160,
          render: (h, params) => {
            if (params.row.state == 1) {
              return h('div', [
                h(
                  'Badge',
                  {
                    props: {
                      status: 'success',
                      text: '启用'
                    }
                  }
                )
              ])
            } else if (params.row.state == 0) {
              return h('div', [
                h(
                  'Badge',
                  {
                    props: {
                      status: 'error',
                      text: '禁用'
                    }
                  }
                )
              ])
            }
          }
          //   filters: [
          //     {
          //       label: '正常启用',
          //       value: 0
          //     },
          //     {
          //       label: '禁用',
          //       value: -1
          //     }
          //   ],
          //   filterMultiple: false,
          //   filterMethod (value, row) {
          //     if (value == 0) {
          //       return row.status == 0
          //     } else if (value == -1) {
          //       return row.status == -1
          //     }
          //   }
        },
        {
          title: '创建时间',
          key: 'created_at',
          sortable: true,
          sortType: 'desc',
          width: 200
        },
        {
          title: '操作',
          key: 'action',
          width: 200,
          align: 'center',
          // fixed: 'right',
          render: (h, params) => {
            let enableOrDisable = ''
            if (params.row.username != 'admin') {
              if (params.row.state == 1) {
                enableOrDisable = h(
                  'a',
                  {
                    style: {
                      // marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.disable(params.row)
                      }
                    }
                  },
                  '禁用'
                )
              } else {
                enableOrDisable = h(
                  'a',
                  {
                    style: {
                      // marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.enable(params.row)
                      }
                    }
                  },
                  '启用'
                )
              }
              h(
                'Divider',
                {
                  props: {
                    type: 'vertical'
                  }
                }
              )

              return h('div', [
                this.$route.meta.permTypes && this.$route.meta.permTypes.includes('edit') && h(
                  'a',
                  {
                    style: {
                      // marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.edit(params.row)
                      }
                    }
                  },
                  '编辑'
                ),
                h(
                  'Divider',
                  {
                    props: {
                      type: 'vertical'
                    }
                  }
                ),
                enableOrDisable,
                h(
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
        }
      ],
      exportColumns: exportColumn,
      chooseColumns: [],
      filename: '用户数据',
      exportTitle: '确认导出',
      exportType: '',
      importTableData: [],
      importColumns: [],
      uploadfile: {
        name: ''
      },
      tempColumns: userColumns,
      tempData: userData,
      data: [],
      exportData: [],
      total: 0,
      dictSex: this.$store.state.dict.sex
    }
  },
  computed: {
    // communityList () {
    //   return this.$store.state.community.communityList
    // }
    // buttonLoading () {
    //   return this.$store.state.app.buttonLoading
    // }
  },
  methods: {
    changeAvatar (event) {
      if (event && event.response) this.userForm.avatar = event.response.media
    },
    init () {
      this.getUserList()
      // 初始化导出列数据
      let array = []
      this.exportColumns.forEach(e => {
        array.push(e.title)
      })
      this.chooseColumns = array
    },
    handleSelectDepTree (v) {
      console.log(v)
      this.userForm.staff_id = v[0]
    },
    handleSelectDep (v) {
      this.searchForm.departmentId = v
    },
    changePage (v) {
      this.searchForm.page = v
      this.getUserList()
      this.clearSelectAll()
    },
    changePageSize (v) {
      this.searchForm.limit = v
      this.getUserList()
    },
    selectDateRange (v) {
      if (v) {
        this.searchForm.filter.betweenCreated = v[0] + ',' + v[1]
      }
    },
    getUserList () {
      // 多条件搜索用户列表
      this.loading = true
      // 避免后台默认值
      if (!this.searchForm.type) {
        this.searchForm.type = ''
      }
      if (!this.searchForm.status) {
        this.searchForm.status = ''
      }
      userList(this.searchForm).then(res => {
        this.loading = false
        if (res) {
          this.data = res.data
          this.total = res.meta && res.meta.pagination.total
          for (let k in this.data) {
            let roles = ''
            this.data[k].roles.forEach(v => {
              roles += v.title + ','
            })
            roles = roles.substring(0, roles.length - 1)
            this.data[k].roles_title = roles
          }
        }
      })
    },
    handleSearch () {
      this.searchForm.page = 1
      this.searchForm.limit = 10
      this.getUserList()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.filter = {}
      this.searchForm.page = 1
      this.searchForm.limit = 10
      this.selectDate = null
      this.searchForm.departmentId = ''
      // 重新加载数据
      this.getUserList()
    },
    changeSort (e) {
      this.searchForm.sort = e.order === 'normal' ? null
        : e.order === 'desc' ? '-' + e.key : e.key
      this.getUserList()
    },
    getRoleList () {
      rolesList({ limit: 1000 }).then(res => {
        if (res) {
          this.roleList = res.data
        }
      })
    },
    handleDropdown (name) {
      if (name == 'refresh') {
        this.getUserList()
      } else if (name == 'exportData') {
        if (this.selectCount <= 0) {
          this.$Message.warning('您还未选择要导出的数据')
          return
        }
        this.exportType = 'part'
        this.exportModalVisible = true
        this.exportTitle = '确认导出 ' + this.selectCount + ' 条数据'
      } else if (name == 'exportAll') {
        this.exportType = 'all'
        this.exportModalVisible = true
        this.exportTitle = '确认导出全部 ' + this.total + ' 条数据'
        userList().then(res => {
          if (res) {
            this.exportData = res.data
            for (let k in this.exportData) {
              let roles = ''
              this.exportData[k].roles.forEach(v => {
                roles += v.title + ','
              })
              roles = roles.substring(0, roles.length - 1)
              this.exportData[k].roles_title = roles
            }
          }
        })
      } else if (name == 'importData') {
        this.importModalVisible = true
      }
    },
    exportCustomData () {
      if (this.filename == '') {
        this.filename = '用户数据'
      }
      // 判断勾选导出列
      let array = []
      this.exportColumns.forEach(e => {
        this.chooseColumns.forEach(c => {
          if (e.title == c && !e.disabled) {
            array.push(e)
          }
        })
      })
      this.exportModalVisible = false
      let title = []
      let key = []
      array.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        key: key,
        data: this.exportData,
        title: title,
        filename: this.filename,
        autoWidth: true
      }
      excel.export_array_to_excel(params)
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
    downloadTemple () {
      let title = []
      let key = []
      userColumns.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title: title,
        key: key,
        data: userData,
        autoWidth: true,
        filename: '导入用户数据模版'
      }
      excel.export_array_to_excel(params)
    },
    importData () {
      this.importLoading = true
      // importUserData(this.importTableData).then(res => {
      //   this.importLoading = false
      //   if (res) {
      //     this.importModalVisible = false
      //     this.getUserList()
      //     this.$Modal.info({
      //       title: '导入结果',
      //       content: res.message
      //     })
      //   }
      // })
    },
    cancelUser () {
      this.userModalVisible = false
      this.$refs.userForm.resetFields()
    },
    submitUser () {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          if (this.modalType == 0) {
            // 添加用户 避免编辑后传入id
            delete this.userForm.id
            if (
              this.userForm.password == '' ||
              this.userForm.password == undefined
            ) {
              this.errorPass = '密码不能为空'
              return
            }
            if (this.userForm.password.length < 6) {
              this.errorPass = '密码长度不得少于6位'
              return
            }
            userCreate(this.userForm).then(res => {
              this.$Message.success('操作成功')
              this.getUserList()
              this.userModalVisible = false
            })
          } else {
            // 编辑
            userEdit(this.userForm.id, this.userForm).then(res => {
              this.$Message.success('操作成功')
              this.getUserList()
              this.userModalVisible = false
            })
          }
        }
      })
    },
    handleUpload (v) {
      this.userForm.avatar = v
    },
    add () {
      this.modalType = 0
      this.modalTitle = '添加用户'
      this.userForm = {}
      this.editDep = []
      // 验证器莫名bug
      // this.$refs.userForm.resetFields()
      // this.$refs.uploadThumb.setData(this.userForm.avatar)
      this.userModalVisible = true
    },
    edit (v) {
      this.modalType = 1
      this.modalTitle = '编辑用户'
      this.userForm = {}

      // this.$nextTick(() => {
      //   this.$refs.userForm.resetFields()
      // })
      // this.$refs.userForm.resetFields()
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let data = JSON.parse(str)
      this.userForm = data
      // this.$refs.depTree.setData(this.userForm.name)
      this.editDep = [this.userForm.staff]
      // this.$refs.uploadThumb.setData(this.userForm.avatar)
      // 如果不修改头像就不传avatar字段
      delete this.userForm.avatar
      // this.$refs.depTree.setData([data.departmentId], data.departmentTitle)
      let selectRolesId = []
      this.userForm.roles.forEach(e => {
        selectRolesId.push(e.id)
      })
      this.userForm.role_id = selectRolesId
      // 查询出管理的社区
      let selectCommunityId = []
      this.userForm.userCommunity.forEach(e => {
        selectCommunityId.push(e.community_id)
      })
      this.userForm.community_ids = selectCommunityId
      this.userModalVisible = true
    },
    enable (v) {
      this.$Modal.confirm({
        title: '确认启用',
        content: '您确认要启用用户 ' + v.username + ' ?',
        onOk: () => {
          enableUser(v.id).then(res => {
            this.$Message.success('操作成功')
            this.getUserList()
          })
        }
      })
    },
    disable (v) {
      this.$Modal.confirm({
        title: '确认禁用',
        content: '您确认要禁用用户 ' + v.username + ' ?',
        onOk: () => {
          disableUser(v.id).then(res => {
            this.$Message.success('操作成功')
            this.getUserList()
          })
        }
      })
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除用户 ' + v.username + ' ?',
        onOk: () => {
          userDelete(v.id).then(res => {
            this.$Message.success('删除成功')
            this.getUserList()
          })
        }
      })
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
    showSelect (e) {
      this.exportData = e
      this.selectList = e
      this.selectCount = e.length
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false)
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
          // ids = ids.substring(0, ids.length - 1)

          userDeletes({ ids: ids }).then(res => {
            this.$Message.success('删除成功')
            this.clearSelectAll()
            this.getUserList()
          })
        }
      })
    }
  },
  activated () {
    this.getRoleList()
  },
  created () {
    // 计算高度
    this.height = Number(document.documentElement.clientHeight - 230)
    this.init()
    this.getRoleList()
  }
}
</script>
