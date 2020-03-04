<template>
  <div>
    <list></list>
    {{ movie }}
  </div>
</template>

<script>
import List from "../components/list.vue";
export default {
  name: "detail",
  metaInfo: {
    title: 'SSR | 详情页',
  },
  components: {List},

  // 定义asyncData, entry-server.js会编译所有匹配的组件中是否包含，包含则执行
  // 将state值挂在到context上，会被序列化为window.__INITIAL_STATE__
  //
  asyncData ({ store, route }) {
    // 请求电影数据， 传入 ID ： 12345
    return store.dispatch('fetchMovie', 12345)
  },
  computed: {
    movie() {
      return this.$store.state.movie
    }
  }
}
</script>

<style scoped lang="stylus">

</style>
