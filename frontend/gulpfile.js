var gulp         = require('gulp');
var concat       = require('gulp-concat');
var prefix       = require('gulp-autoprefixer');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var less         = require('gulp-less');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var watch        = require('gulp-watch');
var size         = require('gulp-size');
var cache        = require('gulp-cached');
var csswring     = require('csswring');
var replace      = require('gulp-replace');
// var babel        = require('gulp-babel');
// Should be run with following options:
// .pipe(babel({ blacklist: ["strict"] }))
//
// babeljs is VERY slow: 13s vs 2.14s for traceur.
//
// I do like the code it produces, though. And the fact that there is no need
// to load additional runtime file for eveything to work. But for interactive
// development, traceur offers speed, wich is a must.
var traceur      = require('gulp-traceur');
var os           = require('os');
var fs           = require('fs');
var path         = require("path");
var del          = require('del');
var glob         = require('glob');
var fingerprint  = require('gulp-fingerprint');
var Notification = require('node-notifier');

var notifier = new Notification();

var handleError = function(title, err) {
  notifier.notify({
    "title": "Bookmate",
    "subtitle": title,
    "message": err
  });
  console.error(err);
};

var manifest;
var files = glob.sync('../public/pipeline/manifest-*.json');
var rails_manifest_file = files[0];
var rails_manifest = rails_manifest_file ? require(rails_manifest_file) : {assets: {}};
var manifest = rails_manifest.assets;
var rails_env = process.env.RAILS_ENV;
var assets_pipeline_prefix = '/pipeline/';

var assets_host;
if ('production' == rails_env) {
  assets_host = 'https://assets.bookmate.com'
}
else if ('staging' == rails_env) {
  assets_host = 'http://' + os.hostname().replace(/app/, 'assets');
}
else {
  assets_host = '';
}

var paths = {
  styles: ['styles/**/*.less'],
  // Order is important!
  vendor: [
    // this is a file form traceur.RUNTIME_PATH
    'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
    'scripts/core/vendor/braintree.js',
    'scripts/core/vendor/braintree-data.js',
    'scripts/core/vendor/console.js',
    'scripts/core/vendor/cookies.js',
    'scripts/core/vendor/jquery-2.1.1.min.js',
    'scripts/core/vendor/jquery.easing.js',
    'scripts/core/vendor/tap.js',
    'scripts/core/vendor/jquery.autoellipsis.min.js',
    'scripts/core/vendor/json2.js',
    'scripts/core/vendor/moment.min.js',
    'scripts/core/vendor/mustache.js',
    'scripts/core/vendor/radio.js',
    'scripts/core/vendor/ymodules.js',
    'scripts/core/vendor/zautosize.js',
    'scripts/core/vendor/zjquery.ellipsis.js',
    'scripts/core/vendor/twemoji.min.js',

    'scripts/core/namespace/*.js',
    'scripts/core/configs/*.js',
    'scripts/core/tools/*.js',
    'scripts/core/features/*.js',
    'scripts/core/user/*.js',
    'scripts/core/**/*.js'
  ],
  modules: [
    //'javascripts/dev/modules/**/*.js',

    // Somewhat safe to load
    'scripts/modules/**/*.js',

    // Loaders
    'scripts/loader/loadScriptsConfig.js',
    'scripts/loader/loadScripts.js',
    'scripts/loader/initApp.js'
  ]
};

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

var versionTaskInProgress = false;
gulp.task('version', function(){
  if (versionTaskInProgress) {
    return;
  }
  versionTaskInProgress = true;
  var sys = require('sys')
  var exec = require('child_process').exec;
  function puts(error, stdout, stderr) { sys.puts(stdout); versionTaskInProgress = false; }
  var version_detect_cmd = '(cat ../REVISION) || echo devrev'
  var command = 'filename="../config/frontend_version.yml";' +
    'rm -f ../config/frontend_version.yml;' +
    'printf \'version: "\'>> $filename \r;' +
    'res=$(' +
    version_detect_cmd +
    ');' +
    'printf $res >> $filename \r;' +
    'printf \'"\' >> $filename \r;';
  exec(command, puts);
});

gulp.task('styles', function() {
  var assets_pipeline_options = {
    prefix: assets_host + assets_pipeline_prefix,
    base: assets_pipeline_prefix,
    verbose: false
  };

  return gulp.src('styles/global.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(fingerprint(manifest, assets_pipeline_options))
    .on('error', function(err) {
      handleError('LESS error', err);
    })
    // There is a bug with postcss:
    // https://github.com/ck86/main-bower-files/issues/28
    // https://github.com/floridoo/gulp-sourcemaps/issues/37
    // https://github.com/sindresorhus/gulp-autoprefixer/issues/2
    // https://github.com/sindresorhus/gulp-autoprefixer/pull/3
    // https://github.com/w0rm/gulp-postcss/issues/4
    .pipe(postcss([
      autoprefixer//,
      // csswring({
      //   preserveHacks: true,
      //   removeAllComments: true
      // })
    ]))
    //.pipe(size({title: 'styles.css'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("../public/styles"));
});

gulp.task('styles-local', function() {
  return gulp.src('styles/global.less')
    .pipe(less())
    .on('error', function(err) {
      handleError('LESS error', err);
    })
    .pipe(postcss([
      autoprefixer
    ]))
    .pipe(gulp.dest("../public/styles"));
});

gulp.task('watch', ['version'], function() {
  gulp.watch(paths.vendor, { interval: 500 }, ['vendor', 'version']);
  gulp.watch(paths.modules, { interval: 500 }, ['modules', 'version']);
  gulp.watch(paths.styles, { interval: 500 }, ['styles', 'version']);
});

gulp.task('watch-local', ['version'], function() {
  gulp.watch(paths.vendor, ['vendor-local', 'version']);
  gulp.watch(paths.modules, ['modules-local', 'version']);
  gulp.watch(paths.styles, ['styles-local', 'version']);
});

gulp.task('vendor', function() {
  return gulp.src(paths.vendor)
    .pipe(sourcemaps.init())
    .pipe(concat('core.js'))
    .pipe(uglify())
    .pipe(size({title: 'core.js'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('../public/javascript'));
});

gulp.task('vendor-local', function() {
  return gulp.src(paths.vendor)
    .pipe(concat('core.js'))
    .pipe(size())
    .pipe(gulp.dest('../public/javascript'));
});

gulp.task('modules', function() {
  return gulp.src(paths.modules)
    .pipe(sourcemaps.init())
    .pipe(traceur({modules:'inline'}))
    .pipe(concat('modules.js'))
    .pipe(uglify({
      compress: {
        drop_debugger: false
      }
    }))
    .on('error', function(err) {
      handleError('Uglify error', err);
    })
    .pipe(size({title: 'modules.js'}))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('../public/javascript'));
});

gulp.task('modules-local', function() {
  return gulp.src(paths.modules)
    .pipe(traceur({modules:'inline'}))
    .on('error', function(err) {
      handleError('JS error', err);
    })
    .pipe(concat('modules.js'))
    .pipe(gulp.dest('../public/javascript'));
});

gulp.task('default', ['watch', 'styles', 'vendor', 'modules']);
gulp.task('build', ['version', 'styles', 'vendor', 'modules']);
gulp.task('local', ['watch-local']);
gulp.task('build-local', ['version', 'styles-local', 'vendor-local', 'modules-local']);
