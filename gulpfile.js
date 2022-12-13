var argv = require('yargs').argv;
var autoprefixer = require('gulp-autoprefixer');
var bump = require('gulp-bump');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var footer = require('gulp-footer');
var fs = require('fs');
var git = require('gulp-git');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var header = require('gulp-header');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var manifest = require('gulp-manifest');
var map = require('map-stream');
var merge = require('merge-stream');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass')(require('sass'));
var svgsprite = require('gulp-svg-sprite');
var uglify = require('gulp-uglify');

var node;

// Custom handler on a task fatal error
var customErrorHandler = function (error) {

  gutil.log(gutil.colors.red("Fatal error on the task \"" + error.plugin + "\"!!"));
  gutil.log(gutil.colors.red(error.message));
  gutil.log(gutil.colors.red(error.fileName + " at line " + error.lineNumber));

};

// Report the JSHint error a specific way
var customJshintReporter = function (notice) {

  return map(function (file, callback) {

    if (file.jshint && !file.jshint.success) {

      file.jshint.results.forEach(function (err) {

        if (err) {

          var error = file.jshint.results[0].error;
          var string = gutil.colors.red(error.reason) + " (" + error.code + ") line: " +
            gutil.colors.magenta(error.line) + " / col: " + gutil.colors.magenta(error.character);

          gutil.log(gutil.colors.red(file.jshint.results[0].file));
          gutil.log(string);

        }

      });

      if (notice !== true) {
        process.exit(1);
      }

    }

    callback(null, file);

  });

};

// Log processing mode
gulp.environnement = argv.env || 'dev';
gulp.filter = argv.filter || 'updated';
gulp.target = gulp.filter === 'dev' ? 'build/' : 'dist/';

if (argv.tasksSimple !== true) {

  gutil.log(gutil.colors.red('Environnement mode:'), gulp.environnement);
  gutil.log(gutil.colors.red('Filter mode:       '), gulp.filter);

}

//
// Application tasks
//

// Copy necessary files to the target folder
gulp.task('copy', function () {

  // @TODO add copied files

  gulp.src('sources/assets/**/*')
    .pipe(gulp.dest('dist/assets/'));

  gulp.src('sources/static/**/*')
    .pipe(gulp.dest('dist/static/'));

  gulp.src('sources/font/**/*')
    .pipe(gulp.dest('dist/static/'));

});

// Process JavaScript files
gulp.task('javascript', function () {

  // Process front sources javascript files:
  // - Verify code with JSHint
  // - Minify if in production mode
  // - @TODO add sourcemap
  return gulp.src([
      'bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-animate/angular-animate.js',
      'sources/javascript/controllers.js',
      'sources/javascript/core/util/**/*',
      'sources/javascript/core/parameters/**/*',
      'sources/javascript/core/run/**/*',
      'sources/javascript/core/directive/**/*',
      'sources/javascript/core/factory/**/*',
      'sources/javascript/core/filter/**/*',
      'sources/javascript/character/**/*',
      'sources/javascript/skill/**/*'
    ])
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    // .pipe(jshint('.jshintrc'))
    .pipe(concat('app.js'))
    // .pipe(customJshintReporter(true))
    .pipe(gulpif(argv.env === 'prod', uglify({
      compress: {
        drop_debugger: false
      }
    })))
    .pipe(gulp.dest(gulp.target + 'javascript/'));

});

// Process CSS files
gulp.task('css', function () {

  gulp.src([
      'bower_components/html5-boilerplate/dist/css/normalize.css',
      'bower_components/html5-boilerplate/dist/css/main.css'
    ])
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    .pipe(concat('lib.css'))
    .pipe(autoprefixer(
      'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'opera 12.1', 'ios 6', 'Android 4',
      'iOS 6', 'iOS 7', 'iOS 8'
    ))
    .pipe(gulpif(gulp.environnement === 'prod', minifycss()))
    .pipe(gulp.dest(gulp.target + 'css/'));

  // Process sources css files:
  // - Autoprefixer
  // - Minify if in production mode
  // - @TODO verify code with CSSLint
  // - @TODO switch to SAS
  // - @TODO add sourcemap
  return gulp.src([
      'sources/css/**/*'
    ])
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    .pipe(sass())
    .pipe(concat('index.css'))
    .pipe(autoprefixer(
      'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'opera 12.1', 'ios 6', 'Android 4',
      'iOS 6', 'iOS 7', 'iOS 8'
    ))
    .pipe(gulpif(gulp.environnement === 'prod', minifycss()))
    .pipe(gulp.dest(gulp.target + 'css/'));

});

