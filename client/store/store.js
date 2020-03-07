import Vue from 'vue'
import Vuex from 'vuex'

import axios from '../../action/request'

Vue.use(Vuex)

export default function createStore() {
  return new Vuex.Store({
    state: {
      movie: {},
      list: {}
    },
    actions: {
      // 通过传入id请求电影数据，这里我们模拟一下，先返回id
      fetchMovie({ commit }, id) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({ id })
          }, 500)
        }).then(res => {
          commit('setMovie', { res })
        })
      },
      getList({commit}) {
        // https://cnodejs.org/api/v1/topics
        return axios.get('/api/v1/t00opics')
            .then(res => {
              const list = res.data
              commit('getList', list)
            })
      }
    },
    mutations: {
      // 设置state
      setMovie(state, { res }) {
        state.movie = res.id
      },

      getList(state, res) {
        state.list = res
      }
    }
  })
}
