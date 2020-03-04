/*
* 在路由导航之前解析数据：
* 使用此策略，应用程序会等待视图所需数据全部解析之后，再传入数据并处理当前视图。
* 好处在于，可以直接在数据准备就绪时，传入视图渲染完整内容，
* 但是如果数据预取需要很长时间，用户在当前视图会感受到"明显卡顿"。
* 因此，如果使用此策略，建议提供一个数据加载指示器 (data loading indicator)。
*
* 我们可以通过检查匹配的组件，并在全局路由钩子函数中执行 asyncData 函数，来在客户端实现此策略。
* 注意，在初始路由准备就绪之后，我们应该注册此钩子，这样我们就不必再次获取服务器提取的数据。
* */

/*
* 因为入口只会在第一次进入应用时执行一次，页面的跳转不会再执行服务端数据预取的逻辑，
* 所以说我们需要客户端数据预取，
* 官网文档实现有俩种方式，这里就只尝试一种，
* 利用router的导航守卫，原理就是在每次进行跳转时，执行没有执行过的asyncData函数，
*
* */

import createApp from './create-app'

const { app, router, store } = createApp()

// 客户端的store使用store.replaceState方法同步state
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  // 添加路由钩子函数，用于处理 asyncData.
  // 在初始路由 resolve 后执行，
  // 以便我们不会二次预取(double-fetch)已有的数据。
  // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)

    // 我们只关心非预渲染的组件
    // 所以我们对比它们，找出两个匹配列表的差异组件
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    if (!activated.length) {
      return next()
    }

    // 这里如果有加载指示器 (loading indicator)，就触发
    Promise.all(activated.map(c => {
      if (c.asyncData) {
        return c.asyncData({ store, route: to })
      }
    })).then(() => {

      // 停止加载指示器(loading indicator)

      next()
    }).catch(next)
  })

  app.$mount('#app')
})
