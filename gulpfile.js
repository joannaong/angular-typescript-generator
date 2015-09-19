/**
 * APP
 *
 * @description     Gulp file for minification and deployment
 * @file            gulpfile.js
 * @author          Joanna Ong
 * @required        gulpconfig.json
 */

'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

/**
 * config
 * @description Source paths to be used inside gulp tasks
 */
var config = {
  images: {
    src: ['./src/assets/img/**/*'],
    dest: './dist/assets/img',
    watch: ['./src/assets/img/**/*']
  },
  styles: {
    src: './src/styles/main.styl',
    dest: './dist/styles',
    watch: ['./src/styles/main.styl', './src/app/**/**/*.styl']
  },
  scripts: {
    src: ['./src/app/*.ts', './src/app/**/**/*.ts'],
    dest: './dist/scripts',
    watch: ['./src/app/*.ts', './src/app/**/**/*.ts']
  },
  templates: {
    src: ['./src/app/**/**/*.jade'],
    dest: './dist/scripts',
    watch: ['./src/app/**/**/*.jade']
  },
  html: {
    src: ['./src/index.jade'],
    dest: './dist',
    watch: ['./src/index.jade']
  }
}

/**
 * clean
 * @description Cleans the destination directory
 */
gulp.task('clean', function(cb) {
  return $.del('./dist/**', cb);
});

/**
 * images
 * @description Optimizes and copies images
 * @requires gulp-cache Skip unchanged images
 * @requires gulp-imagemin Compresses images
 */
gulp.task('images', function () {
  return gulp.src(config.images.src)
    // put back later, too slow
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(config.images.dest))
    .pipe($.size())
    .pipe(browserSync.stream());
});

/**
 * bowerStyles
 * @description Concats and minifies external styles
 * @requires gulp-main-bower-files Grabs css from bower files
 * @requires gulp-cssmin Compresses CSS
 * @requires gulp-rename Renames CSS
 */
gulp.task('bowerStyles', function () {
  return gulp.src('./bower.json')
    .pipe($.mainBowerFiles('**/*.css'))
    .pipe($.cssmin())
    .pipe($.rename('vendor.min.css'))
    .pipe(gulp.dest(config.styles.dest))
    .pipe($.size());
});

/**
 * bowerScripts
 * @description Concats and minifies external scripts
 * @requires gulp-main-bower-files Grabs js from bower files
 * @requires gulp-concat Concatenates JS
 * @requires gulp-uglify Minifies JS
 */
gulp.task('bowerScripts', function () {
  return gulp.src('./bower.json')
    .pipe($.mainBowerFiles('**/*.js'))
    .pipe($.concat('vendor.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(config.scripts.dest))
    .pipe($.size());
});

/**
 * styles
 * @description Compiles stylus files to CSS
 * @requires gulp-plumber Prevent pipe breaking caused by errors
 * @requires gulp-stylus Compiles stylus to CSS
 * @requires gulp-autoprefixer Prefix CSS
 */
gulp.task('styles', function() {
  return gulp.src(config.styles.src)
    .pipe($.plumber())
    .pipe($.stylus())
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest(config.styles.dest))
    .pipe($.size())
    .pipe(browserSync.stream());
});

/**
 * html
 * @description Compiles jade files to HTML
 * @requires gulp-plumber Prevent pipe breaking caused by errors
 * @requires gulp-jade Compiles jade files to HTML
 */
gulp.task('html', function() {
  return gulp.src(config.html.src)
    .pipe($.plumber())
    .pipe($.jade({
      locals: {
        env: ''
      }
    }))
    .pipe(gulp.dest(config.html.dest))
    .pipe($.size())
    .pipe(browserSync.stream());
});


/**
 * html2js
 * @description Pre-loads HTML code into the $templateCache
 * @requires gulp-plumber Prevent pipe breaking caused by errors
 * @requires gulp-jade Compiles jade files to HTML
 */
gulp.task('templates', function() {
  return gulp.src(config.templates.src)
    .pipe($.jade())
    .pipe($.ngHtml2js({
        moduleName: 'app.templates'
    }))
    .pipe($.concat('templates.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(config.templates.dest))
    .pipe($.size())
    .pipe(browserSync.stream());
});

/**
 * ts
 * @description Compiles ts files to js
 * @requires gulp-sourcemaps Creates sourcemaps
 * @requires gulp-typescript Compiles ts files to js
 * @requires gulp-concat Concatenates JS files
 * @requires gulp-ngAnnotate adds Angular dependency injection annotations, making it safe to minify
 * @requires gulp-uglify Minifies Angular.js files
 */
gulp.task('ts', function() {
  var tsResult = gulp.src(config.scripts.src)
    .pipe($.sourcemaps.init())
    .pipe($.typescript({
      module: 'commonjs',
      target: 'ES5'
    }));

  return tsResult.js
    .pipe($.sourcemaps.write())
    .pipe($.concat('app.js'))
    .pipe($.ngAnnotate({
      single_quotes: true
    }))
    .pipe($.uglify())
    .pipe(gulp.dest(config.scripts.dest))
    .pipe(browserSync.stream());
});

/**
 * browser-sync
 * @description Initializes a server
 * @requires browser-sync
 */
gulp.task('browser-sync', function() {
  browserSync.init({
    server: config.html.dest
  });
});

gulp.task('watch', function() {
  gulp.watch(config.images.watch, ['images']);
  gulp.watch(config.styles.watch, ['styles']);
  gulp.watch(config.html.watch, ['html']);
  gulp.watch(config.scripts.watch, ['ts']);
  gulp.watch(config.templates.watch, ['templates']);
});

/**
 * default
 * @description Builds all tasks, spins up a server and watches changed files. Run this while in development
 */
gulp.task('default', function() {
  runSequence('build', 'browser-sync', 'watch');
});

/**
 * build
 * @description Builds all tasks
 */
gulp.task('build', function() {
  runSequence(
    'clean',
    'bowerStyles',
    'bowerScripts',
    'images',
    'styles',
    'html',
    'templates',
    'ts'
  );
});

/**
 * TODO: ngdoc, jshint
 *
 */
