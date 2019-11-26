<template>
  <div class="card-list-item">
    <Card :bordered="false"
          dis-hover>
      <div class="card-item">
        <Row class="card-item-info">
          <Col span="5">
          <h2>
            {{iconTitle}}
          </h2>
          </Col>
          <Col span="19">
          <div class="icon-title">&nbsp;</div>
          <slot name="infoContent"></slot>
          </Col>
        </Row>
        <slot name="buttonContent"></slot>
      </div>

    </Card>
  </div>
</template>
<script>

export default {
  props: {
    iconTitle: { // icon右边的title
      type: String,
      default: ''
    }
  },
  data () {
    return {

    }
  },
  methods: {
    init () {
      console.log(this.$route.meta)
    }
  }
}
</script>
<style lang="less">
.card-list-item {
  cursor: pointer;
  .card-item {
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
      border-color: rgba(0, 0, 0, 0.09);
    }
    border: 1px solid #e8e8e8;
    .card-item-info {
      padding: 24px 32px;
      .icon-title {
        margin-bottom: 8px;
        font-size: 16px;
        white-space: nowrap;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .usercounts {
        display: flex;
        color: rgba(0, 0, 0, 0.45);
        .user-item {
          width: 50%;
          .user-title {
            font-size: 14px;
            padding-right: 0px;
            text-align: center;
            line-height: 20px;
            margin-bottom: 4px;
          }
          .user-count {
            font-size: 24px;
            text-align: center;
            line-height: 32px;
          }
        }
      }
    }
    .card-operation {
      border-top: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-around;
      list-style: none;
      background: #fafafa;
      .card-operation-item {
        border-right: 1px solid #e8e8e8;
        width: 25%;
        text-align: center;
        margin: 12px 0;
        color: rgba(0, 0, 0, 1);
        font-size: 18px;
      }
    }
  }
}
</style>
