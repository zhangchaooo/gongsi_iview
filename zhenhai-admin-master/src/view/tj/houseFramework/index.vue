<template>
  <div class="house">
    <page-view />
    <div class="search">
      <Row class="operation">
        <Button @click="add"
                type="primary"
                icon="md-add">添加子节点</Button>
        <Button @click="addRoot"
                icon="md-add">添加一级节点</Button>
        <Button @click="delAll"
                icon="md-trash">批量删除</Button>
        <Button @click="getParentList"
                icon="md-refresh">刷新</Button>
        <i-switch v-model="strict"
                  size="large"
                  style="margin-left:5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
      </Row>
      <Row type="flex"
           justify="start"
           class="code-row-bg">
        <Col>

        <Card style="width:220px;margin-right:10px;">
          <p slot="title"
             class="house-title"
             style="font-size:26px;height:30px;line-height:30px;">
            楼栋/单元
          </p>
          <Input v-model="searchKey"
                 suffix="ios-search"
                 @on-change="search"
                 placeholder="输入节点名搜索"
                 clearable />

          <div class="tree-bar"
               :style="{maxHeight: maxHeight}">
            <Tree style="width:167px;"
                  ref="tree"
                  :data="treeData"
                  :render="renderContent"></Tree>
          </div>
          <Spin size="large"
                fix
                v-if="loading"></Spin>
        </Card>
        </Col>
        <Col span="18">
        <Card>
          <p slot="title"
             style="font-size:26px;height:30px;line-height:30px;">
            楼层/梯户
          </p>
          <Row type="flex">
            <Col span="4">1号楼-1单元</Col>
            <Col span="17">
            </Col>
            <Col span="3">
            <Dropdown @on-click="handleDropdown">
              <Button>
                更多操作
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="refresh">设置户型</DropdownItem>
                <DropdownItem name="expandOne">屏蔽</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            </Col>
          </Row>
          <div class="house-right">
            <CheckboxGroup v-model="social">
              <Row type="flex">
                <Col span="4">
                <Dropdown>
                  <a href="javascript:void(0)">
                    5F
                    <Icon type="ios-arrow-down"></Icon>
                  </a>
                  <DropdownMenu slot="list">
                    <DropdownItem>重命名</DropdownItem>
                    <DropdownItem>屏蔽</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                </Col>
                <Col span="20">
                <Row :gutter="16"
                     class="bg">
                  <Col span="4">
                  <div class="bg2">
                    <Checkbox label="1"></Checkbox>
                    101
                  </div>
                  </Col>
                  <Col span="4">
                  <div class="bg2">
                    <Checkbox label="2"></Checkbox>101
                  </div>
                  </Col>
                  <Col span="4">
                  <div class="bg2">
                    <Checkbox label="3"></Checkbox>101
                  </div>
                  </Col>
                  <Col span="4">
                  <div class="bg2">
                    <Checkbox label="4"></Checkbox>101
                  </div>
                  </Col>
                </Row>
                </Col>
              </Row>
            </CheckboxGroup>
          </div>
        </Card>
        </Col>
      </Row>
      <Modal :title="modalTitle"
             v-model="modalVisible"
             :mask-closable="false"
             :width="500">
        <Form ref="formAdd"
              :model="formAdd"
              :label-width="100"
              :rules="formValidate">
          <div v-if="showParent">
            <FormItem label="上级节点：">{{form.title}}</FormItem>
          </div>
          <FormItem label="name"
                    prop="name">
            <Input v-model="formAdd.name"
                   style="width:100%" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text"
                  @click="modalVisible=false">取消</Button>
          <Button type="primary"
                  :loading="submitLoading"
                  @click="submitAdd">提交</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import pageView from '@/components/layouts/pageView'
