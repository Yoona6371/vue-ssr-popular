<template>
  <div id="app">
    <header class="header">
      <router-link to="/home">Home</router-link>
      <router-link to="/detail">Project</router-link>
    </header>
    <h4 style="text-align: center;">欢迎来的 vue 服务端渲染</h4>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
}
</script>

<style scoped lang="stylus">
  .header
    width 100%
    height 60px
    border-bottom 1px solid #ccc
    background-color #2db6e9
    text-align center
    .title
      line-height 3
      font-size 20px
    a
      display inline-block
      height 60px
      color rgba(255, 255, 255, .8)
      line-height 60px
      transition color .15s ease
      vertical-align middle
      font-weight 300
      letter-spacing .075em
      margin-right 1.8em
      font-size 18px
      &:hover
        color #fff
      &.router-link-active
        color #fff
        font-weight 400

</style>
