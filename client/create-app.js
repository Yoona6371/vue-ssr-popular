import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Meta from 'vue-meta'

import App from './App.vue'
import createStore from './store/store.js'
import createRouter from './router/router.js'

// import './assets/styles/global.styl'

Vue.use(Meta)

export default () => {
  const router = createRouter()
  const store = createStore()
  const app = new Vue({
    store,
    router,
    render: h => h(App)
  })

  return { app, router, store }
}

// 提供给服务端和客户端 创建 vue 应用的入口
// 为什么 服务器端 与 客户端 都要 渲染出 一套页面呢 ？
// 因为 在服务器端 renderToString 方法 只会把组件的基础内容渲染出来， 事件不会进行渲染
/*       所以需要 进行同构              */
// 通过同构 就可以解决服务器端发送来的页面无法执行 事件 的问题
// **同构：一套代码，在服务器端执行一次，在客户端再执行一次**

