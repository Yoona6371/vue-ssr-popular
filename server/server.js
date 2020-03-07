const path = require('path')
const Koa = require('koa')
const Router = require('koa-router')
const send = require('koa-send')
const proxy = require('koa2-proxy-middleware')

const staticRouter = require('./router/static')

const app = new Koa()
const router = new Router()

const isProd = process.env.NODE_ENV === 'production'


// 创建一个中间件 用于记录服务端的请求 和 以及去抓取一些错误
app.use(async (ctx, next) => {
  try {
    console.log(`request with path ${ctx.path}`)
    await next()
  } catch (err) {
    console.log(err)
    ctx.status = 500
    if (isProd) {
      ctx.body = 'please try again later'
    } else {
      ctx.body = err.message
    }
  }
})

// 用于处理favicon.ico
app.use(async (ctx, next) => {
  if (ctx.path === '/favicon.ico') {
    await send(ctx, '/favicon.ico', { root: path.resolve(__dirname, '../client/static') })
  } else {
    await next()
  }
})

/**
 * 使用http代理请求转发，用于代理页面当中的http请求
 * 这个代理请求得写在bodyparse的前面，
 *
 */
const options = {
  targets: {
    // (.*) means anything
    '/api/(.*)': {
      target: 'https://cnodejs.org',
      changeOrigin: true,
    }
  }
}
app.use(
    proxy(options)
)


let pageRouter
if (isProd) {
  pageRouter = require('./router/ssr')
  app.use(staticRouter.routes()).use(staticRouter.allowedMethods())
} else {
  pageRouter = require('./router/dev-ssr')
}
app.use(pageRouter.routes()).use(pageRouter.allowedMethods())

const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '3000'

app.listen(PORT, HOST, () => {
  console.log(`server is listening on ${HOST}:${PORT}`)
})
