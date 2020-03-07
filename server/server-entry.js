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

    if (context.url.indexOf('/api') !== -1) {
      resolve()
      return
    }

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      // 我们可以通过 router.getMatchedComponents() 此方法 获得与 当前路由 匹配的组件数组
      const matchedComponents = router.getMatchedComponents()

      // 匹配不到的路由，执行 reject 函数，并返回 信息
      if (!matchedComponents.length) {
        console.log(context.url, '   url');
        // console.log(context);
        return reject(new Error('no component matched, 404'))
      }

      const promises = []
      // 路由当中匹配到的组件，将他的async 方法，push到一个数组中
      matchedComponents.forEach(item => {
        if (Reflect.has(item, 'asyncData')) {
          // 外层包装一个 promise 用于 promise.all 只要有一个 reject 直接500
          const promise = new Promise((resolve1) => {
            item.asyncData({
              route: router.currentRoute,
              store
            }).then(resolve1).catch(resolve1)
          })
          promises.push(promise)
        }
      })

      // 要等所有的数据获取完再执行
      Promise.all(promises).then(() => {
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
