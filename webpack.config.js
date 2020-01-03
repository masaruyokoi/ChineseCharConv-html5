const path = require('path')
const webpack = require('webpack');

const src = path.join(__dirname, "src");
const dist = path.join(__dirname, "dist");

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')


module.exports = {
  context: src,
  mode: 'development',
  entry: ['./js/ctp.js'],
  output: {
    path: dist,
    filename: "ctp.min.js"
    //path: path.join(__dirname, 'public/js')
  },
  devServer: {
    contentBase: dist,
    port: 3001
  },
  module: {
    rules: [

      {test: /\.html$/, loader: "html-loader"}
    ]
  },
  plugins: [
    new UglifyJSPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new ManifestPlugin(),
  ]
};
