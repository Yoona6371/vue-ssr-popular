const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// 用于返回文件相对于根目录的绝对路径
const resolve = dir => path.resolve(__dirname, '..', dir)

// 定义是否是生产环境的标志位，用于配置中
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  entry: resolve('client/client-entry.js'),
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: isProd ? '/' : 'http://127.0.0.1:8000/'
  },
  resolve: {
    // 对于.js、.vue引入不需要写后缀
    extensions: ['.js', '.vue'],
    // 引入components、assets可以简写，可根据需要自行更改
    alias: {
      'components': resolve('src/components'),
      'assets': resolve('src/assets')
    }
  },
  devtool: isProd ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/, // 利用babel-loader编译js，使用更高的特性，排除npm下载的.vue组件
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/, // 处理图片
        use: [
          {
            loader: 'url-loader',
            options: {
              // 图片如果大于 1k 就使用 file-loader的方式打包图片
              limit: 1024,
              name: 'static/img/[name].[hash:7].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, // 处理字体
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin()
  ]
}
