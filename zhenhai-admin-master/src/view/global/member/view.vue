<template>
  <div class="page-info component">
    <Row>
      <Card class="mb-24">
        <div slot="title"
             class="c_title">查看信息
        </div>
        <Button slot="extra"
                @click="close">
          返回
        </Button>
        <Row style="padding:20px;">
          <Col :span="22">
          <detail-list title="用户信息">
            <detail-list-item term="姓名">{{form.name}}</detail-list-item>
            <detail-list-item term="昵称">{{form.nickname}}</detail-list-item>
            <detail-list-item term="性别">{{form.sex == 1?'男':'女'}}</detail-list-item>
            <detail-list-item term="手机">{{form.mobile}}</detail-list-item>
            <detail-list-item term="邮箱">{{form.email}}</detail-list-item>
            <detail-list-item term="生日">{{form.birthday}}</detail-list-item>
            <detail-list-item term="证件号">{{form.id_card}}</detail-list-item>
            <detail-list-item term="会员积分">{{form.score}}</detail-list-item>
            <detail-list-item term="注册时间">{{form.created_at}}</detail-list-item>
            <detail-list-item term="账号状态">{{form.is_real_name == 1?'已认证':'未认证'}}</detail-list-item>

          </detail-list>
          </Col>
          <Col :span="2">
          <tj-img style="margin-top:30px"
                  :src=form.head_image
                  :width='100'
                  :height='100'></tj-img>
          </Col>
        </Row>
        <Divider style="margin-bottom: 32px;" />
        <Row style="padding:20px;">
          <div class="title">房屋信息</div>
          <Table :columns="houseInfo"
                 size="large"
                 style="margin-bottom:32px;"
                 :data="form.housing"></Table>
        </Row>
        <Row style="padding:20px;">
          <div class="title">车辆信息</div>
          <Table :columns="carInfo"
                 :data="form.car_info"
                 style="margin-bottom:32px;"
                 size="large"></Table>
        </Row>

      </Card>
    </Row>
  </div>
</template>
<script>
import {
  member
} from '@/api/global/member'
import {
  DetailList, TjImg
} from '@/components/tools'
const DetailListItem = DetailList.Item
export default {
  name: 'memberView',
  components: {
    DetailList,
    DetailListItem,
    TjImg
  },
  data () {
    return {
      imga: 'http://img3.imgtn.bdimg.com/it/u=4114401242,1619558261&fm=26&gp=0.jpg',
      loading: true, // 表单加载状态
      submitLoading: false, // 表单提交状态
      form: { // 添加或编辑表单对象初始化数据
        head_image: '',
        nickname: '',
        name: '',
        is_real_name: '',
        mobile: '',
        score: '',
        created_at: ''
      },
      // 表单验证规则
      formValidate: {
      },
      carInfo: [
        // {
        //   title: '社区名称',
        //   key: 'owner_community.name'
        // },
        // {
        //   title: '地区',
        //   key: 'name'
        // },
        {
          title: '车牌',
          key: 'car_number'
        },
        {
          title: '绑定时间',
          key: 'created_at'
        }
        // {
        //   title: ' 操作',
        //   key: 'useroperate',
        //   render: (h, params) => {
        //     return h('div', [
        //       h('Icon', {
        //         props: {
        //           type: 'ios-search-outline',
        //           size: 30
        //         }
        //       })
        //     ])
        //   }
        // }
      ],
      houseInfo: [
        {
          title: '社区名称',
          key: 'owner_community.name',
          render: (h, params) => {
            return h('div', params.row.owner_community && params.row.owner_community.name)
          }
        },
        // {
        //   title: '地区',
        //   key: 'name'
        // },
        {
          title: '房屋信息',
          key: 'owner_housing_only.full_name',
          render: (h, params) => {
            return h('div', params.row.owner_housing_only && params.row.owner_housing_only.full_name)
          }
        },
        {
          title: '房屋身份',
          key: 'owner_identity.name',
          render: (h, params) => {
            return h('div', params.row.owner_identity && params.row.owner_identity.name)
          }
        },
        {
          title: '认证状态',
          key: 'audit_type',
          render: (h, params) => {
            let re = ''
            if (params.row.audit_type == 0) re = '待审核'
            if (params.row.audit_type == 2) re = '审核驳回'
            if (params.row.audit_type == 3) re = '待确认'
            if (params.row.audit_type == 4) re = '认证通过'
            return h('div', re)
          }
        }
      ]

    }
  },
  methods: {
    init () {
      this.form.id = this.$route.query.id
      this.getData()
    },
    handleReset () {
      this.$refs.form.resetFields()
    },
    getData () {
      this.loading = true
      member(this.form.id).then(res => {
        this.loading = false
        if (res) {
          this.form = res
        }
      })
    },
    close () {
      // this.$emit('close', true)
      this.$router.go(-1)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
