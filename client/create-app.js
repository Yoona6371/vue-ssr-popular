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
