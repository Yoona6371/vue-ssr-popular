import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default function createRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        redirect: '/home'
      },
      {
        path: '/home',
        name: 'home',
        component: () => import('../views/home.vue')
      },
      {
        path: '/detail',
        name: 'detail',
        component: () => import('../views/detail.vue')
      },
      {
        path: '*',
        component: () => import('../views/NotFound')
      }
    ]
  })
}
