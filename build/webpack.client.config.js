const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const baseWebpackConfig = require('./webpack.base.config')
// css样式提取单独文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// html 模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 服务端渲染用到的插件、默认生成JSON文件(vue-ssr-client-manifest.json)
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')


// 定义是否是生产环境的标志位，用于配置中
const isProd = process.env.NODE_ENV === 'production'


const devServer = {
  port: 8000,
  host: '127.0.0.1',
  // 意思是 我的服务器要起在哪一个文件夹下
  contentBase: '../dist',
  // 自动打开浏览器
  open: true,
  // 跨域代理
  // proxy: {
  //   '/api': 'http://localhost:3000'
  // }
  // overlay 是我们webpack在进行编译的时候，如果有任何的错误，就都让他显示到我们的网页上
  overlay: {
    errors: true
  },
  // 解决跨域热更替
  headers: { 'Access-Control-Allow-Origin': '*' },
  // 用于如果找不到界面就返回默认首页
  historyApiFallback: true,
  hot: true,
  hotOnly: true // 即便 HMR 不生效，浏览器也不刷新
}

const optimization = {
  // manifest 把关系相关的代码 抽离出来单独放在 runtime
  runtimeChunk: {
    name: 'runtime'
  },
  // 配置 哪些导入的模块被使用了，我们再打包哪些
  usedExports: true,
  // webpack 自动 帮助做代码分割 ( 对于同步代码 )
  splitChunks: {
    chunks: 'all', // 指 对哪些代码进行分割（异步async，所有all，同步initial）
    minSize: 0,
    // maxSize: 50000,     // 50kb lodash 1mb 会将lodash进行进一步的拆分（前提是可以进行拆分）
    minChunks: 1, // 当一个模块至少被用了多少次后 再进行代码分割
    maxAsyncRequests: 5, // 同时加载的模块数 最多是五个
    maxInitialRequests: 3, // 入口文件做代码分割最多三个
    automaticNameDelimiter: '~', // 文件生成的连接符 vendors~main.js 指在vendors这个组里，入口是main.js
    name: true, // 使下面 的filename的设置有效
    // 缓存组 把符合这个缓存组的所有模块 打包到一起
    cacheGroups: {
      vendors: {
        // 检查引入的库，是否在node_modules 里，有的话，就打包到vendors这个组里
        test: /[\\/]node_modules[\\/]/,
        priority: -10, // 打包组优先级
        name: 'vendors' // 让打包的所有的库，放到一个文件里
      }
    }
  }
}

let Plugins
if (isProd) {
  // 正式环境不需要热跟新
  Plugins = [
    // webpack4.0版本以上采用MiniCssExtractPlugin 而不使用extract-text-webpack-plugin
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].css'
    }),
  ]
} else {
  // 开发环境下才需要 热更新
  Plugins = [
    new webpack.HotModuleReplacementPlugin(),
    // 这个插件的作用是在热加载时直接返回更新文件名，而不是文件的id。
    new webpack.NamedModulesPlugin(),
  ]
}

module.exports = merge(baseWebpackConfig, {
  target: 'web',
  mode: process.env.NODE_ENV || 'development',
  output: {
    // chunkhash是根据内容生成的hash, 易于缓存,
    // 开发环境不需要生成hash，目前先不考虑开发环境，后面详细介绍 开发环境下的 devServer 不支持 chunkhash contenthash
    filename: isProd ? 'static/js/[name].[chunkhash].js' : 'static/js/[name].[hash].js',
    chunkFilename: isProd ? 'static/js/[id].[chunkhash].js' : 'static/js/[id].[hash].js'
  },
  devServer: isProd ? {} : devServer,
  optimization,
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
        // 利用mini-css-extract-plugin提取css, 开发环境也不是必须
        use: isProd
            ? [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader']
            : ['vue-style-loader', 'css-loader', 'stylus-loader']
      },
    ]
  },
  plugins: Plugins.concat([
    new HtmlWebpackPlugin({
      template: './client/index.html'
    }),

    //  当vendor模块不再改变时, 根据模块的相对路径生成一个四位数的hash作为模块id
    new webpack.HashedModuleIdsPlugin(),
    new VueSSRClientPlugin(),
  ])
})
