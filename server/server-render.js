const ejs = require('ejs')
const LRU = require('lru-cache') // 用于设置缓存

// 设置缓存参数
const microCache = new LRU({
  max: 100, // 最大缓存数
  maxAge: 10000 //  10s过期，意味着10s内请求统一路径，缓存中都有
})

// 判断是否可以缓存，这里先模拟，当访问B就缓存
const isCacheable = ctx => {
  return ctx.url === '/home'
}


// 开发环境 和 正式环境 创建的render 的流程不一样，所以我们选择外部传入
module.exports = async (ctx, renderer, template) => {
  // 返回html内容，所以需要设置 headers
  ctx.headers['Content-Type'] = 'text/html'

  // 这个是用在服务端渲染的时候，把他传入进去的
  // VueServerRenderer 拿到这个 context 后进行 服务端路由设置等等
  const context = { url: ctx.path }


  // 判断是否可缓存，如果可缓存则先从缓存中查找
  const cacheable = isCacheable(ctx)

  if (cacheable) {
    const hit = microCache.get(ctx.url)
    if (hit) {
      console.log('取到缓存') // 便于调试
      return ctx.body = hit
    }
  }

  try {
    const appString = await renderer.renderToString(context)

    // 将meta 中的东西调用出来
    // 将 meta 里的信息inject出来
    const {
      title
    } = context.meta.inject()

    const html = ejs.render(template, {
      appString,
      style: context.renderStyles(),
      scripts: context.renderScripts(),
      title: title.text(),
      // 服务端拿到store数据后 将被序列化以后以window.__INITIAL_STATE__=/* store state */的形式插入到脚本当中
      initalState: context.renderState()
    })

    ctx.body = html

    // 存入缓存, 只有当缓存中没有 && 可以缓存
    if (cacheable) {
      console.log('设置缓存') // 便于调试
      microCache.set(ctx.url, html)
    }

  } catch (err) {
    console.log('ssr render error', err)
    throw err
  }
}
