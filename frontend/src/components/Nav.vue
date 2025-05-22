<template>
  <div class="navbar">
  <el-menu
    :default-active="$route.path"
    class="el-menu-demo nav-left"
    mode="horizontal"
    text-color="#27ae60"
    active-text-color="#27ae60"
    router
  >
          <div class="logo">
    </div>
    <el-menu-item index="/">
      <router-link to="/" class="nav-link">Home</router-link>
    </el-menu-item>

    <el-sub-menu index="/workspace">
      <template #title>Workspace</template>
      <el-menu-item index="/workspace/one">
        <router-link to="/workspace/one" class="nav-link">Item One</router-link>
      </el-menu-item>
      <el-menu-item index="/workspace/two">
        <router-link to="/workspace/two" class="nav-link">Item Two</router-link>
      </el-menu-item>
      <el-menu-item index="/workspace/three">
        <router-link to="/workspace/three" class="nav-link">Item Three</router-link>
      </el-menu-item>

      <el-sub-menu index="/workspace/four">
        <template #title>Item Four</template>
        <el-menu-item index="/workspace/four/one">
          <router-link to="/workspace/four/one" class="nav-link">Item One</router-link>
        </el-menu-item>
        <el-menu-item index="/workspace/four/two">
          <router-link to="/workspace/four/two" class="nav-link">Item Two</router-link>
        </el-menu-item>
        <el-menu-item index="/workspace/four/three">
          <router-link to="/workspace/four/three" class="nav-link">Item Three</router-link>
        </el-menu-item>
      </el-sub-menu>
    </el-sub-menu>

  </el-menu>
   <el-menu
    :default-active="$route.path"
    class="el-menu-demo nav-right"
    mode="horizontal"
        text-color="#27ae60"
    active-text-color="#27ae60"
    :ellipsis="false"
    router
    >
    <el-menu-item index="/auth" class="login-item-nav">
      <router-link to="/auth" class="nav-link"><User /> Login</router-link>
    </el-menu-item>
</el-menu>
</div>

</template>

<script>
import { User } from 'lucide-vue-next'

export default {
  components: {
    User
  }
}
</script>

<style scoped>

</style>
