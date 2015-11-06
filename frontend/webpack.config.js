'use strict';
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var _ = require('underscore');

module.exports = {

  entry: path.join(__dirname, 'scripts/entry.js'),

  output: {
    path: path.resolve(__dirname, '../public/javascript'),
    filename: 'modules.js',
    publicPath: path.resolve(__dirname, '../public/javascript')
  },

  resolve: {
    extension: ['', '.js', '.jsx', '.css'],
    root: getResolveDirectories()
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.js(x)?$/, exclude: /node_modules/, loader: 'babel?stage=0' },

      {
        test: /[\/]scripts[\/]*/,
        loader: "imports?this=>window"
      }
    ]
  }
};

function getResolveDirectories() {
  var rootFolder = __dirname;
  return [
    path.join(rootFolder, 'node_modules'),
    path.join(rootFolder, 'scripts'),
    path.join(rootFolder, 'scripts/core'),
    path.join(rootFolder, 'scripts/modules'),
    path.join(rootFolder, 'styles')
  ];
}

function isDirectory(dir) {
  return fs.lstatSync(dir).isDirectory();
}

function isFile(dir) {
  return fs.lstatSync(dir).isFile();
}
