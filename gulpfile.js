// Gulp setup
const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins({
  postRequireTransforms: {
    sass: function(sass) {
      return sass(require('sass'));
    }
  }
});

// Styles setup
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// JS setup
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

// General setup
const del = require('del');
const { resolve } = require('path');

// Build SCSS
function styles() {
  return src('src/styles/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer(),
      cssnano({ safe: true, autoprefixer: false })
    ]))
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('public/dist/styles'));
};

// Build JS (using Webpack)
function scripts() {
  return src([
    'src/index.js'
  ])
    .pipe($.plumber())
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(dest('public/dist/scripts'));
};

// Lint JS files
const lintBase = files => {
  return src(files)
    .pipe($.eslint({ parser: '@babel/eslint-parser', fix: true }))
    .pipe($.eslint.format())
};
function lint() {
  return lintBase('src/scripts/**/*.js')
    .pipe(dest('src/scripts'));
}

// Build SVG sprite for icons
function svgIcons() {
  return src('src/svg-icons/**/*.svg')
    .pipe($.svgSprite({
      mode: {
        symbol: {
          render: {
            css: false,
            scss: false
          },
          dest: '.',
          sprite: 'icons.svg',
          example: true
        }
      }
    }))
    .pipe(dest('public/dist/svg-icons'));
}

// Minify images
function images() {
  return src('src/images/**/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('public/dist/images'));
}

// Deploy font files
function fonts() {
  return src(['src/fonts/**/*.{eot,svg,ttf,woff,woff2,otf}', 'node_modules/bootstrap-icons/font/**/*.{woff,woff2}'])
    .pipe(dest('public/dist/fonts'));
}


// Clean the build directory
function clean() {
  return del(['public/dist']);
}

// Measure the build size
function measureSize() {
  return src('public/dist/**/*')
    .pipe($.size({ title: 'build', gzip: true }));
}

// Watches frontend files and rebuilds when they're updated
async function watchFrontendFiles() {
  watch('src/styles/**/*.scss', styles);
  watch('src/index.js', scripts);
  watch('src/scripts/**/*.js', scripts);
  watch('src/vue/vue.js', scripts);
  watch('src/vue/api.js', scripts);
  watch('src/vue/**/*.vue', scripts);
  watch('src/vue/**/*.js', scripts);
  watch('src/images/**/*', images);
  watch('src/svg-icons/**/*.svg', svgIcons);
  watch('src/fonts/**/*', fonts);
}


async function runServer() {
  $.express.run(['server.js']);
}

// Task "build": Build the frontend (only the files used by the web project)
const build = series(
  clean,
  lint,
  parallel(styles, scripts, images, svgIcons, fonts),
  measureSize
);

// Task "watch": Build the frontend, and rebuild frontend whenever source files are updated
const buildWatch = series(
  build,
  watchFrontendFiles
);

const develop = parallel(
  buildWatch,
  runServer
);

// Export the tasks
exports.build = build;
exports.buildWatch = buildWatch;
exports.develop = develop;
exports.default = build;