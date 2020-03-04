import createApp from '../client/create-app'

// 接收 参数就是 renderToString 中的参数 context
export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，
  // 就已经准备就绪

  return new Promise((resolve, reject) => {
    const {app, router, store} = createApp()

    // 服务端 主动的推一个路由，这样才能匹配到调用的组件
    router.push(context.url)
        .catch(err => {
          reject(err)
        })

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      // 我们可以通过 router.getMatchedComponents() 此方法 获得与 当前路由 匹配的组件数组
      const matchedComponents = router.getMatchedComponents()

      // 匹配不到的路由，执行 reject 函数，并返回 信息
      if (!matchedComponents.length) {
        return reject(new Error('no component matched'))
      }

      Promise.all(matchedComponents.map(component => {
        // 通过匹配到的实例, 可以调用实例的任何属性和方法
        // 调用asyncData(), 还可以传参数
        if (component.asyncData) {
          // 组件中 定义asyncData, entry-server.js会编译所有匹配的组件中是否包含，包含则执行 asyncData
          // 将state值挂在到context上，vue-server-renderer会将state序列化为window.__ INITIAL_STATE __
          return component.asyncData({
            route: router.currentRoute,
            store
          })
        }
      })).then(data => {
        context.meta = app.$meta()
        context.state = store.state
        resolve(app)
      })
      // 这里的resolve(app) 要等获取玩数据在resolve()
      // vue服务端渲染时，使用meta的方式
      // context.meta = app.$meta()
      // resolve(app)
    }, err => {
      reject(err)
    })
  })
}
