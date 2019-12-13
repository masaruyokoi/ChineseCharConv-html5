const path = require('path')
const webpack = require('webpack');

const src = path.join(__dirname, "src");
const dist = path.join(__dirname, "dist");

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
  context: src,
  mode: 'development',
  entry: './src/js/ctp.js',
  output: { 
    filename: 'ctp.js',
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
      {
      	test: /\.js$/, loader: "babel-loader", exclude: /node_modules/,
	query: { presets: [ ["env", {"targets": {"node": "curent"}}] ] }
      },
      {test: /\.html$/, loader: "html-loader" }
    ]
  },
  plugins: [
    new UglifyJSPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ]
};
