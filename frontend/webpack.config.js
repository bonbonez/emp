'use strict';
var fs = require('fs');
var fileExists = fs.existsSync;
var mkdirp = require('mkdirp');
var path = require('path');
var webpack = require('webpack');
var React = require('react');
var renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
var _ = require('underscore');

var COMPONENT_ROOT = __dirname + '/component_repos';
var COMPONENTS = fs.readdirSync(COMPONENT_ROOT);
var COMPONENT_DIRS = COMPONENTS.map(function (comp) {
  return path.join(COMPONENT_ROOT, comp);
});

// When building a production build, this will tell React to suppress warnings.
if (process.env.BUILD_PROD) {
  process.env.NODE_ENV = 'production';
}


module.exports = {

  entry: buildEntries(),

  output: {
    path: getOutputPath(),
    filename: '[name]',
    publicPath: getOutputPath()
  },

  resolve: {
    extension: ['', '.js', '.jsx', '.css'],
    root: getResolveDirectories()
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.scss$/, loader: 'style!css!sass' },
      { test: /\.js(x)?$/, exclude: /node_modules/, loader: 'babel?stage=0' },
      { test: /\.woff(2)?$/,   loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf$/, loader: 'file' },
      { test: /\.eot$/, loader: 'file' },
      { test: /\.svg$/, loader: 'file' }
    ]
  },

  plugins: [ new webpack.DefinePlugin({
    __PROD__: JSON.stringify(JSON.parse(process.env.BUILD_PROD || 'false')),
    __TEST__: JSON.stringify(JSON.parse(process.env.BUILD_TEST || 'false')),
    __DEV__:  JSON.stringify(JSON.parse(process.env.BUILD_DEV  || 'false'))
  })
  ]
};

function buildEntries() {

  var result = {
    'entry_room.js': path.join(__dirname, 'rails_code/entry_room.js'),
    'entry_landing.js': path.join(__dirname, 'rails_code/entry_landing.js')
  }

  if (process.env.BUILD_SAMPLE) {
    result = COMPONENT_DIRS.reduce(function (entries, dir) {
      if (fileExists(path.join(dir, 'entry.js')))
        entries[dir.match(/\/([^\/]+)\/?\s*$/)[1]+'-bundle.js'] = path.join(dir, 'entry.js');

      return entries;
    }, result);
  }
  return result;
}

function getOutputPath () {
  if (!process.env.BUILD_TEST && !process.env.BUILD_SAMPLE)
    return path.resolve(__dirname, '../mywebroom/app/assets/javascripts/webpack');
  else
    return '__build__/';
}

function getResolveDirectories() {
  var rootFolder = __dirname;

  return [

    path.join(rootFolder, 'node_modules'),
    path.join(rootFolder, 'component_repos'),
    path.join(rootFolder, 'common/vendor'),
    path.join(rootFolder, 'common/lib')

  ].concat((function() {
      var folders = [];
      var directories = [
        path.join(rootFolder, 'common'),
        path.join(rootFolder, 'rails_code')
      ].concat(COMPONENT_DIRS);

      directories.forEach(function(dir){
        folders.push(dir);
        folders.push(path.join(dir, 'modules'));
        folders.push(path.join(dir, 'modules/actions'));
        folders.push(path.join(dir, 'modules/constants'));
        folders.push(path.join(dir, 'modules/stores'));
        folders.push(path.join(dir, 'modules/components'));
        folders.push(path.join(dir, 'modules/mixins'));
        folders.push(path.join(dir, 'stylesheets'));
      });

      return folders;
    }()))
}

if (!process.env.BUILD_PROD) {
  module.exports.devtool = 'source-map';
}

if (!process.env.BUILD_TEST) {
  module.exports.externals = { 'jquery' : 'jQuery', 'jquery.cookie' : 'jQuery.cookie' };
}

function isDirectory(dir) {
  return fs.lstatSync(dir).isDirectory();
}

function isFile(dir) {
  return fs.lstatSync(dir).isFile();
}
