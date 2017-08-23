import path from 'path'
import webpack from 'webpack'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

process.noDeprecation = true

const loaders = [
  {
    enforce: 'pre',
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'eslint-loader'
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: ['es2015', 'stage-0'],
      plugins: ['transform-runtime', 'add-module-exports']
    }
  }
]

module.exports = {
  entry: path.resolve('src', 'index.js'),
  output: {
    libraryTarget: 'umd',
    path: path.resolve('dist'),
    filename: 'index.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({
      compress: {
        warnings: false
      },
      mangle: true,
      sourceMap: false,
      comments: false,
      output: {
        comments: false
      }
    })
  ],
  module: {
    loaders
  }
}
