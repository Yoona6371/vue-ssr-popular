const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseWebpackConfig = require('./webpack.base.config.js')
const VueServerPlugin = require('vue-server-renderer/server-plugin')

// 关于服务器端webpack的配置可以不进行修改，因为它的功能最后只打包出一个JSON文件，并不需要针对环境做一些改变。
// 不需要关心是开发环境还是 正式环境，不需要对代码进行压缩优化，只要能在 node 端跑起来就行

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  target: 'node',
  devtool: 'source-map',
  entry: path.resolve(__dirname, '../server/server-entry.js'),
  output: {
    // node 端都是 commonjs2规范 exports
    libraryTarget: 'commonjs2',
    // node 端，不需要浏览器的缓存（hash）
    filename: 'server-bundle.js',
    path: path.resolve(__dirname, '../server-build')
  },
  // 这里有个坑... 服务端也需要编译样式，但不能使用mini-css-extract-plugin，
  // 因为它会使用document，但服务端并没document，导致打包报错。
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
        use: ['vue-style-loader', 'css-loader', 'stylus-loader']
      }
    ]
  },
  // 不要外置化 webpack 需要处理的依赖模块
  // 利用 webpack-node-externals 忽略 Webpack 对指向 node_modules 的 require 或 import 语句
  // webpack 对 node_modules 编译时，只需要将所有 require 代码进行合并，
  // 不需要执行任何 loader，也不需要压缩，不需要 TreeShaking，
  // 因为这些在组件代码编译时全部已经做好了，这种构建效率几乎达到最大。
  // 可以require 不需要打包
  externals: nodeExternals({
    // 白名单 node_modules 中不忽略的文件
    whitelist: /\.css$/
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"server"'
    }),
    // 默认文件名为 `vue-ssr-server-bundle.json`
    new VueServerPlugin()
  ]
})

