// 这里 对应第一中 方式的 热更新
// 不需要 koa2 + webpack 实现 热更新
// 方法非常巧妙，哈哈哈哈哈哈哈哈哈哈哈

// 相比于 第一种方法，这种方法实现热跟新，只需要在客户端启动 devSever
// 在服务端监听 server 的打包文件即可
const Router = require('koa-router')
const axios = require('axios')
const path = require('path')
const fs = require('fs')

const MemoryFs = require('memory-fs')
const webpack = require('webpack')
const VueServerRenderer = require('vue-server-renderer')

const serverRender = require('../server-render.js')
const serverConfig = require('../../build/webpack.server.config')
// 在node中将webpack 跑起来
const serverCompiler = webpack(serverConfig)
const mfs = new MemoryFs()
// 将 编译的webpack 输出到内存中，不让其写入磁盘
serverCompiler.outputFileSystem = mfs

// bundle 用于记录我们webpack 每次打包生成的文件
let bundle

serverCompiler.watch({}, (err, stats) => {
  // 反映的是 webpack 打包的错误
  if (err) throw err

  // 对于不是打包的错误，比如
  // eslint的错误我们通过stats去发现
  stats = stats.toJson()
  stats.errors.forEach(err => console.log(err))
  stats.warnings.forEach(warn => console.warn(warn))

  const bundlePath = path.resolve(
      serverConfig.output.path,
      'vue-ssr-server-bundle.json'
  )
  // 读出来的是一个字符串 但是 vue server rounder 使用的是一个json
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('服务端打包完成')
})

const handleSSR = async (ctx) => {
  if (!bundle) {
    ctx.body = '你等一会，别着急....'
    return
  }

  // 获取客户端 devServer(启动的HMR) 帮我们打包 出来的 客户端的ssr文件(包含我们通过webpack-dev-server 打包出来的所有静态文件的路劲)
  // 两个单独的 server
  const clientManifestResp = await axios.get(
      'http://127.0.0.1:8000/vue-ssr-client-manifest.json'
  )
  const clientManifest = clientManifestResp.data


  const template = fs.readFileSync(
      path.resolve(__dirname, '../server.template.ejs'),
      'utf-8'
  )

  const renderer = VueServerRenderer
      .createBundleRenderer(bundle, {
        // 不指定 template ，因为限制会很大，有一些功能无法使用
        // 所以 inject 为 false，不要帮我们 注入
        inject: false,
        // 引用到客户端 的js等文件，这样不会只返回一个 空的html
        clientManifest
      })

  await serverRender(ctx, renderer, template)
}

const router = new Router()
// 所有的请求都通过这个 router 处理
router.get('*', handleSSR)

module.exports = router
