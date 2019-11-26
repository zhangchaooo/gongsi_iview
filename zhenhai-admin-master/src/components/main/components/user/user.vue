<template>
  <div class="user-avatar-dropdown">您好，{{userName}}&nbsp;&nbsp;
    <Dropdown @on-click="handleClick">
      <Avatar :src="userAvatar" />
      <Icon :size="18"
            type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <!-- <DropdownItem name="own">个人中心</DropdownItem> -->
        <DropdownItem name="change_pass">修改密码</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvatar: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: '管理员'
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    handleClick (name) {
      switch (name) {
        case 'change_pass':
          this.$router.push({
            name: 'change_pass'
          })
          break
        case 'own':
          this.$router.push({
            name: 'ownspace_index'
          })
          break
        case 'logout':
          this.handleLogOut().then(() => {
            this.$router.push({
              name: 'login'
            })
          })
          break
      }
    }
  }
}
</script>
