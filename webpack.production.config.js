const path = require('path')
const webpack = require('webpack');

const src = path.join(__dirname, "src");
const dist = path.join(__dirname, "dist");

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const UglyfyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
//const CompressionPlugin = require('compression-webpack-plugin');





module.exports = {
  context: src,
  mode: 'production',
  entry: ['./js/ctp.js'],
  output: {
    path: dist,
    filename: "ctp.min.js"
  },
  module: {
    rules: [
      {test: /\.html$/, loader: "html-loader"},
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {test: /\.(gif|png|jpe?g|)$/, use: 'url-loader'}
    ]
  },
  plugins: [
    new UglifyJSPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new ManifestPlugin(),
    new WebpackCleanupPlugin(),
    //new CompressionPlugin({ test: /\.js$/, filename: '[path]' }),
    new WebpackS3Plugin({
      s3Options: {
        accessKeyId: '',
	secretAccessKey: '',
	region: '',
      },
      s3UploadOptions: {
        Bucket: '',
	ContentEncoding: 'gzip',
      },
      cloudfrontInvalidateOptions: {
        DistributionId: '',
	Items: ['/*']
      },
    })
  ],
  optimization: {
    minimizer: [ new UglifyjsWebpackPlugin() ],
  }
};
