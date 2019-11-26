<template>
  <div class="tj-list-item">
    <div class="tj-list-item-meta">
      <slot name="tj-list-item-meta-avatar"></slot>
      <div class="tj-list-item-meta-content">
        <h4 class="tj-list-item-meta-title">{{title}}</h4>
        <div class="tj-list-item-meta-description">{{desc}}</div>
        <slot name="tj-url"></slot>
      </div>
    </div>
    <div>
      <slot name="state"></slot>

    </div>

  </div>
</template>

<script>
export default {
  name: 'ListItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="less">
.tj-list-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  // padding: 12px 0px;
  .tj-list-item-meta {
    display: flex;
    align-items: flex-start;
    font-size: 0px;
    flex: 1 1 0%;
  }
  .tj-list-item-meta-avatar {
    margin-right: 16px;
  }
  .tj-list-item-meta-content {
    flex: 1 0 0%;
    margin-right: 24px;
  }
  .tj-list-item-meta-title {
    max-width: 200px;
    margin-top: 3px;
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 18px;
    line-height: 22px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }
  .tj-list-item-meta-description {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 8px;
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .tj-list-item-meta-url {
    font-size: 14px;
    line-height: 22px;
  }
  .tj-list-item-meta-title > a {
    color: rgba(0, 0, 0, 0.65);
    transition: all 0.3s ease 0s;
  }
}
</style>