// Process images
gulp.task('image', function () {

  // Process image files:
  // - Minify images
  gulp.src('sources/image/**/*')
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    .pipe(gulpif(gulp.filter === 'updated', changed(gulp.target + 'image/')))
    .pipe(imagemin({
      optimizationLevel: 7,
      progressive: true,
      interlaced: false
    }))
    .pipe(gulp.dest(gulp.target + 'image/'));

  // Process SVG icons
  // - Sprite all the svg images
  // - @TODO minify the svg file generated
  gulp.src('sources/icon/**/*')
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    .pipe(svgsprite({
      shape: {
        id: {
          generator: 'svgicon-%s'
        },
      },
      mode: {
        symbol: {
          dest: "",
          sprite: "icons.svg",
          prefix: "svgicon-"
        }
      }
    }))
    // .pipe(svgmin())
    .pipe(gulp.dest(gulp.target + 'static/'));

  return gulp;

});

// Manage HTML files
gulp.task('html', function () {

  // Process the index file
  // - @TODO minify the HTML
  gulp.src('sources/index.html')
    .pipe(header(fs.readFileSync('sources/html/header.html', 'utf-8')))
    .pipe(footer(fs.readFileSync('sources/html/footer.html', 'utf-8')))
    .pipe(gulp.dest(gulp.target + ''))
    .pipe(concat('offline.html'))
    .pipe(gulp.dest(gulp.target + ''));

  gulp.src('sources/html/views/**/*')
    .pipe(gulp.dest(gulp.target + 'views/'))
    .pipe(connect.reload());

});

// Create the cache manifest
gulp.task('manifest', function () {

  return gulp.src(['dist/**/*'], {
      base: './dist/'
    })
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['*'],
      filename: 'app.manifest',
      exclude: ['app.manifest', 'index.html'],
      fallback: ['/ /offline.html'],
      timestamp: false
    }))
    .pipe(gulp.dest('dist'));

});

//
// Integrity tasks
//

// Generate the JavaScript documentation
gulp.task('doc', function () {

});

// Code validation
gulp.task('validate', function () {

  gulp.src('sources/javascript/**/*')
    .pipe(jshint())
    .pipe(customJshintReporter());

  return gulp;

});

// Unit tests
gulp.task('unit', function () {

  // @TODO write unit test

});

// Watch task - compile the project on the fly
gulp.task('watch', ['install'], function () {

  gulp.watch('sources/assets/**/*', ['copy']);
  gulp.watch('sources/css/**/*', ['css']);
  gulp.watch('sources/javascript/**/*', ['javascript']);
  gulp.watch('sources/image/**/*', ['image']);
  gulp.watch('sources/icon/**/*', ['image']);
  gulp.watch('sources/html/**/*', ['html']);
  gulp.watch('sources/index.html', ['html']);
  gulp.watch('sources/**/*', ['manifest']);

  return gulp;

});

gulp.task('server', function () {

  connect.server({
    root: 'dist',
    livereload: true,
    port: 80
  });
});
// Execute code testing actions
gulp.task('test', ['validate', 'unit'], function () {});

// Default task - installation shortcut
gulp.task('default', ['watch', 'server'], function () {});

// Install the project
gulp.task('install', ['javascript', 'css', 'image', 'copy', 'html', 'doc'], function () {
  return gulp.start('manifest');
});

// Bump to a specific revision. Listen to --major, --minor or --prerelease parameter
gulp.task('bump', function () {

  var params = {};
  if (argv.major) {
    params.type = 'major';
  } else if (argv.minor) {
    params.type = 'minor';
  } else if (argv.prerelease) {
    params.type = 'prerelease';
  } else {
    params.type = 'patch';
  }

  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump(params))
    .pipe(gulp.dest('./'));

});

// Bump to and release a new version of the application. Listen to --major, --minor or --prerelease parameter
gulp.task('release', ['bump'], function () {

  var pkg = require('./package.json');
  var v = 'v' + pkg.version;
  var message = 'Bump to revision ' + v;

  /*return gulp.src('./')
=======
  return gulp.src('./')
>>>>>>> a4979f9fa25486a3c0bcaeb7c73c1a811e550736
    .pipe(git.add())
    .pipe(git.commit(message))
    .pipe(git.tag(v, message))
    .pipe(git.push('origin', 'master', '--tags'))
<<<<<<< HEAD
    .pipe(gulp.dest('./'));*/
  return gulp;
});

process.on('exit', function () {
  if (node) {
    node.kill();
  }
});
