const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const _DEV_ = process.env.NODE_ENV === 'dev';

const ENTRY = path.join(__dirname);
const OUTPUT = path.join(__dirname);
const BUNDLE_FILENAME = path.join(ENTRY, 'example.js');
const TEMPLATE_ENTRY = path.join(ENTRY, 'template.html');
const TEMPLATE_FILENAME = path.join(OUTPUT, 'index.html');

module.exports = {
  devServer: {
    contentBase: ENTRY,
    compress: true,
    port: 9000
  },
  devtool: 'source-map',
  entry: BUNDLE_FILENAME,
  output: {
    path: OUTPUT,
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Dool-DOM Example',
      template: TEMPLATE_ENTRY,
      filename: TEMPLATE_FILENAME,
      inject: true
    }),
    new webpack.DefinePlugin({
      _DEV_
    })
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};
