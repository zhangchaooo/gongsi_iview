<template>
  <div class="components-article-list-content-index-listContent">
    <div class="description">
      <slot>
        {{ description }}
      </slot>
    </div>
    <div class="extra">
      <Avatar v-if="avatar"
              :src="avatar"
              size="small" />
      {{ owner }} <a v-if="href"
         :href="href">{{ href }}</a>
      <em>{{ updateAt }}</em>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleListContent',
  props: {
    prefixCls: {
      type: String,
      default: 'components-article-list-content-index-listContent'
    },
    description: {
      type: String,
      default: ''
    },
    owner: {
      type: String
    },
    avatar: {
      type: String
    },
    href: {
      type: String
    },
    updateAt: {
      type: String
    }
  }
}
</script>

<style lang="less" scoped>
.components-article-list-content-index-listContent {
  .description {
    // max-width: 720px;
    line-height: 22px;
  }
  .extra {
    margin-top: 16px;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;

    & /deep/ .ivu-avatar {
      position: relative;
      top: 1px;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      vertical-align: top;
    }

    & > em {
      margin-left: 16px;
      color: fade(#000, 25%);
      font-style: normal;
    }
  }
}

@media screen and (max-width: 480px) {
  .components-article-list-content-index-listContent {
    .extra {
      & > em {
        display: block;
        margin-top: 8px;
        margin-left: 0;
      }
    }
  }
}
</style>
