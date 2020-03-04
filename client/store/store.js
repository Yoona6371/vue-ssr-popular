import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default function createStore() {
  return new Vuex.Store({
    state: {
      movie: {}
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
      }
    },
    mutations: {
      // 设置state
      setMovie(state, { res }) {
        state.movie = res.id
      }
    }
  })
}