export default {
  name: 'tree',
  components: {
    pageView
  },
  data () {
    return {
      title: '',
      social: [],
      maxHeight: '500px',
      strict: true,
      loading: false, // 树加载状态
      loadingEdit: false, // 编辑上级树加载状态
      modalVisible: false, // 添加显示
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      showParent: false, // 显示上级标识
      modalTitle: '', // 添加标题
      editTitle: '', // 编辑节点名称
      searchKey: '', // 搜索树
      form: {
        // 编辑对象初始化数据
        id: '',
        parentId: '',
        parentTitle: '',
        name: ''
      },
      formAdd: {
        // 添加对象初始化数据
      },
      formValidate: {
        // 表单验证规则
        name: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      submitLoading: false,
      treeData: [],
      resData: {
        title: '11单元',
        level: 1,
        children: [
          {
            title: '1F',
            level: 2,
            children: [
              {
                title: '101',
                children: [
                  {
                    title: '101'
                  },
                  {
                    title: '102'
                  },
                  {
                    title: '103'
                  },
                  {
                    title: '104'
                  },
                  {
                    title: '105'
                  }
                ]
              },
              {
                title: '102'
              },
              {
                title: '103'
              },
              {
                title: '104'
              },
              {
                title: '105'
              }
            ]
          },
          {
            title: '2F',
            level: 2,
            children: [
              {
                title: '201'
              },
              {
                title: '202'
              }
            ]
          }
        ]
      },
      dataEdit: []
    }
  },
  methods: {
    handleReName () {
      this.$Modal.confirm({
        title: '重命名',
        render: (h) => {
          return h('Input', {
            props: {
              value: this.value,
              autofocus: true,
              placeholder: 'Please enter your name...'
            },
            on: {
              input: (val) => {
                this.value = val
              }
            }
          })
        }
      })
    },
    copyTree () {
      // this.postRequest('/system/basic/dep', {
      //   name: this.depName,
      //   parentId: this.pDep
      // }).then(resp => {
      //   _this.treeLoading = false
      //   if (resp && resp.status == 200) {
      //     var respData = resp.data
      //     _this.depName = ''
      this.setDataToTree(this.treeData, 1, this.resData)
      //   }
      // })
    },

    renderContent (h, { root, node, data }) {
      let icon = ''
      if (data.level == 0) {
        icon = 'ios-navigate'
      } else if (data.level == 1) {
        icon = 'md-list-box'
      } else if (data.level == 2) {
        icon = 'md-list'
      } else if (data.level == 3) {
        icon = 'md-radio-button-on'
      } else {
        icon = 'md-radio-button-off'
      }
      return h('span', {
        style: {
          display: 'inline-block',
          width: '100%'
        }
      }, [
        h('span', {
          style: {
            display: 'inline-block',
            cursor: 'pointer'
          },
          on: {
            click: () => {
              this.selectTree(data)
            }
          }
        }, [
          h('Icon', {
            props: {
              type: icon
            },
            style: {
              marginRight: '8px',
              fontSize: '14px'
            }
          }),
          h(
            'span',
            {
              style: {
                fontSize: '14px',
                verticalAlign: 'middle'
              },
              class: {
                'ivu-tree-title': true,
                'ivu-tree-title-selected': data.title == this.title
              }
            },
            data.title
          )
        ]),
        h('span', {
          style: {
            display: 'inline-block',
            float: 'right'
          }
        }, [
          h('Dropdown', {
            props: { transfer: true },
            on: {
              'on-click': v => {
                this.handleDropdownLeft(data, v)
              }
            }
          }, [
            h('a', {
              attrs: {
                href: 'javascript:void(0)'
              }
            }, [h('Icon', {
              props: {
                type: 'ios-more',
                size: '16',
                color: '#000'
              }
            })]),
            // h('Button', {
            //   props: {
            //     icon: 'ios-more',
            //     type: 'text',
            //     shape: 'circle'
            //   },
            //   style: {
            //     fontSize: '16px'
            //   }
            // }),
            h('DropdownMenu', { slot: 'list' }, [
              h('DropdownItem', { props: { name: 'rename' } }, '重命名'),
              h('DropdownItem', { props: { name: 'copy' } }, '复制'),
              h('DropdownItem', { props: { name: 'delete' } }, '删除')
            ])
          ])

          // h('Button', {
          //   props: Object.assign({}, this.buttonProps, {
          //     icon: 'ios-more',
          //     type: 'text',
          //     shape: 'circle'
          //   }),
          //   style: {
          //     fontSize: '16px'
          //   },
          //   on: {
          //     click: () => { this.append(data) }
          //   }
          // })

        ])

      ])
    },
    init () {
      // 初始化一级节点
      this.getParentList()
      // 初始化一级节点为编辑上级节点使用
      this.getParentListEdit()
    },
    handleDropdown (name) {
      console.log(name)
    },
    handleDropdownLeft (row, name) {
      if (name == 'rename') this.handleReName()
      this.$Message.info('点击了 ' + row.title + ' 的 ' + name)
    },
    getParentList () {
      // this.loading = true;
      // this.getRequest("一级数据请求路径，如/tree/getByParentId/0").then(res => {
      //   this.loading = false;
      //   if (res.success === true) {
      //     res.result.forEach(function(e) {
      //       if (e.isParent) {
      //         e.loading = false;
      //         e.children = [];
      //       }
      //     });
      //     this.data = res.result;
      //   }
      // });
      // 模拟请求成功
      this.treeData = [
        {
          id: 1,
          title: '1号楼',
          level: 0,
          children: [
            {
              id: 2,
              title: '1单元',
              level: 1,
              children: [
                {
                  id: 3,
                  title: '1F',
                  level: 2,
                  children: [
                    {
                      title: '101111111111'
                    },
                    {
                      title: '102'
                    },
                    {
                      title: '103'
                    },
                    {
                      title: '104'
                    },
                    {
                      title: '105'
                    }
                  ]
                },
                {
                  id: 4,
                  title: '2F',
                  level: 2,
                  children: [
                    {
                      title: '201'
                    },
                    {
                      title: '202'
                    }
                  ]
                }
              ]
            }, {
              id: 5,
              title: '2单元',
              level: 1,
              children: [
                {
                  id: 6,
                  title: '2F',
                  level: 2,
                  children: [
                    {
                      title: '201'
                    },
                    {
                      title: '202'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 7,
          title: '2号楼',
          level: 0
        },
        {
          id: 8,
          title: '3号楼',
          level: 0
        },
        {
          id: 9,
          title: '4号楼',
          level: 0
        },
        {
          id: 10,
          title: '5号楼',
          level: 0
        }
      ]
    },
    getParentListEdit () {
      // this.loadingEdit = true;
      // this.getRequest("/tree/getByParentId/0").then(res => {
      //   this.loadingEdit = false;
      //   if (res.success === true) {
      //     res.result.forEach(function(e) {
      //       if (e.isParent) {
      //         e.loading = false;
      //         e.children = [];
      //       }
      //     });
      //     // 头部加入一级
      //     let first = {
      //       id: "0",
      //       title: "一级节点"
      //     };
      //     res.result.unshift(first);
      //     this.dataEdit = res.result;
      //   }
      // });
      // 模拟请求成功
      this.dataEdit = [
      ]
    },
    loadData (item, callback) {
      // 异步加载树子节点数据
      // this.getRequest("请求路径，如/tree/getByParentId/" + item.id).then(res => {
      //   if (res.success === true) {
      //     res.result.forEach(function(e) {
      //       if (e.isParent) {
      //         e.loading = false;
      //         e.children = [];
      //       }
      //     });
      //     callback(res.result);
      //   }
      // });
    },
    search () {
      // 搜索树
      if (this.searchKey) {
        // 模拟请求
        // this.loading = true;
        // this.getRequest("搜索请求路径", { title: this.searchKey }).then(res => {
        //   this.loading = false;
        //   if (res.success === true) {
        //     this.data = res.result;
        //   }
        // });
        // 模拟请求成功
        this.data = [
        ]
      } else {
        // 为空重新加载
        this.getParentList()
      }
    },
    selectTree (v) {
      this.title = v.title
      if (v.level == 1) console.log(v)
      // if (v && v.id != this.menuForm.id) {
      //   // 转换null为""
      //   for (let attr in v) {
      //     if (v[attr] == null) {
      //       v[attr] = '';
      //     }
      //   }
      //   let str = JSON.stringify(v)
      //   let menu = JSON.parse(str)
      //   this.menuForm = menu
      //   this.editTitle = menu.title
      // } else {
      //   this.cancelEdit()
      // }
      // if (v.length > 0) {
      //   // 转换null为""
      //   for (let attr in v[0]) {
      //     if (v[0][attr] === null) {
      //       v[0][attr] = ''
      //     }
      //   }
      //   let str = JSON.stringify(v[0])
      //   let data = JSON.parse(str)
      //   this.form = data
      //   this.editTitle = data.title
      // } else {
      //   this.cancelEdit()
      // }
    },
    cancelEdit () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      this.$refs.form.resetFields()
      delete this.form.id
      this.editTitle = ''
    },
    selectTreeEdit (v) {
      if (v.length > 0) {
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] === null) {
            v[0][attr] = ''
          }
        }
        let str = JSON.stringify(v[0])
        let data = JSON.parse(str)
        this.form.parentId = data.id
        this.form.parentTitle = data.title
      }
    },
    handleReset () {
      this.$refs.form.resetFields()
      this.form.status = 0
    },
    submitEdit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.form.id) {
            this.$Message.warning('请先点击选择要修改的节点')
            return
          }
          this.submitLoading = true
          // 避免传入null字符串
          // this.postRequest("请求路径，如/tree/edit", this.form).then(res => {
          //   this.submitLoading = false;
          //   if (res.success === true) {
          //     this.$Message.success("编辑成功");
          //     this.init();
          //     this.modalVisible = false;
          //   }
          // });
          // 模拟成功
          this.submitLoading = false
          this.$Message.success('编辑成功')
          this.modalVisible = false
        }
      })
    },
    submitAdd () {
      this.$refs.formAdd.validate(valid => {
        if (valid) {
          this.submitLoading = true
          // this.postRequest("请求路径，如/tree/add", this.formAdd).then(res => {
          //   this.submitLoading = false;
          //   if (res.success === true) {
          //     this.$Message.success("添加成功");
          //     this.init();
          //     this.modalVisible = false;
          //   }
          // });
          // 模拟成功
          this.submitLoading = false
          this.$Message.success('添加成功')
          this.modalVisible = false
        }
      })
    },
    add () {
      if (this.form.id == '' || this.form.id == null) {
        this.$Message.warning('请先点击选择一个节点')
        return
      }
      this.modalTitle = '添加子节点'
      this.showParent = true
      this.formAdd = {
        parentId: this.form.id,
        name: ''
      }
      this.modalVisible = true
    },
    addRoot () {
      this.modalTitle = '添加一级节点'
      this.showParent = false
      this.formAdd = {
        parentId: 0,
        name: ''
      }
      this.modalVisible = true
    },
    changeSelect (v) {
      this.selectCount = v.length
      this.selectList = v
    },
    delAll () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未勾选要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 条数据及其下级所有数据?',
        onOk: () => {
          let ids = ''
          this.selectList.forEach(function (e) {
            ids += e.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          // this.deleteRequest("请求路径，如/tree/delByIds/" + ids).then(res => {
          //   if (res.success === true) {
          //     this.$Message.success("删除成功");
          //     this.selectList = [];
          //     this.selectCount = 0;
          //     this.cancelEdit();
          //     this.init();
          //   }
          // });
          // 模拟成功
          this.$Message.success('删除成功')
          this.selectList = []
          this.selectCount = 0
          this.cancelEdit()
        }
      })
    }
  },
  mounted () {
    // 计算高度
    let height = document.documentElement.clientHeight
    this.maxHeight = Number(height - 287) + 'px'
    this.init()
  }
}
</script>
<style lang="less">
.house {
  .ivu-checkbox {
    height: 14px;
  }
  .ivu-tree-children {
    line-height: 36px;
    vertical-align: bottom;
  }
  .bg {
    background: #40a9ff;
    border-radius: 4px;
    padding: 10px;
    margin: 10px;
  }
  .bg2 {
    background: #fff;
    border-radius: 4px;
    height: 40px;
    line-height: 40px;
  }
  // .cell {
  // width: 22%;
  // height: 30px;
  // line-height: 30px;
  // color: #000000;
  // background: #ffffff;
  // border-radius: 10px;
  // float: left;
  // }
}
.house-title {
  font-size: 26px;
  text-align: center;
}
.search {
  .operation {
    margin-bottom: 2vh;
  }
  .select-count {
    font-size: 13px;
    font-weight: 600;
    color: #40a9ff;
  }
  .select-title {
    font-size: 12px;
    font-weight: 600;
    color: #40a9ff;
  }
  .select-clear {
    margin-left: 10px;
  }
  .page {
    margin-top: 2vh;
  }
  .drop-down {
    font-size: 13px;
    margin-left: 5px;
  }
}

.tree-bar {
  overflow: auto;
  margin-top: 5px;
}

.tree-bar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tree-bar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  // -webkit-box-shadow: inset 0 0 2px #d1d1d1;
  background: #e4e4e4;
}

.ivu-tree .ivu-tree-empty {
  margin-top: 10px;
  font-size: 12px;
}
</style>
