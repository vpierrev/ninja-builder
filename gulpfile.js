const argv = require('yargs').argv;
const autoprefixer = require('gulp-autoprefixer');
const changed = require('gulp-changed');
const concat = require('gulp-concat');
const exec = require('child_process').exec;
const footer = require('gulp-footer');
const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const header = require('gulp-header');
const imagemin = require('gulp-imagemin');
const jshint = require('gulp-jshint');
const manifest = require('gulp-manifest');
const map = require('map-stream');
const minifycss = require('gulp-minify-css');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass')(require('sass'));
const strip = require('gulp-strip-comments');
const svgsprite = require('gulp-svg-sprite');
const uglify = require('gulp-uglify');

let node;
let newProcess;

// Custom handler on a task fatal error
const customErrorHandler = function (error) {

  gutil.log(gutil.colors.red("Fatal error on the task \"" + error.plugin + "\"!!"));
  gutil.log(gutil.colors.red(error.message));
  gutil.log(gutil.colors.red(error.fileName + " at line " + error.lineNumber));

};

// Report the JSHint error a specific way
const customJshintReporter = function (notice) {

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
gulp.target = 'static/';

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
    .pipe(gulp.dest('static/assets/'));

  gulp.src('sources/static/**/*')
    .pipe(gulp.dest('static/static/'));

  gulp.src('sources/font/**/*')
    .pipe(gulp.dest('static/static/'));

});

// Process JavaScript files
gulp.task('javascript', function () {

  // Process front sources javascript files:
  // - Verify code with JSHint
  // - Minify if in production mode
  // - @TODO add sourcemap
  return gulp.src([
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-animate/angular-animate.js',
      'sources/javascript/**/*.js'
    ])
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    .pipe(concat('app.js'))
    .pipe(gulpif(argv.env === 'prod', uglify({
      compress: {
        drop_debugger: false
      }
    })))
    .pipe(strip())
    .pipe(gulp.dest(gulp.target + 'javascript/'));

});

// Process CSS files
gulp.task('css', function () {

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
    .pipe(gulp.dest('views'))
    .pipe(concat('offline.html'))
    .pipe(gulp.dest('views'));

  gulp.src('sources/html/views/**/*')
    .pipe(gulp.dest(gulp.target + 'views/'));

});

// Create the cache manifest
gulp.task('manifest', function () {

  return gulp.src(['static/**/*'], {
      base: './static/'
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
    .pipe(gulp.dest('static'));

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

  newProcess = exec('node main.js');
  newProcess.stdout.pipe(process.stdout);
  newProcess.stderr.pipe(process.stderr);
});
// Execute code testing actions
gulp.task('test', ['validate', 'unit'], function () {});

// Default task - installation shortcut
gulp.task('default', ['watch', 'server'], function () {});

// Install the project
gulp.task('install', ['javascript', 'css', 'image', 'copy', 'html', 'doc'], function () {
  return gulp.start('manifest');
});

process.on('exit', function () {
  if (newProcess) {
    newProcess.kill();
  }
  if (node) {
    node.kill();
  }
});
