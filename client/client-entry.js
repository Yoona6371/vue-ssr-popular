
/*
* 重点：：：：服务器端渲染只是我们访问的第一个页面进行服务端渲染*********
* 因为入口只会在第一次进入应用时执行一次，页面的跳转不会再执行服务端数据预取的逻辑，
* 所以说我们需要客户端数据预取，
* 官网文档实现有俩种方式，这里就只尝试一种，
* 利用router的导航守卫，原理就是在每次进行跳转时，执行没有执行过的asyncData函数，
*
* */

import createApp from './create-app'

const { app, router, store } = createApp()

// 客户端的store使用store.replaceState方法同步state
// 数据的 注水 与 脱水
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  // 添加路由钩子函数，用于处理 asyncData.
  // 在初始路由 resolve 后执行，
  // 以便我们不会二次预取(double-fetch)已有的数据。
  // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
  router.beforeResolve((to, from, next) => {
    // 跳转到的页面的组件
    const matched = router.getMatchedComponents(to)
    // 离开的页面的组件
    const prevMatched = router.getMatchedComponents(from)

    // 我们只关心非预渲染的组件
    // 所以我们对比它们，找出两个匹配列表的  差异组件
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    if (!activated.length) {
      return next()
    }

    const promises = []
    // 路由当中匹配到的组件，将他的async 方法，push到一个数组中
    activated.forEach(item => {
      if (Reflect.has(item, 'asyncData')) {
        // 外层包装一个 promise 用于 promise.all 只要有一个 reject 直接500
        const promise = new Promise((resolve1) => {
          item.asyncData({
            route: to,
            store
          }).then(resolve1).catch(resolve1)
        })
        promises.push(promise)
      }
    })

    // 这里如果有加载指示器 (loading indicator)，就触发
    Promise.all(promises).then(() => {

      // 停止加载指示器(loading indicator)
      console.log('停止加载指示器(loading indicator)')
      next()
    }).catch(() => {
      next()
    })
  })

  // 服务端渲染的 模板需要包含 这个 id为 app 的节点
  app.$mount('#app')
})
